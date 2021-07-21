import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";
import { Task } from "../task/list";
import { deleteCollection } from "../../../utils/deleteCollection";

initAuth();

const Body = t.type({
  contestId: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const { contestId } = bodyDecoded.right;
    const admin = getFirebaseAdmin();
    const contestDoc = await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .get();
    const contestData = contestDoc.data();
    if (!contestData) {
      res.status(404).send({ error: "contest not found" });
      return;
    }
    const uid = req.authUser.id;
    if (!uid) {
      res.status(500).send({ error: "uid not found" });
      return;
    }
    if (!contestData.users || !contestData.users.includes(uid)) {
      res.status(403).send({ error: "forbidden access" });
      return;
    }
    /*
    Maybe not? This section is skipped to support data recovery on mistake deletes.
    const docs = await new Promise<Record<string, Task>>((reso) =>
      admin
        .database()
        .ref("tasks/")
        .orderByChild("contest")
        .equalTo(contestId)
        .once("value", (docs) => reso(docs.val()))
    );
    await Promise.all(
      Object.keys(docs).map((task) =>
        admin
          .database()
          .ref("tasks/" + task)
          .remove()
      )
    );
    */
    await deleteCollection(
      admin.firestore(),
      `contests/${contestId}/assets`,
      50
    );
    await admin.firestore().collection("contests").doc(contestId).delete();
    res.status(200).send({ message: "success" });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callDeleteContestApi = wrapApi<
  Payload,
  { message?: string; error?: string }
>("/api/contest/delete", "delete");
