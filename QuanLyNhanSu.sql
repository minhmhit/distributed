use QuanLyNhanSu 
CREATE TABLE ChiNhanh (
    MaChiNhanh VARCHAR(10) PRIMARY KEY,
    TenChiNhanh NVARCHAR(150) NOT NULL,
    DiaChi NVARCHAR(255),
    TrangThai BIT DEFAULT 1
);
CREATE TABLE PhongBan (
    MaPhongBan VARCHAR(10) PRIMARY KEY,
    TenPhongBan NVARCHAR(150) NOT NULL,
    MaChiNhanh VARCHAR(10) NOT NULL,

    CONSTRAINT FK_PhongBan_ChiNhanh
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh)
);
CREATE TABLE ChucVu (
    MaChucVu VARCHAR(10) PRIMARY KEY,
    TenChucVu NVARCHAR(100) NOT NULL,
    HeSoLuong FLOAT
);
CREATE TABLE LoaiHopDong (
    MaLoaiHopDong VARCHAR(10) PRIMARY KEY,
    TenLoaiHopDong NVARCHAR(100),
    ThoiHanThang INT
);
CREATE TABLE NhanVien (
    MaNhanVien VARCHAR(10) PRIMARY KEY,
    HoTen NVARCHAR(150) NOT NULL,
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    SDT VARCHAR(15),
    Email VARCHAR(100),

    
    MaPhongBan VARCHAR(10),
    MaChucVu VARCHAR(10),

    NgayVaoLam DATE,
    TrangThai NVARCHAR(50) DEFAULT N'Đang làm',

 
    CONSTRAINT FK_NV_PB FOREIGN KEY (MaPhongBan) REFERENCES PhongBan(MaPhongBan),
    CONSTRAINT FK_NV_CV FOREIGN KEY (MaChucVu) REFERENCES ChucVu(MaChucVu)
);
CREATE TABLE HopDong (
    MaHopDong VARCHAR(10) PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,
    MaLoaiHopDong VARCHAR(10),

    NgayBatDau DATE,
    NgayKetThuc DATE,
    TrangThai NVARCHAR(50),

    CONSTRAINT FK_HD_NV FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien),
    CONSTRAINT FK_HD_LHD FOREIGN KEY (MaLoaiHopDong) REFERENCES LoaiHopDong(MaLoaiHopDong)
);
CREATE TABLE ChamCong (
    MaChamCong INT IDENTITY PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,
    Ngay DATE NOT NULL,

    GioVao TIME,
    GioRa TIME,
    TrangThai NVARCHAR(50),

    CONSTRAINT FK_CC_NV FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien),

    CONSTRAINT UQ_ChamCong UNIQUE (MaNhanVien, Ngay)
);
CREATE TABLE NghiPhep (
    MaNghiPhep INT IDENTITY PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,

    TuNgay DATE,
    DenNgay DATE,
    LyDo NVARCHAR(255),
    TrangThai NVARCHAR(50),

    CONSTRAINT FK_NP_NV FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);
CREATE TABLE Luong (
    MaLuong INT IDENTITY PRIMARY KEY,
    MaNhanVien VARCHAR(10) NOT NULL,

    Thang INT,
    Nam INT,

    LuongCoBan FLOAT,
    PhuCap FLOAT,
    Thuong FLOAT,
    KhauTru FLOAT,

    CONSTRAINT FK_L_NV FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien),

    CONSTRAINT UQ_Luong UNIQUE (MaNhanVien, Thang, Nam)
);
CREATE TABLE Role (
    MaRole VARCHAR(10) PRIMARY KEY,
    TenRole NVARCHAR(50)
);

CREATE TABLE Users (
    Username VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(100) NOT NULL,

    MaRole VARCHAR(10),
    MaChiNhanh VARCHAR(10),

    CONSTRAINT FK_U_R FOREIGN KEY (MaRole) REFERENCES Role(MaRole),
    CONSTRAINT FK_U_CN FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh)
);

CREATE TABLE SyncLog (
    ID INT IDENTITY PRIMARY KEY,
    TableName VARCHAR(50),
    ActionType VARCHAR(10),
    RecordID VARCHAR(50),
    ThoiGian DATETIME DEFAULT GETDATE(),
    Node NVARCHAR(50),
    TrangThai NVARCHAR(50)
);