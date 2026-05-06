import { Router } from "express";
import { webhooksRouter } from "./webhooks";
import { reviewsRouter } from "./reviews";

export const apiRouter = Router();

apiRouter.use("/webhooks", webhooksRouter);
apiRouter.use("/reviews", reviewsRouter);

