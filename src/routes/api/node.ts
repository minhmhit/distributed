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
import { attachAuthContext, requireRoles } from "../../middleware/auth";

const nodeRoutes = Router();

nodeRoutes.use(attachAuthContext);

nodeRoutes.post(
  "/node/employees",
  requireRoles(["admin", "node_admin", "hr_manager"], {
    enforceBranchScope: true,
  }),
  createEmployeeController,
);

nodeRoutes.post(
  "/node/contracts",
  requireRoles(["admin", "node_admin", "hr_manager"]),
  createContractController,
);

nodeRoutes.post(
  "/node/attendance/check-in",
  requireRoles(["admin", "node_admin", "hr_manager", "staff"]),
  checkInAttendanceController,
);

nodeRoutes.post(
  "/node/attendance/check-out",
  requireRoles(["admin", "node_admin", "hr_manager", "staff"]),
  checkOutAttendanceController,
);

nodeRoutes.post(
  "/node/leaves",
  requireRoles(["admin", "node_admin", "hr_manager", "staff"]),
  createLeaveRequestController,
);

nodeRoutes.put(
  "/node/leaves/:maNghiPhep/approval",
  requireRoles(["admin", "node_admin", "hr_manager"]),
  approveLeaveController,
);

nodeRoutes.post(
  "/node/salaries/generate",
  requireRoles(["admin", "node_admin", "hr_manager"]),
  generateSalaryController,
);

nodeRoutes.get(
  "/node/reports/local",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  localSearchReportController,
);

export default nodeRoutes;
