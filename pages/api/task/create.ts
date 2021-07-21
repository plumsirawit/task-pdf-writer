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
    let taskId = v4();
    await admin
      .database()
      .ref("tasks/" + taskId)
      .set({
        "allowed-uids": Object.fromEntries(
          contestData.users.map((user: string) => [user, "."])
        ),
        contest: contestId,
        "current-uid": req.authUser.id,
        markdown:
          "# Task Name\nTask Statement\n\nblah blah blah\n\nAdd math equations like $x^2 + 2x \\log x + \\frac{5}{x} \\in \\mathbb{R}$\n\nLet $A = [5, 4, 1, 2, 8, 9, 3, 7]$ and $B = [2, 1, 4, 3, 8, 6, 5, 2]$ \n\n## Implementation Details\nYou have to write the following procedures:\n```\nvoid init_land(int N, int M, int P, vector&lt;int> A, vector&lt;int> B)\n```\n* This procedure will be called exactly once.\n\n```\nlong long answer_query(int r1, int c1, int r2, int c2)\n```\n* This procedure will be called exactly $P$ times.\n \n## Constraints\n\n* $2 \\leq N, M \\leq  60\\,000$\n* $1 \\leq A[i] \\leq 1\\,000\\,000$ for all integers $0 \\leq i < N$\n* $1 \\leq B[i] \\leq 1\\,000\\,000$ for all integers $0 \\leq i < M$\n* $1 \\leq P \\leq 100\\,000$\n\n## Subtasks\n\n1. (2 points) Each partition will have an area of exactly $1$.\n2. (8 points) $N, M, P \\leq 100$.\n3. (22 points) $N, M \\leq 1\\,000$.\n4. (17 points) $P = 1$ Exactly one person gets the whole area of the kingdom. $A[i] \\leq 100\\,000$ for all integers $0 \\leq i < N$ and $B[i] \\leq 100\\,000$ for all integers $0 \\leq i < M$.\n5. (15 points) $A[i] \\leq 20$ for all integers $0 \\leq i < N$ and $B[i] \\leq 20$ for all integers $0 \\leq i < M$.\n6. (36 points) No additional constraints.\n\n## Examples\n\n```\ninit_land(8, 8, 10, [5, 4, 1, 2, 8, 9, 3, 7], [2, 1, 4, 3, 8, 6, 5, 2])\n```\n\nNext, there will be ten calls to the procedure `answer_query` as following:\n\n```\nanswer_query(0, 1, 1, 3)\n```\nreturns $2$\n```\nanswer_query(0, 4, 3, 4)\n```\nreturns $1$\n```\nanswer_query(0, 7, 0, 7)\n```\nreturns $0$\n```\nanswer_query(1, 6, 1, 7)\n```\nreturns $0$\n```\nanswer_query(2, 6, 4, 7)\n```\nreturns $2$\n```\nanswer_query(6, 6, 7, 7)\n```\nreturns $0$\n```\nanswer_query(7, 0, 7, 4)\n```\nreturns $0$\n```\nanswer_query(4, 2, 5, 4)\n```\nreturns $2$\n```\nanswer_query(4, 0, 5, 0)\n```\nreturns $1$\n```\nanswer_query(2, 0, 3, 2)\n```\nreturns $3$\n\n## Sample Grader\n\nThe sample grader reads data as the following:\n* Line $1$: $\\;\\;N \\;\\; M \\;\\; P$\n* Line $2$: $\\;\\;A[0] \\;\\; A[1] \\;\\; A[2] \\;\\ldots\\;  A[N-1]$\n* Line $3$: $\\;\\;B[0] \\;\\; B[1] \\;\\; B[2] \\;\\ldots\\;  B[M-1]$\n* Line $3+i$ to $3+P$: $\\;\\;r_1 \\;\\; c_1 \\;\\; r_2 \\;\\; c_2$\n\nThe sample grader prints the return values of the procedure `answer_query`\n\n## Limits\n* Time limit: 1.5 seconds\n* Memory limit: 512 MB",
        name: "untitled",
      });
    await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .update({
        // @ts-ignore
        tasks: admin.firestore.FieldValue.arrayUnion(taskId),
      });
    res.status(200).send({ message: "success", taskId });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callCreateTaskApi = wrapApi<
  Payload,
  { message?: string; error?: string; taskId?: string }
>("/api/task/create", "post");
