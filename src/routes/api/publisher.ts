import { Router } from "express";
import {
  companySearchController,
  createAccountController,
  createBranchController,
  createContractTypeController,
  createPositionController,
  ingestNodeDataController,
  listBranchesController,
  listContractTypesController,
  listPositionsController,
  summaryReportController,
  syncMonitorController,
  updateBranchController,
  updatePositionController,
} from "../../controllers/publisherController";
import {
  attachAuthContext,
  enforceBranchScope,
  requirePublisherRole,
} from "../../middleware/publisherAuth";

const publisherRoutes = Router();

publisherRoutes.use(attachAuthContext);

publisherRoutes.get(
  "/publisher/branches",
  requirePublisherRole(["admin", "publisher_admin", "hr_manager", "viewer"]),
  listBranchesController,
);
publisherRoutes.post(
  "/publisher/branches",
  requirePublisherRole(["admin", "publisher_admin"]),
  enforceBranchScope,
  createBranchController,
);
publisherRoutes.put(
  "/publisher/branches/:maChiNhanh",
  requirePublisherRole(["admin", "publisher_admin"]),
  enforceBranchScope,
  updateBranchController,
);

publisherRoutes.get(
  "/publisher/positions",
  requirePublisherRole(["admin", "publisher_admin", "hr_manager", "viewer"]),
  listPositionsController,
);
publisherRoutes.post(
  "/publisher/positions",
  requirePublisherRole(["admin", "publisher_admin"]),
  createPositionController,
);
publisherRoutes.put(
  "/publisher/positions/:maChucVu",
  requirePublisherRole(["admin", "publisher_admin"]),
  updatePositionController,
);

publisherRoutes.get(
  "/publisher/contract-types",
  requirePublisherRole(["admin", "publisher_admin", "hr_manager", "viewer"]),
  listContractTypesController,
);
publisherRoutes.post(
  "/publisher/contract-types",
  requirePublisherRole(["admin", "publisher_admin"]),
  createContractTypeController,
);

publisherRoutes.post(
  "/publisher/accounts",
  requirePublisherRole(["admin", "publisher_admin"]),
  createAccountController,
);

publisherRoutes.post(
  "/publisher/ingest",
  requirePublisherRole(["admin", "publisher_admin", "sync_service"]),
  ingestNodeDataController,
);

publisherRoutes.get(
  "/publisher/company-search",
  requirePublisherRole(["admin", "publisher_admin", "hr_manager", "viewer"]),
  companySearchController,
);

publisherRoutes.get(
  "/publisher/reports/summary",
  requirePublisherRole(["admin", "publisher_admin", "hr_manager"]),
  summaryReportController,
);

publisherRoutes.get(
  "/publisher/sync-monitor",
  requirePublisherRole(["admin", "publisher_admin", "hr_manager", "viewer"]),
  syncMonitorController,
);

export default publisherRoutes;
