import type { NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";
import { Task } from "../task/list";
import admin from "../../../utils/firebaseAdmin";

const Body = t.type({
  contestId: t.string,
  otherUserId: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const { contestId, otherUserId } = bodyDecoded.right;
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
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(otherUserId)
      .get();
    if (!userDoc.exists) {
      res.status(404).send({ error: "other user not found" });
      return;
    }
    const snapshot = await admin
      .database()
      .ref("tasks/")
      .orderByChild("contest")
      .equalTo(contestId)
      .once("value");
    const docs: Record<string, Task> = snapshot.val() ?? {};
    await Promise.all(
      Object.keys(docs).map((task) =>
        admin
          .database()
          .ref("tasks/" + task + "/allowed-uids/" + otherUserId)
          .set(".")
      )
    );
    if (!contestData.users.includes(otherUserId)) {
      await admin
        .firestore()
        .collection("contests")
        .doc(contestId)
        .update({
          users: FieldValue.arrayUnion(otherUserId),
        });
    }
    res.status(200).send({ message: "success" });
  } catch (e: any) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callAddUserToContestApi = wrapApi<
  Payload,
  { message?: string; error?: string }
>("/api/contest/adduser", "put");
