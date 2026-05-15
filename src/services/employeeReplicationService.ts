import sql, { config as SqlConfig, ConnectionPool } from "mssql";
import { getAppEnv } from "../config/env";
import { getGlobalDbPool, getLocalDbPool } from "../config/database";
import { logger } from "../utils/logger";

export type EmployeeUpdateInput = {
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  sdt?: string;
  email?: string;
  maPhongBan: string;
  maChucVu: string;
  ngayVaoLam?: string;
  trangThai?: string;
  maChiNhanh: string;
};

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
};

const branchPools = new Map<string, ConnectionPool>();

function buildSqlConfig(config: DbConfig): SqlConfig {
  return {
    user: config.user,
    password: config.password,
    server: config.host,
    port: config.port,
    database: config.database,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
    },
    pool: {
      max: 5,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

async function getBranchPool(maChiNhanh: string): Promise<ConnectionPool | null> {
  const env = getAppEnv();
  const config =
    maChiNhanh === "CNHCM"
      ? env.branchDbs.hcm
      : maChiNhanh === "CNHN"
        ? env.branchDbs.hn
        : undefined;

  if (!config) {
    return null;
  }

  const key = `${maChiNhanh}:${config.host}:${config.port}:${config.database}`;
  const existing = branchPools.get(key);
  if (existing?.connected) {
    return existing;
  }

  const pool = new sql.ConnectionPool(buildSqlConfig(config));
  pool.on("error", (error) => {
    logger.error(`Branch database pool error ${maChiNhanh}`, { error: error.message });
  });
  await pool.connect();
  branchPools.set(key, pool);
  return pool;
}

export async function ensureDepartmentInBranch(
  pool: ConnectionPool,
  maPhongBan: string,
  maChiNhanh: string,
  errorMessage: string,
) {
  const department = await pool
    .request()
    .input("MaPhongBan", sql.VarChar(10), maPhongBan)
    .input("MaChiNhanh", sql.VarChar(10), maChiNhanh)
    .query(
      `SELECT 1 AS found
       FROM PhongBan
       WHERE MaPhongBan = @MaPhongBan AND MaChiNhanh = @MaChiNhanh`,
    );

  if (department.recordset.length === 0) {
    throw new Error(errorMessage);
  }
}

export async function updateEmployeeInPool(
  pool: ConnectionPool,
  maNhanVien: string,
  input: EmployeeUpdateInput,
) {
  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .input("HoTen", sql.NVarChar(150), input.hoTen)
    .input("NgaySinh", sql.Date, input.ngaySinh ?? null)
    .input("GioiTinh", sql.NVarChar(10), input.gioiTinh ?? null)
    .input("SDT", sql.VarChar(15), input.sdt ?? null)
    .input("Email", sql.VarChar(100), input.email ?? null)
    .input("MaPhongBan", sql.VarChar(10), input.maPhongBan)
    .input("MaChucVu", sql.VarChar(10), input.maChucVu)
    .input("NgayVaoLam", sql.Date, input.ngayVaoLam ?? null)
    .input("TrangThai", sql.NVarChar(50), input.trangThai ?? null)
    .query(
      `UPDATE NhanVien
       SET HoTen = @HoTen,
           NgaySinh = @NgaySinh,
           GioiTinh = @GioiTinh,
           SDT = @SDT,
           Email = @Email,
           MaPhongBan = @MaPhongBan,
           MaChucVu = @MaChucVu,
           NgayVaoLam = @NgayVaoLam,
           TrangThai = @TrangThai
       WHERE MaNhanVien = @MaNhanVien`,
    );
}

export async function updateEmployeeInPublisherAndCurrentNode(
  maNhanVien: string,
  input: EmployeeUpdateInput,
) {
  const localPool = getLocalDbPool();
  const globalPool = getGlobalDbPool();

  await ensureDepartmentInBranch(
    localPool,
    input.maPhongBan,
    input.maChiNhanh,
    "Phong ban khong thuoc chi nhanh hien tai",
  );

  await updateEmployeeInPool(localPool, maNhanVien, input);
  await updateEmployeeInPool(globalPool, maNhanVien, input);
}

export async function updateEmployeeInPublisherAndBranchNode(
  maNhanVien: string,
  input: EmployeeUpdateInput,
): Promise<{ branchUpdated: boolean }> {
  const globalPool = getGlobalDbPool();

  await ensureDepartmentInBranch(
    globalPool,
    input.maPhongBan,
    input.maChiNhanh,
    "Phong ban khong thuoc chi nhanh da chon",
  );

  const branchPool = await getBranchPool(input.maChiNhanh);
  if (!branchPool) {
    throw new Error(`Chua cau hinh DB node cho chi nhanh ${input.maChiNhanh}`);
  }

  await ensureDepartmentInBranch(
    branchPool,
    input.maPhongBan,
    input.maChiNhanh,
    "Phong ban khong thuoc chi nhanh node",
  );

  await updateEmployeeInPool(globalPool, maNhanVien, input);
  await updateEmployeeInPool(branchPool, maNhanVien, input);
  return { branchUpdated: true };
}

async function updateEmployeeStatusInPool(
  pool: ConnectionPool,
  maNhanVien: string,
  trangThai: string,
) {
  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .input("TrangThai", sql.NVarChar(50), trangThai)
    .query("UPDATE NhanVien SET TrangThai = @TrangThai WHERE MaNhanVien = @MaNhanVien");
}

async function findEmployeeBranch(pool: ConnectionPool, maNhanVien: string) {
  const result = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .query(
      `SELECT pb.MaChiNhanh
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
       WHERE nv.MaNhanVien = @MaNhanVien`,
    );

  return result.recordset[0]?.MaChiNhanh as string | undefined;
}

export async function updateEmployeeStatusInPublisherAndCurrentNode(
  maNhanVien: string,
  trangThai: string,
) {
  await updateEmployeeStatusInPool(getLocalDbPool(), maNhanVien, trangThai);
  await updateEmployeeStatusInPool(getGlobalDbPool(), maNhanVien, trangThai);
}

export async function updateEmployeeStatusInPublisherAndBranchNode(
  maNhanVien: string,
  trangThai: string,
) {
  const globalPool = getGlobalDbPool();
  const maChiNhanh = await findEmployeeBranch(globalPool, maNhanVien);

  if (!maChiNhanh) {
    throw new Error("Khong tim thay chi nhanh cua nhan vien");
  }

  const branchPool = await getBranchPool(maChiNhanh);
  if (!branchPool) {
    throw new Error(`Chua cau hinh DB node cho chi nhanh ${maChiNhanh}`);
  }

  await updateEmployeeStatusInPool(globalPool, maNhanVien, trangThai);
  await updateEmployeeStatusInPool(branchPool, maNhanVien, trangThai);
}
