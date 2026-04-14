import sql from "mssql";
import { getGlobalDbPool } from "../config/database";
import { hashPassword } from "./common";

const SUPPORTED_UPSERT_TABLES = {
  ChiNhanh: "MaChiNhanh",
  ChucVu: "MaChucVu",
  LoaiHopDong: "MaLoaiHopDong",
  Users: "Username",
  NhanVien: "MaNhanVien",
} as const;

type SupportedTable = keyof typeof SUPPORTED_UPSERT_TABLES;

type SyncAction = "INSERT" | "UPDATE" | "DELETE" | "UPSERT";

function quoteIdentifier(identifier: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }

  return `[${identifier}]`;
}

async function writePublisherSyncLog(
  tableName: string,
  actionType: SyncAction,
  recordId: string,
  status = "PENDING_NODE_PULL",
): Promise<void> {
  const pool = getGlobalDbPool();

  await pool
    .request()
    .input("TableName", sql.VarChar(50), tableName)
    .input("ActionType", sql.VarChar(10), actionType)
    .input("RecordID", sql.VarChar(50), recordId)
    .input("Node", sql.NVarChar(50), "PUBLISHER")
    .input("TrangThai", sql.NVarChar(50), status)
    .query(
      `INSERT INTO SyncLog (TableName, ActionType, RecordID, Node, TrangThai)
       VALUES (@TableName, @ActionType, @RecordID, @Node, @TrangThai)`,
    );
}

export async function createBranch(input: {
  maChiNhanh: string;
  tenChiNhanh: string;
  diaChi?: string;
  trangThai?: boolean;
}) {
  const pool = getGlobalDbPool();

  const exists = await pool
    .request()
    .input("MaChiNhanh", sql.VarChar(10), input.maChiNhanh)
    .query("SELECT 1 AS found FROM ChiNhanh WHERE MaChiNhanh = @MaChiNhanh");

  if (exists.recordset.length > 0) {
    throw new Error("Ma chi nhanh da ton tai");
  }

  await pool
    .request()
    .input("MaChiNhanh", sql.VarChar(10), input.maChiNhanh)
    .input("TenChiNhanh", sql.NVarChar(150), input.tenChiNhanh)
    .input("DiaChi", sql.NVarChar(255), input.diaChi ?? null)
    .input("TrangThai", sql.Bit, input.trangThai ?? true)
    .query(
      `INSERT INTO ChiNhanh (MaChiNhanh, TenChiNhanh, DiaChi, TrangThai)
       VALUES (@MaChiNhanh, @TenChiNhanh, @DiaChi, @TrangThai)`,
    );

  await writePublisherSyncLog("ChiNhanh", "INSERT", input.maChiNhanh);

  return {
    maChiNhanh: input.maChiNhanh,
    tenChiNhanh: input.tenChiNhanh,
    diaChi: input.diaChi ?? null,
    trangThai: input.trangThai ?? true,
  };
}

export async function updateBranch(
  maChiNhanh: string,
  input: { tenChiNhanh: string; diaChi?: string; trangThai?: boolean },
) {
  const pool = getGlobalDbPool();

  await pool
    .request()
    .input("MaChiNhanh", sql.VarChar(10), maChiNhanh)
    .input("TenChiNhanh", sql.NVarChar(150), input.tenChiNhanh)
    .input("DiaChi", sql.NVarChar(255), input.diaChi ?? null)
    .input("TrangThai", sql.Bit, input.trangThai ?? true)
    .query(
      `UPDATE ChiNhanh
       SET TenChiNhanh = @TenChiNhanh,
           DiaChi = @DiaChi,
           TrangThai = @TrangThai
       WHERE MaChiNhanh = @MaChiNhanh`,
    );

  await writePublisherSyncLog("ChiNhanh", "UPDATE", maChiNhanh);

  return { maChiNhanh, ...input };
}

export async function listBranches() {
  const pool = getGlobalDbPool();
  const result = await pool.request().query("SELECT * FROM ChiNhanh");
  return result.recordset;
}

export async function createPosition(input: {
  maChucVu: string;
  tenChucVu: string;
  heSoLuong?: number;
}) {
  const pool = getGlobalDbPool();

  await pool
    .request()
    .input("MaChucVu", sql.VarChar(10), input.maChucVu)
    .input("TenChucVu", sql.NVarChar(100), input.tenChucVu)
    .input("HeSoLuong", sql.Float, input.heSoLuong ?? null)
    .query(
      `INSERT INTO ChucVu (MaChucVu, TenChucVu, HeSoLuong)
       VALUES (@MaChucVu, @TenChucVu, @HeSoLuong)`,
    );

  await writePublisherSyncLog("ChucVu", "INSERT", input.maChucVu);

  return input;
}

export async function updatePosition(
  maChucVu: string,
  input: { tenChucVu: string; heSoLuong?: number },
) {
  const pool = getGlobalDbPool();

  await pool
    .request()
    .input("MaChucVu", sql.VarChar(10), maChucVu)
    .input("TenChucVu", sql.NVarChar(100), input.tenChucVu)
    .input("HeSoLuong", sql.Float, input.heSoLuong ?? null)
    .query(
      `UPDATE ChucVu
       SET TenChucVu = @TenChucVu,
           HeSoLuong = @HeSoLuong
       WHERE MaChucVu = @MaChucVu`,
    );

  await writePublisherSyncLog("ChucVu", "UPDATE", maChucVu);

  return { maChucVu, ...input };
}

export async function listPositions() {
  const pool = getGlobalDbPool();
  const result = await pool.request().query("SELECT * FROM ChucVu");
  return result.recordset;
}

export async function createContractType(input: {
  maLoaiHopDong: string;
  tenLoaiHopDong: string;
  thoiHanThang?: number;
}) {
  const pool = getGlobalDbPool();

  await pool
    .request()
    .input("MaLoaiHopDong", sql.VarChar(10), input.maLoaiHopDong)
    .input("TenLoaiHopDong", sql.NVarChar(100), input.tenLoaiHopDong)
    .input("ThoiHanThang", sql.Int, input.thoiHanThang ?? null)
    .query(
      `INSERT INTO LoaiHopDong (MaLoaiHopDong, TenLoaiHopDong, ThoiHanThang)
       VALUES (@MaLoaiHopDong, @TenLoaiHopDong, @ThoiHanThang)`,
    );

  await writePublisherSyncLog("LoaiHopDong", "INSERT", input.maLoaiHopDong);

  return input;
}

export async function listContractTypes() {
  const pool = getGlobalDbPool();
  const result = await pool.request().query("SELECT * FROM LoaiHopDong");
  return result.recordset;
}

export async function createUserAccount(input: {
  username: string;
  password: string;
  maRole: string;
  maChiNhanh?: string;
}) {
  const pool = getGlobalDbPool();
  const hashedPassword = await hashPassword(input.password);

  await pool
    .request()
    .input("Username", sql.VarChar(50), input.username)
    .input("Password", sql.VarChar(100), hashedPassword)
    .input("MaRole", sql.VarChar(10), input.maRole)
    .input("MaChiNhanh", sql.VarChar(10), input.maChiNhanh ?? null)
    .query(
      `INSERT INTO Users (Username, Password, MaRole, MaChiNhanh)
       VALUES (@Username, @Password, @MaRole, @MaChiNhanh)`,
    );

  await writePublisherSyncLog("Users", "INSERT", input.username);

  return {
    username: input.username,
    maRole: input.maRole,
    maChiNhanh: input.maChiNhanh ?? null,
  };
}

export async function ingestNodeData(input: {
  tableName: SupportedTable;
  actionType: SyncAction;
  recordId: string;
  payload: Record<string, unknown>;
  node: string;
}) {
  const pool = getGlobalDbPool();
  const primaryKey = SUPPORTED_UPSERT_TABLES[input.tableName];

  if (!Object.prototype.hasOwnProperty.call(input.payload, primaryKey)) {
    input.payload[primaryKey] = input.recordId;
  }

  const columns = Object.keys(input.payload);
  if (columns.length === 0) {
    throw new Error("Payload khong duoc de trong");
  }

  const setClause = columns
    .filter((column) => column !== primaryKey)
    .map((column) => `${quoteIdentifier(column)} = @${column}`)
    .join(", ");

  const insertColumns = columns
    .map((column) => quoteIdentifier(column))
    .join(", ");
  const insertValues = columns.map((column) => `@${column}`).join(", ");

  const request = pool.request();
  request.input("PrimaryKeyValue", sql.VarChar(50), input.recordId);

  for (const column of columns) {
    request.input(
      column,
      input.payload[column] as sql.ISqlTypeFactoryWithNoParams,
    );
  }

  const keyColumn = quoteIdentifier(primaryKey);
  const tableName = quoteIdentifier(input.tableName);

  const query = setClause
    ? `
      IF EXISTS (SELECT 1 FROM ${tableName} WHERE ${keyColumn} = @PrimaryKeyValue)
      BEGIN
        UPDATE ${tableName}
        SET ${setClause}
        WHERE ${keyColumn} = @PrimaryKeyValue
      END
      ELSE
      BEGIN
        INSERT INTO ${tableName} (${insertColumns})
        VALUES (${insertValues})
      END
    `
    : `
      IF NOT EXISTS (SELECT 1 FROM ${tableName} WHERE ${keyColumn} = @PrimaryKeyValue)
      BEGIN
        INSERT INTO ${tableName} (${insertColumns})
        VALUES (${insertValues})
      END
    `;

  await request.query(query);

  await pool
    .request()
    .input("TableName", sql.VarChar(50), input.tableName)
    .input("ActionType", sql.VarChar(10), input.actionType)
    .input("RecordID", sql.VarChar(50), input.recordId)
    .input("Node", sql.NVarChar(50), input.node)
    .input("TrangThai", sql.NVarChar(50), "RECEIVED_AT_PUBLISHER")
    .query(
      `INSERT INTO SyncLog (TableName, ActionType, RecordID, Node, TrangThai)
       VALUES (@TableName, @ActionType, @RecordID, @Node, @TrangThai)`,
    );

  return {
    accepted: true,
    tableName: input.tableName,
    recordId: input.recordId,
  };
}

export async function companySearch(keyword?: string) {
  const pool = getGlobalDbPool();

  const request = pool.request();
  request.input("Keyword", sql.NVarChar(150), `%${keyword ?? ""}%`);

  const result = await request.query(
    `SELECT nv.MaNhanVien, nv.HoTen, nv.Email, nv.SDT,
            pb.TenPhongBan, cn.MaChiNhanh, cn.TenChiNhanh
     FROM NhanVien nv
     LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
     LEFT JOIN ChiNhanh cn ON cn.MaChiNhanh = pb.MaChiNhanh
     WHERE @Keyword = '%%'
        OR nv.HoTen LIKE @Keyword
        OR nv.Email LIKE @Keyword
        OR nv.MaNhanVien LIKE @Keyword
        OR cn.TenChiNhanh LIKE @Keyword`,
  );

  return result.recordset;
}

export async function summaryReport() {
  const pool = getGlobalDbPool();

  const [employeeByBranch, contractStats, salaryStats] = await Promise.all([
    pool.request().query(
      `SELECT cn.MaChiNhanh, cn.TenChiNhanh, COUNT(nv.MaNhanVien) AS SoNhanVien
       FROM ChiNhanh cn
       LEFT JOIN PhongBan pb ON pb.MaChiNhanh = cn.MaChiNhanh
       LEFT JOIN NhanVien nv ON nv.MaPhongBan = pb.MaPhongBan
       GROUP BY cn.MaChiNhanh, cn.TenChiNhanh`,
    ),
    pool.request().query(
      `SELECT lhd.TenLoaiHopDong, COUNT(hd.MaHopDong) AS SoHopDong
       FROM LoaiHopDong lhd
       LEFT JOIN HopDong hd ON hd.MaLoaiHopDong = lhd.MaLoaiHopDong
       GROUP BY lhd.TenLoaiHopDong`,
    ),
    pool.request().query(
      `SELECT ISNULL(SUM(LuongCoBan + PhuCap + Thuong - KhauTru), 0) AS TongLuong
       FROM Luong`,
    ),
  ]);

  return {
    employeeByBranch: employeeByBranch.recordset,
    contractStats: contractStats.recordset,
    salaryStats: salaryStats.recordset[0] ?? { TongLuong: 0 },
  };
}

export async function syncMonitor(thresholdMinutes = 30) {
  const pool = getGlobalDbPool();

  const result = await pool
    .request()
    .input("ThresholdMinutes", sql.Int, thresholdMinutes)
    .query(
      `WITH LastSync AS (
         SELECT Node, MAX(ThoiGian) AS LastSyncTime
         FROM SyncLog
         GROUP BY Node
       )
       SELECT Node,
              LastSyncTime,
              CASE
                WHEN DATEDIFF(MINUTE, LastSyncTime, GETDATE()) > @ThresholdMinutes THEN N'Mat ket noi'
                ELSE N'Hoat dong'
              END AS TrangThai
       FROM LastSync
       ORDER BY LastSyncTime DESC`,
    );

  return result.recordset;
}
