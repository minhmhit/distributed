import { Router } from "express";
import healthRoutes from "./healthRoutes";
import syncRoutes from "./syncRoutes";

const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(syncRoutes);

export default apiRoutes;
