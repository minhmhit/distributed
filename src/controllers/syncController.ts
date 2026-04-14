import { Request, Response } from "express";

export function pullFromNodeController(
  _request: Request,
  response: Response,
): void {
  response.status(501).json({
    message: "TODO: implement node-to-publisher sync receiver",
  });
}

export function pushToNodeController(
  _request: Request,
  response: Response,
): void {
  response.status(501).json({
    message: "TODO: implement publisher-to-node sync sender",
  });
}
