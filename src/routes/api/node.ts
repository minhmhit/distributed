import { Router } from "express";
import {
  approveLeaveController,
  syncStatusController,
  checkInAttendanceController,
  checkOutAttendanceController,
  createContractController,
  createEmployeeController,
  createLeaveRequestController,
  deleteEmployeeController,
  generateSalaryController,
  getAttendanceController,
  listBranchesController,
  listContractsController,
  listContractTypesController,
  listDepartmentsController,
  listEmployeesController,
  listLeavesController,
  listPositionsController,
  listSalariesController,
  localSearchReportController,
  updateEmployeeController,
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

nodeRoutes.get(
  "/node/employees",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listEmployeesController,
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

nodeRoutes.get(
  "/node/contracts",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listContractsController,
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

nodeRoutes.get(
  "/node/attendance/:maNhanVien",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  getAttendanceController,
);

nodeRoutes.post(
  "/node/leaves",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "staff"]),
  createLeaveRequestController,
);

nodeRoutes.get(
  "/node/leaves",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listLeavesController,
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
  "/node/salaries",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listSalariesController,
);

nodeRoutes.get(
  "/node/reports/local",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager", "viewer"]),
  localSearchReportController,
);

nodeRoutes.get(
  "/node/sync/status",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  syncStatusController,
);

nodeRoutes.get(
  "/node/branches",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listBranchesController,
);

nodeRoutes.get(
  "/node/positions",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listPositionsController,
);

nodeRoutes.get(
  "/node/contract-types",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listContractTypesController,
);

nodeRoutes.get(
  "/node/departments",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listDepartmentsController,
);

export default nodeRoutes;
