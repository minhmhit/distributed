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
  updateEmployeeController,
  deleteEmployeeController,
  reactivateEmployeeController,
} from "../../controllers/nodeController";
import { attachAuthContext, requireRoles } from "../../middleware/auth";

const nodeRoutes = Router();

nodeRoutes.use(attachAuthContext);

nodeRoutes.post(
  "/node/employees",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"], {
    enforceBranchScope: true,
  }),
  createEmployeeController,
);

nodeRoutes.put(
  "/node/employees/:maNhanVien",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"], {
    enforceBranchScope: true,
  }),
  updateEmployeeController,
);

nodeRoutes.delete(
  "/node/employees/:maNhanVien",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"], {
    enforceBranchScope: true,
  }),
  deleteEmployeeController,
);

nodeRoutes.patch(
  "/node/employees/:maNhanVien/reactivate",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"]),
  reactivateEmployeeController,
);

nodeRoutes.post(
  "/node/contracts",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"]),
  createContractController,
);

nodeRoutes.post(
  "/node/attendance/check-in",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "staff"]),
  checkInAttendanceController,
);

nodeRoutes.post(
  "/node/attendance/check-out",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "staff"]),
  checkOutAttendanceController,
);

nodeRoutes.post(
  "/node/leaves",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "staff"]),
  createLeaveRequestController,
);

nodeRoutes.put(
  "/node/leaves/:maNghiPhep/approval",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"]),
  approveLeaveController,
);

nodeRoutes.post(
  "/node/salaries/generate",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"]),
  generateSalaryController,
);

nodeRoutes.get(
  "/node/reports/local",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "viewer"]),
  localSearchReportController,
);

export default nodeRoutes;
