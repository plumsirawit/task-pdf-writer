import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";

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
    if (!contestDoc.exists) {
      res.status(404).send({ error: `contest ${contestId} not found` });
      return;
    }
    const uid = req.authUser.id;
    if (!uid) {
      res.status(500).send({ error: "uid not found" });
      return;
    }
    const docs = await new Promise((reso) =>
      admin
        .database()
        .ref("tasks/")
        .orderByChild("contest")
        .equalTo(contestId)
        .once("value", (docs) => reso(docs))
    );
    res.status(200).send({ message: "success", tasks: docs });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export interface Task {
  "allowed-uids": Record<string, string>;
  contest: string;
  "current-uid": string;
  markdown: string;
  name: string;
}
export const callListTasksApi = wrapApi<
  Payload,
  { message?: string; error?: string; tasks?: Record<string, Task> }
>("/api/task/list", "post");
