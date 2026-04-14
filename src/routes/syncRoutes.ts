import { Router } from "express";
import {
  pullFromNodeController,
  pushToNodeController,
} from "../controllers/syncController";
import { attachAuthContext, requireRoles } from "../middleware/auth";

const syncRoutes = Router();

syncRoutes.use(attachAuthContext);

syncRoutes.post(
  "/sync/node-to-publisher",
  requireRoles(["admin", "publisher_admin", "node_admin", "sync_service"]),
  pullFromNodeController,
);
syncRoutes.post(
  "/sync/publisher-to-node",
  requireRoles(["admin", "publisher_admin", "node_admin", "sync_service"]),
  pushToNodeController,
);

export default syncRoutes;
