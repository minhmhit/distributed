SET NOCOUNT ON;
USE QuanLyNhanSu;
GO

/*
  Master seed data cho he thong distributed.
  - Chay script nay tren Publisher de khoi tao du lieu master.
  - Node HCM va Node HN co the nhan du lieu nay qua dong bo tu Publisher.
  - Neu can setup nhanh node doc lap, co the chay truc tiep script nay tai node.
*/

IF NOT EXISTS (SELECT 1 FROM dbo.ChiNhanh WHERE MaChiNhanh = 'CNHCM')
BEGIN
  INSERT INTO dbo.ChiNhanh (MaChiNhanh, TenChiNhanh, DiaChi, TrangThai)
  VALUES ('CNHCM', N'Chi nhanh Ho Chi Minh', N'Quan 1, TP HCM', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ChiNhanh WHERE MaChiNhanh = 'CNHN')
BEGIN
  INSERT INTO dbo.ChiNhanh (MaChiNhanh, TenChiNhanh, DiaChi, TrangThai)
  VALUES ('CNHN', N'Chi nhanh Ha Noi', N'Cau Giay, Ha Noi', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R01')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R01', N'admin');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R02')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R02', N'publisher_admin');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R03')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R03', N'node_admin');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R04')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R04', N'hr_manager');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R05')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R05', N'staff');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R06')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R06', N'viewer');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE MaRole = 'R07')
BEGIN
  INSERT INTO dbo.Role (MaRole, TenRole) VALUES ('R07', N'sync_service');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ChucVu WHERE MaChucVu = 'CV01')
BEGIN
  INSERT INTO dbo.ChucVu (MaChucVu, TenChucVu, HeSoLuong)
  VALUES ('CV01', N'Nhan vien', 1.0);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.ChucVu WHERE MaChucVu = 'CV02')
BEGIN
  INSERT INTO dbo.ChucVu (MaChucVu, TenChucVu, HeSoLuong)
  VALUES ('CV02', N'Truong nhom', 1.5);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.ChucVu WHERE MaChucVu = 'CV03')
BEGIN
  INSERT INTO dbo.ChucVu (MaChucVu, TenChucVu, HeSoLuong)
  VALUES ('CV03', N'Truong phong', 2.0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.LoaiHopDong WHERE MaLoaiHopDong = 'LHD01')
BEGIN
  INSERT INTO dbo.LoaiHopDong (MaLoaiHopDong, TenLoaiHopDong, ThoiHanThang)
  VALUES ('LHD01', N'Thu viec', 2);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.LoaiHopDong WHERE MaLoaiHopDong = 'LHD02')
BEGIN
  INSERT INTO dbo.LoaiHopDong (MaLoaiHopDong, TenLoaiHopDong, ThoiHanThang)
  VALUES ('LHD02', N'Xac dinh thoi han 12 thang', 12);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.LoaiHopDong WHERE MaLoaiHopDong = 'LHD03')
BEGIN
  INSERT INTO dbo.LoaiHopDong (MaLoaiHopDong, TenLoaiHopDong, ThoiHanThang)
  VALUES ('LHD03', N'Khong xac dinh thoi han', NULL);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.PhongBan WHERE MaPhongBan = 'PBHCM01')
BEGIN
  INSERT INTO dbo.PhongBan (MaPhongBan, TenPhongBan, MaChiNhanh)
  VALUES ('PBHCM01', N'Hanh chinh', 'CNHCM');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PhongBan WHERE MaPhongBan = 'PBHCM02')
BEGIN
  INSERT INTO dbo.PhongBan (MaPhongBan, TenPhongBan, MaChiNhanh)
  VALUES ('PBHCM02', N'Ke toan', 'CNHCM');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PhongBan WHERE MaPhongBan = 'PBHN01')
BEGIN
  INSERT INTO dbo.PhongBan (MaPhongBan, TenPhongBan, MaChiNhanh)
  VALUES ('PBHN01', N'Hanh chinh', 'CNHN');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PhongBan WHERE MaPhongBan = 'PBHN02')
BEGIN
  INSERT INTO dbo.PhongBan (MaPhongBan, TenPhongBan, MaChiNhanh)
  VALUES ('PBHN02', N'Ke toan', 'CNHN');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.NhanVien WHERE MaNhanVien = 'NVHCM001')
BEGIN
  INSERT INTO dbo.NhanVien
    (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam, TrangThai)
  VALUES
    ('NVHCM001', N'Nguyen Minh Khang', '1996-03-15', N'Nam', '0903123456', 'khang.nm@company.local', 'PBHCM01', 'CV02', '2022-06-01', N'Dang lam');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.NhanVien WHERE MaNhanVien = 'NVHCM002')
BEGIN
  INSERT INTO dbo.NhanVien
    (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam, TrangThai)
  VALUES
    ('NVHCM002', N'Tran Thu Ha', '1998-11-22', N'Nu', '0904234567', 'ha.tt@company.local', 'PBHCM02', 'CV01', '2023-01-10', N'Dang lam');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.NhanVien WHERE MaNhanVien = 'NVHCM003')
BEGIN
  INSERT INTO dbo.NhanVien
    (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam, TrangThai)
  VALUES
    ('NVHCM003', N'Le Hoang Long', '1994-08-08', N'Nam', '0905345678', 'long.lh@company.local', 'PBHCM02', 'CV03', '2021-09-15', N'Dang lam');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.NhanVien WHERE MaNhanVien = 'NVHN001')
BEGIN
  INSERT INTO dbo.NhanVien
    (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam, TrangThai)
  VALUES
    ('NVHN001', N'Pham Quynh Anh', '1997-05-30', N'Nu', '0912456789', 'anh.pq@company.local', 'PBHN01', 'CV02', '2022-04-20', N'Dang lam');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.NhanVien WHERE MaNhanVien = 'NVHN002')
BEGIN
  INSERT INTO dbo.NhanVien
    (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam, TrangThai)
  VALUES
    ('NVHN002', N'Do Van Tien', '1995-12-11', N'Nam', '0913567890', 'tien.dv@company.local', 'PBHN02', 'CV01', '2023-02-01', N'Dang lam');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.NhanVien WHERE MaNhanVien = 'NVHN003')
BEGIN
  INSERT INTO dbo.NhanVien
    (MaNhanVien, HoTen, NgaySinh, GioiTinh, SDT, Email, MaPhongBan, MaChucVu, NgayVaoLam, TrangThai)
  VALUES
    ('NVHN003', N'Bui Gia Bao', '1993-01-19', N'Nam', '0914678901', 'bao.bg@company.local', 'PBHN02', 'CV03', '2020-11-05', N'Dang lam');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.HopDong WHERE MaHopDong = 'HDNV001')
BEGIN
  INSERT INTO dbo.HopDong (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
  VALUES ('HDNV001', 'NVHCM001', 'LHD03', '2022-06-01', NULL, N'Hieu luc');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.HopDong WHERE MaHopDong = 'HDNV002')
BEGIN
  INSERT INTO dbo.HopDong (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
  VALUES ('HDNV002', 'NVHCM002', 'LHD02', '2023-01-10', '2024-01-09', N'Het han');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.HopDong WHERE MaHopDong = 'HDNV003')
BEGIN
  INSERT INTO dbo.HopDong (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
  VALUES ('HDNV003', 'NVHCM003', 'LHD03', '2021-09-15', NULL, N'Hieu luc');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.HopDong WHERE MaHopDong = 'HDNV004')
BEGIN
  INSERT INTO dbo.HopDong (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
  VALUES ('HDNV004', 'NVHN001', 'LHD03', '2022-04-20', NULL, N'Hieu luc');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.HopDong WHERE MaHopDong = 'HDNV005')
BEGIN
  INSERT INTO dbo.HopDong (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
  VALUES ('HDNV005', 'NVHN002', 'LHD02', '2023-02-01', '2024-01-31', N'Het han');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.HopDong WHERE MaHopDong = 'HDNV006')
BEGIN
  INSERT INTO dbo.HopDong (MaHopDong, MaNhanVien, MaLoaiHopDong, NgayBatDau, NgayKetThuc, TrangThai)
  VALUES ('HDNV006', 'NVHN003', 'LHD03', '2020-11-05', NULL, N'Hieu luc');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'publisher_admin')
BEGIN
  -- Password goc: 123456 (da duoc hash bang bcrypt).
  INSERT INTO dbo.Users (Username, Password, MaRole, MaChiNhanh)
  VALUES ('publisher_admin', '$2b$10$8zYxyqy3s72rmKxeBn1Q7Oe3aLsj1AEEFtcgB3QBvOlCy7XekG3PW', 'R02', NULL);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'node_hcm_admin')
BEGIN
  -- Password goc: 123456 (da duoc hash bang bcrypt).
  INSERT INTO dbo.Users (Username, Password, MaRole, MaChiNhanh)
  VALUES ('node_hcm_admin', '$2b$10$VwQFq9OnCTu1nnYGUpjuaukZ/HiaFNhBr6wXN0bedAgJ3SUizzcJC', 'R03', 'CNHCM');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'node_hn_admin')
BEGIN
  -- Password goc: 123456 (da duoc hash bang bcrypt).
  INSERT INTO dbo.Users (Username, Password, MaRole, MaChiNhanh)
  VALUES ('node_hn_admin', '$2b$10$CrXzg5lJMuXiHCmXiFYdqe0oHvq2Q5ElFMg8xLIoaVvCE2zh6izMO', 'R03', 'CNHN');
END;
GO
