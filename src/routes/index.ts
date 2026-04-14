import { Router } from "express";
import healthRoutes from "./healthRoutes";
import publisherRoutes from "./api/publisher";
import syncRoutes from "./syncRoutes";

const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(syncRoutes);
apiRoutes.use(publisherRoutes);

export default apiRoutes;
