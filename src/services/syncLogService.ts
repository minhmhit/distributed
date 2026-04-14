import sql from "mssql";
import { getCurrentDbPool } from "../config/database";
import { getAppEnv } from "../config/env";

type SyncLogRecord = {
  tableName: string;
  actionType: string;
  recordId: string;
  status: string;
};

export async function writeSyncLog(record: SyncLogRecord): Promise<void> {
  const pool = getCurrentDbPool();
  const env = getAppEnv();

  await pool
    .request()
    .input("TableName", sql.VarChar(50), record.tableName)
    .input("ActionType", sql.VarChar(10), record.actionType)
    .input("RecordID", sql.VarChar(50), record.recordId)
    .input("Node", sql.NVarChar(50), env.syncNodeName)
    .input("TrangThai", sql.NVarChar(50), record.status)
    .query(
      `INSERT INTO SyncLog (TableName, ActionType, RecordID, Node, TrangThai)
       VALUES (@TableName, @ActionType, @RecordID, @Node, @TrangThai)`,
    );
}
