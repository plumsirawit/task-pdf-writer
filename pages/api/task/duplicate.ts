import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";
import { v4 } from "uuid";

initAuth();

const Body = t.type({
  contestId: t.string,
  taskId: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const { contestId, taskId } = bodyDecoded.right;
    const admin = getFirebaseAdmin();
    const contestDoc = await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .get();
    const contestData = contestDoc.data();
    if (!contestData) {
      res.status(404).send({ error: `contest ${contestId} not found` });
      return;
    }
    const uid = req.authUser.id;
    if (!uid) {
      res.status(500).send({ error: "uid not found" });
      return;
    }
    if (!contestData.users.includes(uid)) {
      res.status(403).send({ error: "user have no access to contest" });
      return;
    }
    let newTaskId = v4();
    const oldMarkdown = await admin
      .database()
      .ref("tasks/" + taskId)
      .get();
    await admin
      .database()
      .ref("tasks/" + newTaskId)
      .set({
        "allowed-uids": Object.fromEntries(
          contestData.users.map((user: string) => [user, "."])
        ),
        contest: contestId,
        "current-uid": req.authUser.id,
        markdown: oldMarkdown?.val()?.markdown,
        name: oldMarkdown?.val()?.name,
      });
    await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .update({
        // @ts-ignore
        tasks: admin.firestore.FieldValue.arrayUnion(newTaskId),
      });
    res.status(200).send({ message: "success", taskId: newTaskId });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callDuplicateTaskApi = wrapApi<
  Payload,
  { message?: string; error?: string; taskId?: string }
>("/api/task/duplicate", "post");
