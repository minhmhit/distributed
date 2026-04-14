import { Router } from "express";
import {
  approveLeaveController,
  checkInAttendanceController,
  checkOutAttendanceController,
  createContractController,
  createEmployeeController,
  createLeaveRequestController,
  generateSalaryController,
  localSearchReportController,
} from "../../controllers/nodeController";
import {
  attachAuthContext,
  enforceBranchScope,
  requireNodeRole,
} from "../../middleware/publisherAuth";

const nodeRoutes = Router();

nodeRoutes.use(attachAuthContext);

nodeRoutes.post(
  "/node/employees",
  requireNodeRole(["admin", "node_admin", "hr_manager"]),
  enforceBranchScope,
  createEmployeeController,
);

nodeRoutes.post(
  "/node/contracts",
  requireNodeRole(["admin", "node_admin", "hr_manager"]),
  createContractController,
);

nodeRoutes.post(
  "/node/attendance/check-in",
  requireNodeRole(["admin", "node_admin", "hr_manager", "staff"]),
  checkInAttendanceController,
);

nodeRoutes.post(
  "/node/attendance/check-out",
  requireNodeRole(["admin", "node_admin", "hr_manager", "staff"]),
  checkOutAttendanceController,
);

nodeRoutes.post(
  "/node/leaves",
  requireNodeRole(["admin", "node_admin", "hr_manager", "staff"]),
  createLeaveRequestController,
);

nodeRoutes.put(
  "/node/leaves/:maNghiPhep/approval",
  requireNodeRole(["admin", "node_admin", "hr_manager"]),
  approveLeaveController,
);

nodeRoutes.post(
  "/node/salaries/generate",
  requireNodeRole(["admin", "node_admin", "hr_manager"]),
  generateSalaryController,
);

nodeRoutes.get(
  "/node/reports/local",
  requireNodeRole(["admin", "node_admin", "hr_manager", "viewer"]),
  localSearchReportController,
);

export default nodeRoutes;
