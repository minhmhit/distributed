import { Router } from "express";
import {
  approveLeaveController,
  checkInAttendanceController,
  checkOutAttendanceController,
  createContractController,
  createEmployeeController,
  createLeaveRequestController,
  deleteEmployeeController,
  generateSalaryController,
  getAttendanceController,
  listEmployeesController,
  listLeavesController,
  localSearchReportController,
<<<<<<< HEAD
  updateEmployeeController,
  deleteEmployeeController,
  reactivateEmployeeController,
=======
  reactivateEmployeeController,
  syncStatusController,
  updateEmployeeController,
  listBranchesController,
  listPositionsController,
  listContractTypesController,
  listDepartmentsController,
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
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

<<<<<<< HEAD
nodeRoutes.put(
  "/node/employees/:maNhanVien",
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"], {
=======
nodeRoutes.get(
  "/node/employees",
  requireRoles(["admin", "node_admin", "hr_manager", "viewer"]),
  listEmployeesController,
);

nodeRoutes.put(
  "/node/employees/:maNhanVien",
  requireRoles(["admin", "node_admin", "hr_manager"], {
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
    enforceBranchScope: true,
  }),
  updateEmployeeController,
);

nodeRoutes.delete(
  "/node/employees/:maNhanVien",
<<<<<<< HEAD
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"], {
=======
  requireRoles(["admin", "node_admin", "hr_manager"], {
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
    enforceBranchScope: true,
  }),
  deleteEmployeeController,
);

nodeRoutes.patch(
  "/node/employees/:maNhanVien/reactivate",
<<<<<<< HEAD
  requireRoles(["admin", "publisher_admin", "node_admin", "hr_manager"]),
=======
  requireRoles(["admin", "node_admin", "hr_manager"], {
    enforceBranchScope: true,
  }),
>>>>>>> 7bdccd89169fbdd64c47bcf5afdd9e0174226cc9
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
