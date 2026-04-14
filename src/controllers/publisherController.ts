import { Request, Response } from "express";
import {
  companySearch,
  createBranch,
  createContractType,
  createPosition,
  createUserAccount,
  ingestNodeData,
  listBranches,
  listContractTypes,
  listPositions,
  summaryReport,
  syncMonitor,
  updateBranch,
  updatePosition,
} from "../services/publisherService";

function handleControllerError(response: Response, error: unknown): void {
  if (error instanceof Error) {
    response.status(400).json({ message: error.message });
    return;
  }

  response.status(400).json({ message: "Request khong hop le" });
}

export async function createBranchController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await createBranch(request.body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function updateBranchController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maChiNhanh = String(request.params.maChiNhanh ?? "");
    const result = await updateBranch(maChiNhanh, request.body);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listBranchesController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await listBranches();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function createPositionController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await createPosition(request.body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function updatePositionController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const maChucVu = String(request.params.maChucVu ?? "");
    const result = await updatePosition(maChucVu, request.body);
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
    const result = await listPositions();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function createContractTypeController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await createContractType(request.body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function listContractTypesController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await listContractTypes();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function createAccountController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await createUserAccount(request.body);
    response.status(201).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function ingestNodeDataController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await ingestNodeData(request.body);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function companySearchController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const keyword = request.query.keyword as string | undefined;
    const result = await companySearch(keyword);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function summaryReportController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await summaryReport();
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}

export async function syncMonitorController(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const threshold = Number(request.query.thresholdMinutes ?? 30);
    const result = await syncMonitor(threshold);
    response.status(200).json(result);
  } catch (error) {
    handleControllerError(response, error);
  }
}
