SET NOCOUNT ON;

/*
  Distributed HRM - Adapted Schema
  - Script nay chay duoc cho ca Publisher DB va Node DB.
  - Phan manh du lieu:
    + Du lieu master dung chung: ChiNhanh, ChucVu, LoaiHopDong, Role, Users.
    + Du lieu nghiep vu local-first tai node: NhanVien, HopDong, ChamCong, NghiPhep, Luong.
    + SyncLog ton tai o ca Publisher va Node de theo doi dong bo 2 chieu.
*/

IF DB_ID(N'QuanLyNhanSu') IS NULL
BEGIN
  CREATE DATABASE QuanLyNhanSu;
END;
GO

USE QuanLyNhanSu;
GO

IF OBJECT_ID(N'dbo.ChiNhanh', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ChiNhanh (
    MaChiNhanh VARCHAR(10) PRIMARY KEY,
    TenChiNhanh NVARCHAR(150) NOT NULL,
    DiaChi NVARCHAR(255),
    TrangThai BIT CONSTRAINT DF_ChiNhanh_TrangThai DEFAULT 1
  );
END;
GO

IF OBJECT_ID(N'dbo.PhongBan', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.PhongBan (
    MaPhongBan VARCHAR(10) PRIMARY KEY,
    TenPhongBan NVARCHAR(150) NOT NULL,
    MaChiNhanh VARCHAR(10) NOT NULL,
    CONSTRAINT FK_PhongBan_ChiNhanh
      FOREIGN KEY (MaChiNhanh) REFERENCES dbo.ChiNhanh(MaChiNhanh)
  );
END;
GO

IF OBJECT_ID(N'dbo.ChucVu', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ChucVu (
    MaChucVu VARCHAR(10) PRIMARY KEY,
    TenChucVu NVARCHAR(100) NOT NULL,
    HeSoLuong FLOAT
  );
END;
GO

IF OBJECT_ID(N'dbo.LoaiHopDong', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.LoaiHopDong (
    MaLoaiHopDong VARCHAR(10) PRIMARY KEY,
    TenLoaiHopDong NVARCHAR(100),
    ThoiHanThang INT
  );
END;
GO

IF OBJECT_ID(N'dbo.NhanVien', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.NhanVien (
    MaNhanVien VARCHAR(10) PRIMARY KEY,
    HoTen NVARCHAR(150) NOT NULL,
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    SDT VARCHAR(15),
    Email VARCHAR(100),
    MaPhongBan VARCHAR(10),
    MaChucVu VARCHAR(10),
    NgayVaoLam DATE,
    TrangThai NVARCHAR(50) CONSTRAINT DF_NhanVien_TrangThai DEFAULT N'Dang lam',
    CONSTRAINT FK_NV_PB FOREIGN KEY (MaPhongBan) REFERENCES dbo.PhongBan(MaPhongBan),
    CONSTRAINT FK_NV_CV FOREIGN KEY (MaChucVu) REFERENCES dbo.ChucVu(MaChucVu)
  );
END;
GO

IF OBJECT_ID(N'dbo.HopDong', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.HopDong (
    MaHopDong VARCHAR(10) PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,
    MaLoaiHopDong VARCHAR(10),
    NgayBatDau DATE,
    NgayKetThuc DATE,
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_HD_NV FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien),
    CONSTRAINT FK_HD_LHD FOREIGN KEY (MaLoaiHopDong) REFERENCES dbo.LoaiHopDong(MaLoaiHopDong)
  );
END;
GO

IF OBJECT_ID(N'dbo.ChamCong', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ChamCong (
    MaChamCong INT IDENTITY PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,
    Ngay DATE NOT NULL,
    GioVao TIME,
    GioRa TIME,
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_CC_NV FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien),
    CONSTRAINT UQ_ChamCong UNIQUE (MaNhanVien, Ngay)
  );
END;
GO

IF OBJECT_ID(N'dbo.NghiPhep', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.NghiPhep (
    MaNghiPhep INT IDENTITY PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,
    TuNgay DATE,
    DenNgay DATE,
    LyDo NVARCHAR(255),
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_NP_NV FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien)
  );
END;
GO

IF OBJECT_ID(N'dbo.Luong', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Luong (
    MaLuong INT IDENTITY PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,
    Thang INT,
    Nam INT,
    LuongCoBan FLOAT,
    PhuCap FLOAT,
    Thuong FLOAT,
    KhauTru FLOAT,
    CONSTRAINT FK_L_NV FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien),
    CONSTRAINT UQ_Luong UNIQUE (MaNhanVien, Thang, Nam)
  );
END;
GO

IF OBJECT_ID(N'dbo.Role', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Role (
    MaRole VARCHAR(10) PRIMARY KEY,
    TenRole NVARCHAR(50)
  );
END;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    Username VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(100) NOT NULL,
    MaRole VARCHAR(10),
    MaChiNhanh VARCHAR(10),
    CONSTRAINT FK_U_R FOREIGN KEY (MaRole) REFERENCES dbo.Role(MaRole),
    CONSTRAINT FK_U_CN FOREIGN KEY (MaChiNhanh) REFERENCES dbo.ChiNhanh(MaChiNhanh)
  );
END;
GO

IF OBJECT_ID(N'dbo.SyncLog', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.SyncLog (
    ID INT IDENTITY PRIMARY KEY,
    TableName VARCHAR(50),
    ActionType VARCHAR(10),
    RecordID VARCHAR(50),
    ThoiGian DATETIME CONSTRAINT DF_SyncLog_ThoiGian DEFAULT GETDATE(),
    Node NVARCHAR(50),
    TrangThai NVARCHAR(50)
  );
END;
GO
