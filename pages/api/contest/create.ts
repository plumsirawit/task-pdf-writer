import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";

initAuth();

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    res.status(403).send({ message: "forbidden" });
    return;
    const admin = getFirebaseAdmin();
    const contestDoc = await admin
      .firestore()
      .collection("contests")
      .add({
        shortname: "",
        title: "",
        fulltitle: "",
        country: "",
        language: "",
        langcode: "",
        date: "",
        logo: "",
        users: [req.authUser.id],
        tasks: [],
      });
    res.status(200).send({ message: "success", contestId: contestDoc.id });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callCreateContestApi = wrapApi<
  {},
  { message?: string; error?: string; contestId?: string }
>("/api/contest/create", "post");
