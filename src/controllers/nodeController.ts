import { Request, Response } from "express";
import {
  checkInAttendance,
  checkOutAttendance,
  createContract,
  createEmployee,
  createLeaveRequest,
  deleteEmployee,
  generateSalary,
  getAttendanceByEmployee,
  getSyncPendingCount,
  listLeaves,
  listLocalContracts,
  listLocalBranches,
  listLocalContractTypes,
  listLocalDepartments,
  listLocalEmployees,
  listLocalPositions,
  listLocalSalaries,
  localSearchAndReport,
  reactivateEmployee,
  updateEmployee,
  updateLeaveApproval,
} from "../services/nodeService";

function handleControllerError(response: Response, error: unknown): void {
  if (error instanceof Error) {
    response.status(400).json({ message: error.message });
    return;
  }

  response.status(400).json({ message: "Request khong hop le" });
}

export async function createEmployeeController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    // Auto-inject maChiNhanh từ token nếu không có trong body
    const maChiNhanhFromToken = request.auth?.branchCode;
    const body = {
      ...request.body,
      maChiNhanh: request.body.maChiNhanh || maChiNhanhFromToken,
    };

    if (!body.maChiNhanh) {
      response.status(400).json({ message: "maChiNhanh la bat buoc" });
      return;
    }

    const result = await createEmployee(body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listBranchesController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await listLocalBranches();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listPositionsController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await listLocalPositions();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listContractTypesController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await listLocalContractTypes();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listDepartmentsController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await listLocalDepartments();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function createContractController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await createContract(request.body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listContractsController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maNhanVien = request.query.maNhanVien as string | undefined;
    const result = await listLocalContracts({ maNhanVien });
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function checkInAttendanceController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await checkInAttendance(request.body);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function checkOutAttendanceController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await checkOutAttendance(request.body);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function createLeaveRequestController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await createLeaveRequest(request.body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function approveLeaveController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await updateLeaveApproval({
      maNghiPhep: Number(request.params.maNghiPhep),
      trangThai: request.body.trangThai,
    });
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function generateSalaryController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await generateSalary(request.body);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listSalariesController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maNhanVien = request.query.maNhanVien as string | undefined;
    const thang = request.query.thang ? Number(request.query.thang) : undefined;
    const nam = request.query.nam ? Number(request.query.nam) : undefined;

    const result = await listLocalSalaries({ maNhanVien, thang, nam });
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function localSearchReportController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const keyword = request.query.keyword as string | undefined;
    const thang = request.query.thang ? Number(request.query.thang) : undefined;
    const nam = request.query.nam ? Number(request.query.nam) : undefined;

    const result = await localSearchAndReport({ keyword, thang, nam });
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listEmployeesController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const keyword = request.query.keyword as string | undefined;
    const result = await listLocalEmployees(keyword);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function updateEmployeeController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maNhanVien = String(request.params.maNhanVien ?? "");
    const result = await updateEmployee(maNhanVien, request.body, request.auth?.branchCode);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function deleteEmployeeController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maNhanVien = String(request.params.maNhanVien ?? "");
    const result = await deleteEmployee(maNhanVien, request.auth?.branchCode);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function reactivateEmployeeController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maNhanVien = String(request.params.maNhanVien ?? "");
    const result = await reactivateEmployee(maNhanVien, request.auth?.branchCode);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listLeavesController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const trangThai = request.query.trangThai as string | undefined;
    const maNhanVien = request.query.maNhanVien as string | undefined;
    const result = await listLeaves({ trangThai, maNhanVien });
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function getAttendanceController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maNhanVien = String(request.params.maNhanVien ?? "");
    const tuNgay = request.query.tuNgay as string | undefined;
    const denNgay = request.query.denNgay as string | undefined;
    const result = await getAttendanceByEmployee({ maNhanVien, tuNgay, denNgay });
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function syncStatusController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await getSyncPendingCount();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}
