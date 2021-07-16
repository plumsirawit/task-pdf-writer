import initAuth from "../../initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import firebase from "firebase/app";
import "firebase/auth";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../utils/apiWrapper";
import { firebaseConfig } from "../../constants";

initAuth();
let firebaseClient =
  firebase.apps.find((app) => app.name === "client") ||
  firebase.initializeApp(firebaseConfig, "client");

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
  let userCred = null;
  try {
    userCred = await firebaseClient
      .auth()
      .createUserWithEmailAndPassword(email, password);
  } catch (e) {
    console.log("createUser error", e);
    res.status(400).send({ error: e.message });
    return;
  }
  try {
    const user = userCred?.user;
    if (!user) {
      throw Error("user not found");
    }
    const admin = getFirebaseAdmin();
    await admin.firestore().collection("users").doc(user.uid).set({
      fullname,
      displayname,
    });
  } catch (e) {
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
