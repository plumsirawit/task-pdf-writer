import initAuth from "../../../initAuth";
import type { NextApiResponse } from "next";
import { getFirebaseAdmin } from "next-firebase-auth";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { wrapApi } from "../../../utils/apiWrapper";
import { AuthApiRequest, withAuth } from "../../../utils/withAuth";
import { v4 } from "uuid";
import mime from "mime";

initAuth();

const Body = t.type({
  contestId: t.string,
  base64Content: t.string,
});

export type Payload = t.TypeOf<typeof Body>;

const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const { contestId, base64Content } = bodyDecoded.right;
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
    const assetId = v4();
    const mimeType = base64Content.slice(
      base64Content.indexOf(":") + 1,
      base64Content.indexOf(";")
    );
    const ext = mime.getExtension(mimeType);
    const filePath = `assets/${assetId}.${ext}`;
    const base64data = base64Content.replace(/^data:\w+\/\w+;base64,/, "");
    const buffer = Buffer.from(base64data, "base64");
    await bucket.file(filePath).save(buffer, {
      metadata: { contentType: mimeType },
    });
    await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .collection("assets")
      .doc(assetId)
      .set({
        contentType: mimeType,
      });
    res.status(200).send({ message: "success", assetId });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callCreateAssetApi = wrapApi<
  Payload,
  { message?: string; error?: string; assetId?: string }
>("/api/asset/create", "post");
