import sql, { ConnectionPool, ISqlTypeFactoryWithNoParams } from "mssql";
import { getAppEnv } from "../config/env";
import { getGlobalDbPool, getLocalDbPool } from "../config/database";
import { logger } from "../utils/logger";

type SyncAction = "INSERT" | "UPDATE" | "DELETE" | "UPSERT";

type SyncLogRow = {
  ID: number;
  TableName: string;
  ActionType: SyncAction;
  RecordID: string;
  ThoiGian: Date;
  Node: string;
  TrangThai: string;
};

type TableConfig = {
  primaryKey: string;
  primaryKeyKind: "string" | "number";
};

const TABLE_CONFIGS: Record<string, TableConfig> = {
  ChiNhanh: { primaryKey: "MaChiNhanh", primaryKeyKind: "string" },
  PhongBan: { primaryKey: "MaPhongBan", primaryKeyKind: "string" },
  ChucVu: { primaryKey: "MaChucVu", primaryKeyKind: "string" },
  LoaiHopDong: { primaryKey: "MaLoaiHopDong", primaryKeyKind: "string" },
  NhanVien: { primaryKey: "MaNhanVien", primaryKeyKind: "string" },
  HopDong: { primaryKey: "MaHopDong", primaryKeyKind: "string" },
  ChamCong: { primaryKey: "MaChamCong", primaryKeyKind: "number" },
  NghiPhep: { primaryKey: "MaNghiPhep", primaryKeyKind: "number" },
  Luong: { primaryKey: "MaLuong", primaryKeyKind: "number" },
  Users: { primaryKey: "Username", primaryKeyKind: "string" },
};

function quoteIdentifier(identifier: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }

  return `[${identifier}]`;
}

function buildPrimaryKeyValue(recordId: string, kind: "string" | "number") {
  if (kind === "number") {
    const numeric = Number(recordId);
    if (!Number.isFinite(numeric)) {
      throw new Error(`RecordID ${recordId} is not numeric`);
    }

    return numeric;
  }

  return recordId;
}

function inferSqlType(value: unknown): ISqlTypeFactoryWithNoParams {
  if (typeof value === "boolean") {
    return sql.Bit;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? sql.Int : sql.Float;
  }

  if (value instanceof Date) {
    return sql.DateTime2;
  }

  return sql.NVarChar;
}

async function insertSyncLog(
  pool: ConnectionPool,
  input: {
    tableName: string;
    actionType: SyncAction;
    recordId: string;
    node: string;
    status: string;
  },
): Promise<void> {
  await pool
    .request()
    .input("TableName", sql.VarChar(50), input.tableName)
    .input("ActionType", sql.VarChar(10), input.actionType)
    .input("RecordID", sql.VarChar(50), input.recordId)
    .input("Node", sql.NVarChar(50), input.node)
    .input("TrangThai", sql.NVarChar(50), input.status)
    .query(
      `INSERT INTO SyncLog (TableName, ActionType, RecordID, Node, TrangThai)
       VALUES (@TableName, @ActionType, @RecordID, @Node, @TrangThai)`,
    );
}

async function updateSyncLogStatus(
  pool: ConnectionPool,
  id: number,
  status: string,
): Promise<void> {
  await pool
    .request()
    .input("ID", sql.Int, id)
    .input("TrangThai", sql.NVarChar(50), status)
    .query(`UPDATE SyncLog SET TrangThai = @TrangThai WHERE ID = @ID`);
}

async function loadRecordSnapshot(
  pool: ConnectionPool,
  tableName: string,
  recordId: string,
): Promise<Record<string, unknown> | null> {
  const tableConfig = TABLE_CONFIGS[tableName];

  if (!tableConfig) {
    throw new Error(`Unsupported table for sync: ${tableName}`);
  }

  const key = tableConfig.primaryKey;
  const keyValue = buildPrimaryKeyValue(recordId, tableConfig.primaryKeyKind);

  const result = await pool
    .request()
    .input(
      "RecordID",
      tableConfig.primaryKeyKind === "number" ? sql.Int : sql.VarChar(50),
      keyValue,
    )
    .query(
      `SELECT * FROM ${quoteIdentifier(tableName)} WHERE ${quoteIdentifier(key)} = @RecordID`,
    );

  return result.recordset[0] ?? null;
}

export function resolveConflictByTimestamp(
  sourceTimestamp: Date,
  targetLatestTimestamp?: Date,
): "apply" | "ignore" {
  if (!targetLatestTimestamp) {
    return "apply";
  }

  return sourceTimestamp >= targetLatestTimestamp ? "apply" : "ignore";
}

async function getLatestSyncTimestamp(
  pool: ConnectionPool,
  tableName: string,
  recordId: string,
): Promise<Date | undefined> {
  const result = await pool
    .request()
    .input("TableName", sql.VarChar(50), tableName)
    .input("RecordID", sql.VarChar(50), recordId)
    .query(
      `SELECT MAX(ThoiGian) AS LatestTime
       FROM SyncLog
       WHERE TableName = @TableName AND RecordID = @RecordID`,
    );

  return result.recordset[0]?.LatestTime as Date | undefined;
}

async function applyChangeToPool(input: {
  targetPool: ConnectionPool;
  tableName: string;
  actionType: SyncAction;
  recordId: string;
  payload: Record<string, unknown> | null;
  sourceTimestamp: Date;
  sourceNode: string;
}): Promise<{ applied: boolean; reason?: string }> {
  const tableConfig = TABLE_CONFIGS[input.tableName];
  if (!tableConfig) {
    return { applied: false, reason: "UNSUPPORTED_TABLE" };
  }

  const targetLatest = await getLatestSyncTimestamp(
    input.targetPool,
    input.tableName,
    input.recordId,
  );

  const decision = resolveConflictByTimestamp(
    input.sourceTimestamp,
    targetLatest,
  );
  if (decision === "ignore") {
    await insertSyncLog(input.targetPool, {
      tableName: input.tableName,
      actionType: input.actionType,
      recordId: input.recordId,
      node: input.sourceNode,
      status: "CONFLICT_IGNORED",
    });

    return { applied: false, reason: "CONFLICT_IGNORED" };
  }

  const keyColumn = tableConfig.primaryKey;
  const keyValue = buildPrimaryKeyValue(
    input.recordId,
    tableConfig.primaryKeyKind,
  );

  if (input.actionType === "DELETE") {
    await input.targetPool
      .request()
      .input(
        "RecordID",
        tableConfig.primaryKeyKind === "number" ? sql.Int : sql.VarChar(50),
        keyValue,
      )
      .query(
        `DELETE FROM ${quoteIdentifier(input.tableName)}
         WHERE ${quoteIdentifier(keyColumn)} = @RecordID`,
      );
  } else {
    if (!input.payload) {
      return { applied: false, reason: "MISSING_PAYLOAD" };
    }

    const payload = { ...input.payload };
    payload[keyColumn] = keyValue;

    const columns = Object.keys(payload);
    const updatableColumns = columns.filter((column) => column !== keyColumn);

    const setClause = updatableColumns
      .map((column) => `${quoteIdentifier(column)} = @${column}`)
      .join(", ");

    const insertColumns = columns
      .map((column) => quoteIdentifier(column))
      .join(", ");
    const insertValues = columns.map((column) => `@${column}`).join(", ");

    const request = input.targetPool.request();
    request.input(
      "RecordID",
      tableConfig.primaryKeyKind === "number" ? sql.Int : sql.VarChar(50),
      keyValue,
    );

    for (const column of columns) {
      request.input(
        column,
        inferSqlType(payload[column]),
        payload[column] as never,
      );
    }

    const statement =
      updatableColumns.length > 0
        ? `IF EXISTS (SELECT 1 FROM ${quoteIdentifier(input.tableName)} WHERE ${quoteIdentifier(keyColumn)} = @RecordID)
           BEGIN
             UPDATE ${quoteIdentifier(input.tableName)}
             SET ${setClause}
             WHERE ${quoteIdentifier(keyColumn)} = @RecordID
           END
         ELSE
           BEGIN
             INSERT INTO ${quoteIdentifier(input.tableName)} (${insertColumns})
             VALUES (${insertValues})
           END`
        : `IF NOT EXISTS (SELECT 1 FROM ${quoteIdentifier(input.tableName)} WHERE ${quoteIdentifier(keyColumn)} = @RecordID)
           BEGIN
             INSERT INTO ${quoteIdentifier(input.tableName)} (${insertColumns})
             VALUES (${insertValues})
           END`;

    await request.query(statement);
  }

  await insertSyncLog(input.targetPool, {
    tableName: input.tableName,
    actionType: input.actionType,
    recordId: input.recordId,
    node: input.sourceNode,
    status: "SYNC_APPLIED",
  });

  return { applied: true };
}

export async function recordNodeChange(input: {
  tableName: string;
  actionType: SyncAction;
  recordId: string;
}): Promise<void> {
  const localPool = getLocalDbPool();
  const env = getAppEnv();

  await insertSyncLog(localPool, {
    tableName: input.tableName,
    actionType: input.actionType,
    recordId: input.recordId,
    node: env.syncNodeName,
    status: "PENDING_PUBLISHER_SYNC",
  });
}

export async function runNodeToPublisherSync(): Promise<{
  total: number;
  synced: number;
  conflicts: number;
}> {
  const localPool = getLocalDbPool();
  const globalPool = getGlobalDbPool();

  const pending = await localPool.request().query(
    `SELECT ID, TableName, ActionType, RecordID, ThoiGian, Node, TrangThai
     FROM SyncLog
     WHERE TrangThai = 'PENDING_PUBLISHER_SYNC'
     ORDER BY ThoiGian ASC`,
  );

  let synced = 0;
  let conflicts = 0;

  for (const row of pending.recordset as SyncLogRow[]) {
    try {
      const payload =
        row.ActionType === "DELETE"
          ? null
          : await loadRecordSnapshot(localPool, row.TableName, row.RecordID);

      const result = await applyChangeToPool({
        targetPool: globalPool,
        tableName: row.TableName,
        actionType: row.ActionType,
        recordId: row.RecordID,
        payload,
        sourceTimestamp: new Date(row.ThoiGian),
        sourceNode: row.Node,
      });

      if (result.applied) {
        synced += 1;
        await updateSyncLogStatus(localPool, row.ID, "SYNCED_TO_PUBLISHER");
      } else {
        conflicts += 1;
        await updateSyncLogStatus(
          localPool,
          row.ID,
          result.reason ?? "CONFLICT_IGNORED",
        );
      }
    } catch (error) {
      logger.warn("Node->Publisher sync deferred", { error: String(error) });
      await updateSyncLogStatus(localPool, row.ID, "DEFERRED_OFFLINE");
    }
  }

  return {
    total: pending.recordset.length,
    synced,
    conflicts,
  };
}

export async function runPublisherToNodeSync(): Promise<{
  total: number;
  synced: number;
  conflicts: number;
}> {
  const localPool = getLocalDbPool();
  const globalPool = getGlobalDbPool();

  const pending = await globalPool.request().query(
    `SELECT ID, TableName, ActionType, RecordID, ThoiGian, Node, TrangThai
     FROM SyncLog
     WHERE Node = 'PUBLISHER' AND TrangThai = 'PENDING_NODE_PULL'
     ORDER BY ThoiGian ASC`,
  );

  let synced = 0;
  let conflicts = 0;

  for (const row of pending.recordset as SyncLogRow[]) {
    try {
      const payload =
        row.ActionType === "DELETE"
          ? null
          : await loadRecordSnapshot(globalPool, row.TableName, row.RecordID);

      const result = await applyChangeToPool({
        targetPool: localPool,
        tableName: row.TableName,
        actionType: row.ActionType,
        recordId: row.RecordID,
        payload,
        sourceTimestamp: new Date(row.ThoiGian),
        sourceNode: row.Node,
      });

      if (result.applied) {
        synced += 1;
        await updateSyncLogStatus(globalPool, row.ID, "SYNCED_TO_NODE");
      } else {
        conflicts += 1;
        await updateSyncLogStatus(
          globalPool,
          row.ID,
          result.reason ?? "CONFLICT_IGNORED",
        );
      }
    } catch (error) {
      logger.warn("Publisher->Node sync deferred", { error: String(error) });
      await updateSyncLogStatus(globalPool, row.ID, "DEFERRED_OFFLINE");
    }
  }

  return {
    total: pending.recordset.length,
    synced,
    conflicts,
  };
}

async function isPoolOnline(pool: ConnectionPool): Promise<boolean> {
  try {
    await pool.request().query("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}

async function countPendingLocalChanges(): Promise<number> {
  try {
    const localPool = getLocalDbPool();
    const result = await localPool.request().query(
      `SELECT COUNT(1) AS TotalPending
       FROM SyncLog
       WHERE TrangThai IN ('PENDING_PUBLISHER_SYNC', 'DEFERRED_OFFLINE')`,
    );

    return Number(result.recordset[0]?.TotalPending ?? 0);
  } catch {
    return 0;
  }
}

export async function runFullSyncCycle(): Promise<{
  mode: "online" | "offline";
  nodeToPublisher: { total: number; synced: number; conflicts: number };
  publisherToNode: { total: number; synced: number; conflicts: number };
  queuedWhenOffline: number;
}> {
  const localPool = getLocalDbPool();
  const globalPool = getGlobalDbPool();

  const [localOnline, globalOnline] = await Promise.all([
    isPoolOnline(localPool),
    isPoolOnline(globalPool),
  ]);

  if (!localOnline || !globalOnline) {
    return {
      mode: "offline",
      nodeToPublisher: { total: 0, synced: 0, conflicts: 0 },
      publisherToNode: { total: 0, synced: 0, conflicts: 0 },
      queuedWhenOffline: await countPendingLocalChanges(),
    };
  }

  const nodeToPublisher = await runNodeToPublisherSync();
  const publisherToNode = await runPublisherToNodeSync();

  return {
    mode: "online",
    nodeToPublisher,
    publisherToNode,
    queuedWhenOffline: 0,
  };
}
