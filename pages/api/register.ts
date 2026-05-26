import type { NextApiRequest, NextApiResponse } from "next";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../utils/apiWrapper";
import admin from "../../utils/firebaseAdmin";

const Body = t.type({
  email: t.string,
  password: t.string,
  fullname: t.string,
  displayname: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const bodyDecoded = Body.decode(req.body);
  if (isLeft(bodyDecoded)) {
    res.status(400).send({ error: "bad request" });
    return;
  }
  const { email, password, fullname, displayname } = bodyDecoded.right;
  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayname,
    });
  } catch (e: any) {
    console.log("createUser error", e);
    res.status(400).send({ error: e.message });
    return;
  }
  try {
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      fullname,
      displayname,
    });
  } catch (e: any) {
    console.log("internal server error", e);
    res.status(500).send({ error: e.message });
    return;
  }
  res.status(200).send({ message: "success" });
};

export default handler;

export const callRegisterApi = wrapApi<
  Payload,
  { message?: string; error?: string }
>("/api/register", "post");
