import { Router } from "express";
import {
  pullFromNodeController,
  pushToNodeController,
} from "../controllers/syncController";

const syncRoutes = Router();

syncRoutes.post("/sync/node-to-publisher", pullFromNodeController);
syncRoutes.post("/sync/publisher-to-node", pushToNodeController);

export default syncRoutes;
