import type { NextApiResponse } from "next";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";
import admin from "../../../utils/firebaseAdmin";

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
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
  } catch (e: any) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callCreateContestApi = wrapApi<
  {},
  { message?: string; error?: string; contestId?: string }
>("/api/contest/create", "post");
