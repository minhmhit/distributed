import { Router } from "express";
import healthRoutes from "./healthRoutes";
import nodeRoutes from "./api/node";
import publisherRoutes from "./api/publisher";
import syncRoutes from "./syncRoutes";

const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(syncRoutes);
apiRoutes.use(publisherRoutes);
apiRoutes.use(nodeRoutes);

export default apiRoutes;
