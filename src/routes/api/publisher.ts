import { Router } from "express";
import {
  companySearchController,
  createAccountController,
  createBranchController,
  createContractTypeController,
  createEmployeeController,
  createPositionController,
  deleteEmployeeController,
  ingestNodeDataController,
  listBranchesController,
  listContractTypesController,
  listPositionsController,
  reactivateEmployeeController,
  summaryReportController,
  syncMonitorController,
  updateBranchController,
  updateEmployeeController,
  updatePositionController,
} from "../../controllers/publisherController";
import { attachAuthContext, requireRoles } from "../../middleware/auth";

const publisherRoutes = Router();

publisherRoutes.use(attachAuthContext);

publisherRoutes.get(
  "/publisher/branches",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "viewer"]),
  listBranchesController,
);
publisherRoutes.post(
  "/publisher/branches",
  requireRoles(["admin", "publisher_admin"], { enforceBranchScope: true }),
  createBranchController,
);
publisherRoutes.put(
  "/publisher/branches/:maChiNhanh",
  requireRoles(["admin", "publisher_admin"], { enforceBranchScope: true }),
  updateBranchController,
);

publisherRoutes.get(
  "/publisher/positions",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "viewer"]),
  listPositionsController,
);
publisherRoutes.post(
  "/publisher/positions",
  requireRoles(["admin", "publisher_admin"]),
  createPositionController,
);
publisherRoutes.put(
  "/publisher/positions/:maChucVu",
  requireRoles(["admin", "publisher_admin"]),
  updatePositionController,
);

publisherRoutes.get(
  "/publisher/contract-types",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "viewer"]),
  listContractTypesController,
);
publisherRoutes.post(
  "/publisher/contract-types",
  requireRoles(["admin", "publisher_admin"]),
  createContractTypeController,
);

publisherRoutes.post(
  "/publisher/employees",
  requireRoles(["admin", "publisher_admin"]),
  createEmployeeController,
);
publisherRoutes.put(
  "/publisher/employees/:maNhanVien",
  requireRoles(["admin", "publisher_admin"]),
  updateEmployeeController,
);
publisherRoutes.delete(
  "/publisher/employees/:maNhanVien",
  requireRoles(["admin", "publisher_admin"]),
  deleteEmployeeController,
);
publisherRoutes.patch(
  "/publisher/employees/:maNhanVien/reactivate",
  requireRoles(["admin", "publisher_admin"]),
  reactivateEmployeeController,
);

publisherRoutes.post(
  "/publisher/accounts",
  requireRoles(["admin", "publisher_admin"]),
  createAccountController,
);

publisherRoutes.post(
  "/publisher/ingest",
  requireRoles(["admin", "publisher_admin", "sync_service"]),
  ingestNodeDataController,
);

publisherRoutes.get(
  "/publisher/company-search",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "viewer"]),
  companySearchController,
);

publisherRoutes.get(
  "/publisher/reports/summary",
  requireRoles(["admin", "publisher_admin", "hr_manager"]),
  summaryReportController,
);

publisherRoutes.get(
  "/publisher/sync-monitor",
  requireRoles(["admin", "publisher_admin", "hr_manager", "viewer"]),
  syncMonitorController,
);

export default publisherRoutes;
