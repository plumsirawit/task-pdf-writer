// For use with API in backend only. Not intended to be used in frontend.

import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";
import initAuth from "../initAuth";

initAuth();

export interface AuthApiRequest extends NextApiRequest {
  authUser: AuthUser;
}

export const withAuth = (
  fn: (req: AuthApiRequest, res: NextApiResponse) => void | Promise<void>
) => async (req: AuthApiRequest, res: NextApiResponse) => {
  const token = (req.headers.Authorization ??
    req.headers.authorization) as string;
  if (!token) {
    res.status(404).send({ error: "Authorization header not found" });
    return;
  }
  try {
    const AuthUser = await verifyIdToken(token);
    if (!AuthUser.id) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }
    req.authUser = AuthUser;
  } catch (e) {
    if (e.code === "auth/id-token-expired") {
      res.status(401).send({ error: "Unauthorized: token expired" });
    } else {
      console.log("Server Error: ", e);
      res.status(500).send({ error: "Unexpected error" });
    }
    return;
  }
  await fn(req, res);
};
