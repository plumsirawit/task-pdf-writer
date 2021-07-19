import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";

initAuth();

const Body = t.type({
  srcContestId: t.string,
  destContestId: t.string,
  taskId: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const getContestData = async (contestId: string) => {
  const admin = getFirebaseAdmin();
  const contestDoc = await admin
    .firestore()
    .collection("contests")
    .doc(contestId)
    .get();
  return contestDoc.data();
};
const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const { srcContestId, destContestId, taskId } = bodyDecoded.right;
    const admin = getFirebaseAdmin();
    const srcContestData = await getContestData(srcContestId);
    if (!srcContestData || !srcContestData.users) {
      res.status(404).send({ error: `contest ${srcContestId} not found` });
      return;
    }
    const destContestData = await getContestData(destContestId);
    if (!destContestData || !destContestData.users) {
      res.status(404).send({ error: `contest ${destContestId} not found` });
      return;
    }
    const uid = req.authUser.id;
    if (!uid) {
      res.status(500).send({ error: "uid not found" });
      return;
    }
    if (
      !srcContestData.users.includes(uid) ||
      !destContestData.users.includes(uid)
    ) {
      res.status(403).send({ error: "user have no access to contest" });
      return;
    }
    if (!srcContestData.tasks.includes(taskId)) {
      res.status(409).send({ error: "task not found" });
      return;
    }
    if (destContestData.tasks.includes(taskId)) {
      res.status(409).send({ error: "task found in destination" });
      return;
    }
    await admin
      .database()
      .ref("tasks/" + taskId + "/allowed-uids")
      .set(
        Object.fromEntries(
          destContestData.users.map((user: string) => [user, "."])
        )
      );
    await admin
      .firestore()
      .collection("contests")
      .doc(srcContestId)
      .update({
        // @ts-ignore
        tasks: admin.firestore.FieldValue.arrayRemove(taskId),
      });
    await admin
      .firestore()
      .collection("contests")
      .doc(destContestId)
      .update({
        // @ts-ignore
        tasks: admin.firestore.FieldValue.arrayUnion(taskId),
      });
    res.status(200).send({ message: "success" });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callMoveTaskApi = wrapApi<
  Payload,
  { message?: string; error?: string }
>("/api/task/move", "post");
