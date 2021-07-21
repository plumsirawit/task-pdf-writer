import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";
import mime from "mime";

initAuth();

const Body = t.type({
  contestId: t.string,
  assetId: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const { contestId, assetId } = bodyDecoded.right;
    const admin = getFirebaseAdmin();
    const bucket = admin.storage().bucket("task-pdf-writer.appspot.com");
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
    const assetDoc = await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .collection("assets")
      .doc(assetId)
      .get();
    const assetData = assetDoc.data();
    if (!assetData) {
      res.status(409).send({ error: "asset not found" });
      return;
    }
    const mimeType = assetData.contentType;
    const ext = mime.getExtension(mimeType);
    const filePath = `assets/${assetId}.${ext}`;
    await bucket.file(filePath).delete();
    await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .collection("assets")
      .doc(assetId)
      .delete();
    res.status(200).send({ message: "success" });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callDeleteAssetApi = wrapApi<
  Payload,
  { message?: string; error?: string }
>("/api/asset/delete", "delete");
