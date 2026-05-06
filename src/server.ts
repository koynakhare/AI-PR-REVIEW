import express from "express";
import { env } from "./config/env";
import { apiRouter } from "./routes";

async function main(): Promise<void> {
  const app = express();
  app.use("/api", apiRouter);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on :${env.PORT}`);
  });
}

void main();

