import sql from "mssql";
import { getLocalDbPool } from "../config/database";
import { getAppEnv } from "../config/env";
import { hashPassword } from "./common";

type AttendanceStatus = "CHECKED_IN" | "CHECKED_OUT" | "LATE" | "ON_TIME";
const BASE_SALARY_PER_HE_SO = 10000000;

function resolveNodeBranchCode(syncNodeName: string): string {
  const normalized = syncNodeName.trim().toLowerCase();

  if (normalized.includes("hcm")) {
    return "CNHCM";
  }

  if (normalized.includes("hn")) {
    return "CNHN";
  }

  throw new Error("Khong xac dinh duoc chi nhanh node tu SYNC_NODE_NAME");
}

async function writeLocalSyncLog(
  tableName: string,
  actionType: "INSERT" | "UPDATE" | "DELETE",
  recordId: string,
  status = "PENDING_PUBLISHER_SYNC",
): Promise<void> {
  const pool = getLocalDbPool();
  const env = getAppEnv();

  await pool
    .request()
    .input("TableName", sql.VarChar(50), tableName)
    .input("ActionType", sql.VarChar(10), actionType)
    .input("RecordID", sql.VarChar(50), recordId)
    .input("Node", sql.NVarChar(50), env.syncNodeName)
    .input("TrangThai", sql.NVarChar(50), status)
    .query(
      `INSERT INTO SyncLog (TableName, ActionType, RecordID, Node, TrangThai)
       VALUES (@TableName, @ActionType, @RecordID, @Node, @TrangThai)`,
    );
}

export async function createEmployee(input: {
  maNhanVien: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  sdt?: string;
  email?: string;
  maPhongBan: string;
  maChucVu: string;
  ngayVaoLam?: string;
  maChiNhanh: string;
}) {
  const pool = getLocalDbPool();
  const defaultPassword = `${input.maNhanVien}@123456`;
  const hashedPassword = await hashPassword(defaultPassword);

  const department = await pool
    .request()
    .input("MaPhongBan", sql.VarChar(10), input.maPhongBan)
    .input("MaChiNhanh", sql.VarChar(10), input.maChiNhanh)
    .query(
      `SELECT 1 AS found
       FROM PhongBan
       WHERE MaPhongBan = @MaPhongBan AND MaChiNhanh = @MaChiNhanh`,
    );

  if (department.recordset.length === 0) {
    throw new Error("Phong ban khong thuoc chi nhanh hien tai");
  }

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("HoTen", sql.NVarChar(150), input.hoTen)
    .input("NgaySinh", sql.Date, input.ngaySinh ?? null)
    .input("GioiTinh", sql.NVarChar(10), input.gioiTinh ?? null)
    .input("SDT", sql.VarChar(15), input.sdt ?? null)
    .input("Email", sql.VarChar(100), input.email ?? null)
    .input("MaPhongBan", sql.VarChar(10), input.maPhongBan)
    .input("MaChucVu", sql.VarChar(10), input.maChucVu)
    .input("NgayVaoLam", sql.Date, input.ngayVaoLam ?? null)
    .query(
      `INSERT INTO NhanVien
       (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam)
       VALUES
       (@MaNhanVien, @HoTen, @NgaySinh, @GioiTinh, @SDT, @Email, @MaPhongBan, @MaChucVu, @NgayVaoLam)`,
    );

  await pool
    .request()
    .input("Username", sql.VarChar(50), input.maNhanVien)
    .input("Password", sql.VarChar(100), hashedPassword)
    .input("MaRole", sql.VarChar(10), "R05")
    .input("MaChiNhanh", sql.VarChar(10), input.maChiNhanh)
    .query(
      `INSERT INTO Users (Username, Password, MaRole, MaChiNhanh)
       VALUES (@Username, @Password, @MaRole, @MaChiNhanh)`,
    );

  await writeLocalSyncLog("NhanVien", "INSERT", input.maNhanVien);
  await writeLocalSyncLog("Users", "INSERT", input.maNhanVien);
  const data: object = {
    maNhanVien: input.maNhanVien,
    username: input.maNhanVien,
    hoTen: input.hoTen,
    ngaySinh: input.ngaySinh,
    gioiTinh: input.gioiTinh,
    sdt: input.sdt,
    email: input.email,
    maPhongBan: input.maPhongBan,
    maChucVu: input.maChucVu,
    ngayVaoLam: input.ngayVaoLam,
  };
  return data;
}

export async function createContract(input: {
  maHopDong: string;
  maNhanVien: string;
  maLoaiHopDong: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  trangThai?: string;
}) {
  const pool = getLocalDbPool();

  await pool
    .request()
    .input("MaHopDong", sql.VarChar(10), input.maHopDong)
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("MaLoaiHopDong", sql.VarChar(10), input.maLoaiHopDong)
    .input("NgayBatDau", sql.Date, input.ngayBatDau ?? null)
    .input("NgayKetThuc", sql.Date, input.ngayKetThuc ?? null)
    .input("TrangThai", sql.NVarChar(50), input.trangThai ?? "Hieu luc")
    .query(
      `INSERT INTO HopDong
       (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
       VALUES
       (@MaHopDong, @MaNhanVien, @MaLoaiHopDong, @NgayBatDau, @NgayKetThuc, @TrangThai)`,
    );

  await writeLocalSyncLog("HopDong", "INSERT", input.maHopDong);
  return { maHopDong: input.maHopDong };
}

export async function checkInAttendance(input: {
  maNhanVien: string;
  ngay: string;
  gioVao: string;
}) {
  const pool = getLocalDbPool();
  const status: AttendanceStatus =
    input.gioVao > "08:00:00" ? "LATE" : "ON_TIME";

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("Ngay", sql.Date, new Date(input.ngay))
    .input("GioVao", sql.Time, new Date(`1970-01-01T${input.gioVao}Z`))
    .input("TrangThai", sql.NVarChar(50), status)
    .query(
      `IF EXISTS (SELECT 1 FROM ChamCong WHERE MaNhanVien = @MaNhanVien AND Ngay = @Ngay)
       BEGIN
         UPDATE ChamCong
         SET GioVao = @GioVao,
             TrangThai = @TrangThai
         WHERE MaNhanVien = @MaNhanVien AND Ngay = @Ngay
       END
       ELSE
       BEGIN
         INSERT INTO ChamCong (MaNhanVien, Ngay, GioVao, TrangThai)
         VALUES (@MaNhanVien, @Ngay, @GioVao, @TrangThai)
       END`,
    );

  await writeLocalSyncLog(
    "ChamCong",
    "UPDATE",
    `${input.maNhanVien}_${input.ngay}`,
  );

  return {
    maNhanVien: input.maNhanVien,
    ngay: input.ngay,
    giovao: input.gioVao,
    trangThai: status,
  };
}

export async function checkOutAttendance(input: {
  maNhanVien: string;
  ngay: string;
  gioRa: string;
}) {
  const pool = getLocalDbPool();

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("Ngay", sql.Date, new Date(input.ngay))
    .input("GioRa", sql.Time, new Date(`1970-01-01T${input.gioRa}Z`))
    .query(
      `UPDATE ChamCong
       SET GioRa = @GioRa,
           TrangThai = CASE WHEN GioVao <= '08:00:00' AND @GioRa >= '17:00:00' THEN N'Du gio' ELSE TrangThai END
       WHERE MaNhanVien = @MaNhanVien AND Ngay = @Ngay`,
    );

  await writeLocalSyncLog(
    "ChamCong",
    "UPDATE",
    `${input.maNhanVien}_${input.ngay}`,
  );

  return {
    maNhanVien: input.maNhanVien,
    ngay: input.ngay,
    gioRa: input.gioRa,
  };
}

export async function createLeaveRequest(input: {
  maNhanVien: string;
  tuNgay: string;
  denNgay: string;
  lyDo?: string;
}) {
  const pool = getLocalDbPool();

  const result = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("TuNgay", sql.Date, input.tuNgay)
    .input("DenNgay", sql.Date, input.denNgay)
    .input("LyDo", sql.NVarChar(255), input.lyDo ?? null)
    .input("TrangThai", sql.NVarChar(50), "CHO_DUYET")
    .query(
      ` 
    DECLARE @OutputTable TABLE (
        MaNghiPhep INT,
        MaNhanVien VARCHAR(10),
        TuNgay DATE,
        DenNgay DATE,
        LyDo NVARCHAR(255),
        TrangThai NVARCHAR(50)
    );
    INSERT INTO NghiPhep (MaNhanVien, TuNgay, DenNgay, LyDo, TrangThai)
    OUTPUT 
        INSERTED.MaNghiPhep, 
        INSERTED.MaNhanVien, 
        INSERTED.TuNgay, 
        INSERTED.DenNgay, 
        INSERTED.LyDo, 
        INSERTED.TrangThai
    INTO @OutputTable
    VALUES (@MaNhanVien, @TuNgay, @DenNgay, @LyDo, @TrangThai);
    SELECT * FROM @OutputTable;`,
    );

  const maNghiPhep = result.recordset[0]?.MaNghiPhep;
  const data: object = {
    maNghiPhep,
    maNhanVien: result.recordset[0]?.MaNhanVien,
    tuNgay: result.recordset[0]?.TuNgay,
    denNgay: result.recordset[0]?.DenNgay,
    lydo: result.recordset[0]?.LyDo,
    trangThai: result.recordset[0]?.TrangThai,
  };
  await writeLocalSyncLog("NghiPhep", "INSERT", String(maNghiPhep));

  return data;
}

export async function updateLeaveApproval(input: {
  maNghiPhep: number;
  trangThai: "DA_DUYET" | "TU_CHOI";
}) {
  const pool = getLocalDbPool();

  await pool
    .request()
    .input("MaNghiPhep", sql.Int, input.maNghiPhep)
    .input("TrangThai", sql.NVarChar(50), input.trangThai)
    .query(
      `UPDATE NghiPhep
       SET TrangThai = @TrangThai
       WHERE MaNghiPhep = @MaNghiPhep`,
    );

  await writeLocalSyncLog("NghiPhep", "UPDATE", String(input.maNghiPhep));
  return input;
}

export async function generateSalary(input: {
  maNhanVien: string;
  thang: number;
  nam: number;
  phuCap?: number;
  thuong?: number;
  khauTru?: number;
}) {
  return calculateSalary(input);
}

export async function calculateSalary(input: {
  maNhanVien: string;
  thang: number;
  nam: number;
  phuCap?: number;
  thuong?: number;
  khauTru?: number;
}) {
  const pool = getLocalDbPool();
  const env = getAppEnv();
  const nodeBranchCode = resolveNodeBranchCode(env.syncNodeName);

  const employeeResult = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("MaChiNhanh", sql.VarChar(10), nodeBranchCode)
    .query(
      `SELECT TOP 1
              nv.MaNhanVien,
              pb.MaChiNhanh,
              ISNULL(cv.HeSoLuong, 1) AS HeSoLuong,
              ISNULL(cv.HeSoLuong, 1) * ${BASE_SALARY_PER_HE_SO} AS LuongCoBan
       FROM NhanVien nv
       INNER JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN ChucVu cv ON cv.MaChucVu = nv.MaChucVu
       WHERE nv.MaNhanVien = @MaNhanVien
         AND pb.MaChiNhanh = @MaChiNhanh`,
    );

  const employee = employeeResult.recordset[0];
  if (!employee) {
    throw new Error("Nhan vien khong thuoc chi nhanh node hien tai");
  }

  const heSoLuong = Number(employee.HeSoLuong ?? 1);
  const luongCoBan = Number(employee.LuongCoBan ?? 0);

  const attendanceResult = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("Thang", sql.Int, input.thang)
    .input("Nam", sql.Int, input.nam)
    .query(
      `SELECT COUNT(1) AS SoNgayCong
       FROM ChamCong
       WHERE MaNhanVien = @MaNhanVien
         AND MONTH(Ngay) = @Thang
         AND YEAR(Ngay) = @Nam
         AND GioVao IS NOT NULL
         AND GioRa IS NOT NULL`,
    );

  const soNgayCong = Number(attendanceResult.recordset[0]?.SoNgayCong ?? 0);
  const phuCap = Number(input.phuCap ?? 0);
  const thuong = Number(input.thuong ?? 0);
  const khauTru = Number(input.khauTru ?? 0);
  const tongLuong = (luongCoBan / 26) * soNgayCong + phuCap + thuong - khauTru;

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("Thang", sql.Int, input.thang)
    .input("Nam", sql.Int, input.nam)
    .input("LuongCoBan", sql.Float, luongCoBan)
    .input("PhuCap", sql.Float, phuCap)
    .input("Thuong", sql.Float, thuong)
    .input("KhauTru", sql.Float, khauTru)
    .query(
      `IF EXISTS (SELECT 1 FROM Luong WHERE MaNhanVien = @MaNhanVien AND Thang = @Thang AND Nam = @Nam)
       BEGIN
         UPDATE Luong
         SET LuongCoBan = @LuongCoBan,
             PhuCap = @PhuCap,
             Thuong = @Thuong,
             KhauTru = @KhauTru
         WHERE MaNhanVien = @MaNhanVien AND Thang = @Thang AND Nam = @Nam
       END
       ELSE
       BEGIN
         INSERT INTO Luong (MaNhanVien, Thang, Nam, LuongCoBan, PhuCap, Thuong, KhauTru)
         VALUES (@MaNhanVien, @Thang, @Nam, @LuongCoBan, @PhuCap, @Thuong, @KhauTru)
       END`,
    );

  await writeLocalSyncLog(
    "Luong",
    "UPDATE",
    `${input.maNhanVien}_${input.thang}_${input.nam}`,
  );

  return {
    maNhanVien: input.maNhanVien,
    thang: input.thang,
    nam: input.nam,
    maChiNhanh: nodeBranchCode,
    heSoLuong,
    luongCoBan,
    soNgayCong,
    phuCap,
    thuong,
    khauTru,
    tongLuong,
  };
}

export async function localSearchAndReport(input: {
  keyword?: string;
  thang?: number;
  nam?: number;
}) {
  const pool = getLocalDbPool();
  const keyword = `%${input.keyword ?? ""}%`;

  const [employees, attendance, payroll] = await Promise.all([
    pool
      .request()
      .input("Keyword", sql.NVarChar(150), keyword)
      .query(
        `SELECT MaNhanVien, HoTen, Email, SDT
         FROM NhanVien
         WHERE @Keyword = '%%' OR HoTen LIKE @Keyword OR MaNhanVien LIKE @Keyword`,
      ),
    pool
      .request()
      .input("Thang", sql.Int, input.thang ?? new Date().getMonth() + 1)
      .input("Nam", sql.Int, input.nam ?? new Date().getFullYear())
      .query(
        `SELECT MaNhanVien, COUNT(*) AS SoNgayChamCong
         FROM ChamCong
         WHERE MONTH(Ngay) = @Thang AND YEAR(Ngay) = @Nam
         GROUP BY MaNhanVien`,
      ),
    pool
      .request()
      .input("Thang", sql.Int, input.thang ?? new Date().getMonth() + 1)
      .input("Nam", sql.Int, input.nam ?? new Date().getFullYear())
      .query(
        `SELECT MaNhanVien,
                (LuongCoBan + PhuCap + Thuong - KhauTru) AS TongLuong
         FROM Luong
         WHERE Thang = @Thang AND Nam = @Nam`,
      ),
  ]);

  return {
    employees: employees.recordset,
    attendance: attendance.recordset,
    payroll: payroll.recordset,
  };
}
