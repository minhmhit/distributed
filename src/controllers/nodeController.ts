import { Request, Response } from "express";
import {
  checkInAttendance,
  checkOutAttendance,
  createContract,
  createEmployee,
  createLeaveRequest,
  generateSalary,
  localSearchAndReport,
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
    const result = await createEmployee(request.body);
    response.status(201).json(result);
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
