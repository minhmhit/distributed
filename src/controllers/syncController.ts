import { Request, Response } from "express";
import {
  runNodeToPublisherSync,
  runPublisherToNodeSync,
} from "../sync/syncService";

export async function pullFromNodeController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await runNodeToPublisherSync();
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : "Sync failed",
    });
  }
}

export async function pushToNodeController(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await runPublisherToNodeSync();
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : "Sync failed",
    });
  }
}
