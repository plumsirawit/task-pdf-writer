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
  contestFullTitle: t.union([t.string, t.undefined]),
  contestTitle: t.union([t.string, t.undefined]),
  contest: t.union([t.string, t.undefined]),
  country: t.union([t.string, t.undefined]),
  language: t.union([t.string, t.undefined]),
  languageCode: t.union([t.string, t.undefined]),
  contestDate: t.union([t.string, t.undefined]),
  logo: t.union([t.string, t.undefined]),
});

export type Payload = t.TypeOf<typeof Body>;

const trimUndefinedProps = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([k, v]) => v !== undefined));
const handler = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const bodyDecoded = Body.decode(req.body);
    if (isLeft(bodyDecoded)) {
      res.status(400).send({ error: "bad request" });
      return;
    }
    const {
      contestId,
      contestFullTitle,
      contestTitle,
      contest,
      country,
      language,
      languageCode,
      contestDate,
      logo,
    } = bodyDecoded.right;
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
    if (!contestData.users || !contestData.users.includes(req.authUser.id)) {
      res.status(403).send({ error: "forbidden access" });
      return;
    }
    await admin
      .firestore()
      .collection("contests")
      .doc(contestId)
      .update(
        trimUndefinedProps({
          shortname: contest,
          title: contestTitle,
          fulltitle: contestFullTitle,
          country,
          language,
          langcode: languageCode,
          date: contestDate,
          logo,
        })
      );
    if (logo) {
      const copyResponse = await fetch(
        "https://fwnlsbhyyg.execute-api.ap-southeast-1.amazonaws.com/Prod/copylogo/",
        {
          method: "POST",
          headers: {
            "tpw-contest": contestId,
          },
        }
      );
      if (copyResponse.status !== 200) {
        throw "Copy failed!";
      }
    }
    res.status(200).send({ message: "success" });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({ error: e.message });
  }
};

export default withAuth(handler);

export const callUpdateContestApi = wrapApi<
  Payload,
  { message?: string; error?: string }
>("/api/contest/update", "post");
