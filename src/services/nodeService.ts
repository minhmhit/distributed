import sql from "mssql";
import { getLocalDbPool } from "../config/database";
import { getAppEnv } from "../config/env";
import {
  updateEmployeeInPublisherAndCurrentNode,
  updateEmployeeStatusInPublisherAndCurrentNode,
} from "./employeeReplicationService";

type AttendanceStatus = "CHECKED_IN" | "CHECKED_OUT" | "LATE" | "ON_TIME";

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

  await writeLocalSyncLog("NhanVien", "INSERT", input.maNhanVien);
  return { maNhanVien: input.maNhanVien };
}

export async function updateEmployee(
  maNhanVien: string,
  input: {
<<<<<<< HEAD
    hoTen: string;
=======
    hoTen?: string;
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
    ngaySinh?: string;
    gioiTinh?: string;
    sdt?: string;
    email?: string;
<<<<<<< HEAD
    maPhongBan: string;
    maChucVu: string;
    ngayVaoLam?: string;
    trangThai?: string;
    maChiNhanh: string;
  },
) {
  await updateEmployeeInPublisherAndCurrentNode(maNhanVien, input);
=======
    maPhongBan?: string;
    maChucVu?: string;
    ngayVaoLam?: string;
  },
  branchScope?: string,
) {
  const pool = getLocalDbPool();

  const employeeResult = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .query(
      `SELECT nv.MaNhanVien, pb.MaChiNhanh
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
       WHERE nv.MaNhanVien = @MaNhanVien`,
    );

  if (employeeResult.recordset.length === 0) {
    throw new Error("Khong tim thay nhan vien");
  }

  const employeeBranch = employeeResult.recordset[0]?.MaChiNhanh;
  if (branchScope && employeeBranch && branchScope !== employeeBranch) {
    throw new Error("Khong duoc phep cap nhat nhan vien khac chi nhanh");
  }

  if (input.maPhongBan) {
    const departmentBranch = branchScope || employeeBranch;
    const department = await pool
      .request()
      .input("MaPhongBan", sql.VarChar(10), input.maPhongBan)
      .input("MaChiNhanh", sql.VarChar(10), departmentBranch ?? null)
      .query(
        `SELECT 1 AS found
         FROM PhongBan
         WHERE MaPhongBan = @MaPhongBan
           AND (@MaChiNhanh IS NULL OR MaChiNhanh = @MaChiNhanh)`,
      );

    if (department.recordset.length === 0) {
      throw new Error("Phong ban khong thuoc chi nhanh hien tai");
    }
  }

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .input("HoTen", sql.NVarChar(150), input.hoTen ?? null)
    .input("NgaySinh", sql.Date, input.ngaySinh ?? null)
    .input("GioiTinh", sql.NVarChar(10), input.gioiTinh ?? null)
    .input("SDT", sql.VarChar(15), input.sdt ?? null)
    .input("Email", sql.VarChar(100), input.email ?? null)
    .input("MaPhongBan", sql.VarChar(10), input.maPhongBan ?? null)
    .input("MaChucVu", sql.VarChar(10), input.maChucVu ?? null)
    .input("NgayVaoLam", sql.Date, input.ngayVaoLam ?? null)
    .query(
      `UPDATE NhanVien
       SET HoTen = COALESCE(@HoTen, HoTen),
           NgaySinh = COALESCE(@NgaySinh, NgaySinh),
           GioiTinh = COALESCE(@GioiTinh, GioiTinh),
           SDT = COALESCE(@SDT, SDT),
           Email = COALESCE(@Email, Email),
           MaPhongBan = COALESCE(@MaPhongBan, MaPhongBan),
           MaChucVu = COALESCE(@MaChucVu, MaChucVu),
           NgayVaoLam = COALESCE(@NgayVaoLam, NgayVaoLam)
       WHERE MaNhanVien = @MaNhanVien`,
    );
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9

  await writeLocalSyncLog("NhanVien", "UPDATE", maNhanVien);
  return { maNhanVien };
}

<<<<<<< HEAD
export async function deleteEmployee(maNhanVien: string) {
  // Thuc te thuong chi mark la 'Nghi viec' chu khong xoa vat ly
  await updateEmployeeStatusInPublisherAndCurrentNode(maNhanVien, "Nghi việc");

  await writeLocalSyncLog("NhanVien", "UPDATE", maNhanVien);
  return { maNhanVien, action: "DELETED_STATUS" };
}

export async function reactivateEmployee(maNhanVien: string) {
  await updateEmployeeStatusInPublisherAndCurrentNode(maNhanVien, "Hoạt động");

  await writeLocalSyncLog("NhanVien", "UPDATE", maNhanVien);
  return { maNhanVien, action: "REACTIVATED" };
=======
export async function deleteEmployee(maNhanVien: string, branchScope?: string) {
  const pool = getLocalDbPool();

  const employeeResult = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .query(
      `SELECT nv.MaNhanVien, pb.MaChiNhanh
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
       WHERE nv.MaNhanVien = @MaNhanVien`,
    );

  if (employeeResult.recordset.length === 0) {
    throw new Error("Khong tim thay nhan vien");
  }

  const employeeBranch = employeeResult.recordset[0]?.MaChiNhanh;
  if (branchScope && employeeBranch && branchScope !== employeeBranch) {
    throw new Error("Khong duoc phep xoa nhan vien khac chi nhanh");
  }

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .input("TrangThai", sql.NVarChar(50), "DA_NGHI_VIEC")
    .query(
      `UPDATE NhanVien
       SET TrangThai = @TrangThai
       WHERE MaNhanVien = @MaNhanVien`,
    );

  await writeLocalSyncLog("NhanVien", "UPDATE", maNhanVien);
  return { maNhanVien, trangThai: "DA_NGHI_VIEC" };
}

export async function reactivateEmployee(maNhanVien: string, branchScope?: string) {
  const pool = getLocalDbPool();

  const employeeResult = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .query(
      `SELECT nv.MaNhanVien, pb.MaChiNhanh
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
       WHERE nv.MaNhanVien = @MaNhanVien`,
    );

  if (employeeResult.recordset.length === 0) {
    throw new Error("Khong tim thay nhan vien");
  }

  const employeeBranch = employeeResult.recordset[0]?.MaChiNhanh;
  if (branchScope && employeeBranch && branchScope !== employeeBranch) {
    throw new Error("Khong duoc phep cap nhat nhan vien khac chi nhanh");
  }

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), maNhanVien)
    .input("TrangThai", sql.NVarChar(50), "Dang lam")
    .query(
      `UPDATE NhanVien
       SET TrangThai = @TrangThai
       WHERE MaNhanVien = @MaNhanVien`,
    );

  await writeLocalSyncLog("NhanVien", "UPDATE", maNhanVien);
  return { maNhanVien, trangThai: "Dang lam" };
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
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
    .input("Ngay", sql.Date, input.ngay)
    .input("GioVao", sql.Time, input.gioVao)
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
    .input("Ngay", sql.Date, input.ngay)
    .input("GioRa", sql.Time, input.gioRa)
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
      `INSERT INTO NghiPhep (MaNhanVien, TuNgay, DenNgay, LyDo, TrangThai)
       OUTPUT INSERTED.MaNghiPhep
       VALUES (@MaNhanVien, @TuNgay, @DenNgay, @LyDo, @TrangThai)`,
    );

  const maNghiPhep = result.recordset[0]?.MaNghiPhep;
  await writeLocalSyncLog("NghiPhep", "INSERT", String(maNghiPhep));

  return { maNghiPhep };
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
  const pool = getLocalDbPool();

  const baseSalaryResult = await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .query(
      `SELECT TOP 1 ISNULL(cv.HeSoLuong, 1) * 10000000 AS LuongCoBan
       FROM NhanVien nv
       LEFT JOIN ChucVu cv ON cv.MaChucVu = nv.MaChucVu
       WHERE nv.MaNhanVien = @MaNhanVien`,
    );

  const luongCoBan = Number(baseSalaryResult.recordset[0]?.LuongCoBan ?? 0);

  await pool
    .request()
    .input("MaNhanVien", sql.VarChar(10), input.maNhanVien)
    .input("Thang", sql.Int, input.thang)
    .input("Nam", sql.Int, input.nam)
    .input("LuongCoBan", sql.Float, luongCoBan)
    .input("PhuCap", sql.Float, input.phuCap ?? 0)
    .input("Thuong", sql.Float, input.thuong ?? 0)
    .input("KhauTru", sql.Float, input.khauTru ?? 0)
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
    luongCoBan,
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
        `SELECT nv.MaNhanVien, nv.HoTen, nv.Email, nv.SDT,
<<<<<<< HEAD
                nv.MaPhongBan, pb.TenPhongBan,
                nv.MaChucVu, cv.TenChucVu,
                nv.TrangThai
         FROM NhanVien nv
         LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
         LEFT JOIN ChucVu cv ON cv.MaChucVu = nv.MaChucVu
         WHERE @Keyword = '%%' 
            OR nv.HoTen LIKE @Keyword 
            OR nv.MaNhanVien LIKE @Keyword`,
=======
                nv.NgaySinh, nv.NgayVaoLam, nv.TrangThai,
                nv.MaPhongBan, pb.TenPhongBan,
                nv.MaChucVu, cv.TenChucVu,
                cn.MaChiNhanh, cn.TenChiNhanh
         FROM NhanVien nv
         LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
         LEFT JOIN ChucVu cv ON cv.MaChucVu = nv.MaChucVu
         LEFT JOIN ChiNhanh cn ON cn.MaChiNhanh = pb.MaChiNhanh
         WHERE (
           @Keyword = '%%'
           OR nv.HoTen LIKE @Keyword
           OR nv.MaNhanVien LIKE @Keyword
         )`,
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
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

export async function listLocalEmployees(keyword?: string) {
  const pool = getLocalDbPool();
  const kw = `%${keyword ?? ""}%`;

  const result = await pool
    .request()
    .input("Keyword", sql.NVarChar(150), kw)
    .query(
      `SELECT nv.MaNhanVien, nv.HoTen, nv.Email, nv.SDT, nv.GioiTinh,
              nv.NgaySinh, nv.NgayVaoLam, nv.TrangThai,
              pb.MaPhongBan, pb.TenPhongBan,
              cv.MaChucVu, cv.TenChucVu, cv.HeSoLuong,
              cn.MaChiNhanh, cn.TenChiNhanh
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN ChucVu cv ON cv.MaChucVu = nv.MaChucVu
       LEFT JOIN ChiNhanh cn ON cn.MaChiNhanh = pb.MaChiNhanh
       WHERE (
           @Keyword = '%%'
           OR nv.HoTen LIKE @Keyword
           OR nv.MaNhanVien LIKE @Keyword
           OR nv.Email LIKE @Keyword
         )
       ORDER BY nv.HoTen`,
    );

  return result.recordset;
}

export async function listLocalBranches() {
  const pool = getLocalDbPool();
  const result = await pool.request().query("SELECT * FROM ChiNhanh");
  return result.recordset;
}

export async function listLocalPositions() {
  const pool = getLocalDbPool();
  const result = await pool.request().query("SELECT * FROM ChucVu");
  return result.recordset;
}

export async function listLocalContractTypes() {
  const pool = getLocalDbPool();
  const result = await pool.request().query("SELECT * FROM LoaiHopDong");
  return result.recordset;
}

export async function listLocalDepartments() {
  const pool = getLocalDbPool();
  const result = await pool.request().query("SELECT * FROM PhongBan");
  return result.recordset;
}

export async function listLeaves(input: { trangThai?: string; maNhanVien?: string }) {
  const pool = getLocalDbPool();

  let whereClause = "WHERE 1=1";
  const request = pool.request();

  if (input.trangThai) {
    whereClause += " AND np.TrangThai = @TrangThai";
    request.input("TrangThai", sql.NVarChar(50), input.trangThai);
  }

  if (input.maNhanVien) {
    whereClause += " AND np.MaNhanVien = @MaNhanVien";
    request.input("MaNhanVien", sql.VarChar(10), input.maNhanVien);
  }

  const result = await request.query(
    `SELECT np.MaNghiPhep, np.MaNhanVien, nv.HoTen,
            np.TuNgay, np.DenNgay, np.LyDo, np.TrangThai
     FROM NghiPhep np
     LEFT JOIN NhanVien nv ON nv.MaNhanVien = np.MaNhanVien
     ${whereClause}
     ORDER BY np.MaNghiPhep DESC`,
  );

  return result.recordset;
}

export async function getAttendanceByEmployee(input: {
  maNhanVien: string;
  tuNgay?: string;
  denNgay?: string;
}) {
  const pool = getLocalDbPool();
  const request = pool.request();
  request.input("MaNhanVien", sql.VarChar(10), input.maNhanVien);

  let dateFilter = "";
  if (input.tuNgay) {
    dateFilter += " AND Ngay >= @TuNgay";
    request.input("TuNgay", sql.Date, input.tuNgay);
  }
  if (input.denNgay) {
    dateFilter += " AND Ngay <= @DenNgay";
    request.input("DenNgay", sql.Date, input.denNgay);
  }

  const result = await request.query(
    `SELECT MaNhanVien, Ngay, GioVao, GioRa, TrangThai
     FROM ChamCong
     WHERE MaNhanVien = @MaNhanVien ${dateFilter}
     ORDER BY Ngay DESC`,
  );

  return result.recordset;
}

export async function getSyncPendingCount() {
  const pool = getLocalDbPool();

  const result = await pool.request().query(
    `SELECT
       COUNT(*) AS TongPending,
       SUM(CASE WHEN TrangThai = 'PENDING_PUBLISHER_SYNC' THEN 1 ELSE 0 END) AS PendingSync,
       SUM(CASE WHEN TrangThai = 'DEFERRED_OFFLINE' THEN 1 ELSE 0 END) AS DeferredOffline,
       SUM(CASE WHEN TrangThai = 'SYNCED_TO_PUBLISHER' THEN 1 ELSE 0 END) AS DaSynced,
       SUM(CASE WHEN TrangThai = 'CONFLICT_IGNORED' THEN 1 ELSE 0 END) AS XungDot
     FROM SyncLog`,
  );

  return result.recordset[0] ?? { TongPending: 0, PendingSync: 0, DeferredOffline: 0, DaSynced: 0, XungDot: 0 };
}
