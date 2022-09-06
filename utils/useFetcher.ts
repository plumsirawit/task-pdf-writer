import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { AuthUser } from "next-firebase-auth";
import { useEffect, useRef } from "react";
import s3Client from "./s3Client";

export interface FetchContext {
  pdfLoading: boolean;
  setPdfLoading: (b: boolean) => void;
  contestId: string | null;
  taskId: string | null;
  s3Now: number;
  secretSuffix: string;
  authUser: AuthUser;
}
const fetchPdf = async ({
  pdfLoading,
  contestId,
  taskId,
  s3Now,
  secretSuffix,
  authUser,
}: FetchContext) => {
  if (!pdfLoading) {
    return null;
  }
  const uidToken = await authUser.getIdToken();
  const innerResp = await fetch(
    "https://973i5k6wjg.execute-api.ap-southeast-1.amazonaws.com/dev/getobject",
    {
      headers: {
        "tpw-user-token": uidToken ?? "",
        "tpw-contest": contestId ?? "",
        "tpw-task": taskId ?? "",
        "tpw-s3now": `${s3Now}`,
        "tpw-secretsuffix": secretSuffix,
      },
      method: "get",
    }
  );
  return innerResp;
};

export const useFetcher = (s3Output: string, fetchContext: FetchContext) => {
  const globalS3Output = useRef<string>("");
  const currentObjectExists = useRef<boolean>(false);
  useEffect(() => {
    if (s3Output !== globalS3Output.current && fetchContext.pdfLoading) {
      globalS3Output.current = s3Output;
      currentObjectExists.current = false;
      const pollS3 = async () => {
        if (
          s3Output !== globalS3Output.current ||
          currentObjectExists.current ||
          !fetchContext.pdfLoading
        ) {
          return;
        }
        try {
          const resp = await fetchPdf(fetchContext);
          if (!resp || resp.status !== 200) {
            fetchContext.setPdfLoading(false);
            console.log("Something is wrong", resp);
            return;
          }
          const data = await resp.json();
          if (!data || !data.message || data.message === "PDF doesn't exist") {
            return;
          }
          await new Promise((res) => setTimeout(res, 5000)); // dirty hack to avoid no key error
          const pdfUrl = data.message;
          fetchContext.setPdfLoading(false);
          saveAs(pdfUrl, "document.pdf");
          currentObjectExists.current = true;
        } catch (err) {
          console.log("Error -- Not retrieved");
        }
      };
      // this is too dirty, need urgent fix.
      const TIMING_HEURISTICS = [
        5, 10, 13, 15, 18, 20, 21, 22, 23, 24, 25, 26, 27, 30, 33, 36, 40, 45,
        50, 55, 60, 65, 70, 75, 80, 85, 90, 100,
      ];
      TIMING_HEURISTICS.map((t) =>
        new Promise<void>((res) => setTimeout(res, t * 1000)).then(pollS3)
      );
    }
  }, [s3Output, fetchContext]);
};
