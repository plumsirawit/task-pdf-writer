import { AuthUser } from "next-firebase-auth";
import { useEffect, useRef } from "react";

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
    "https://wd5sfsdcug.execute-api.ap-southeast-1.amazonaws.com/Prod/getobject/",
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
  const pendingPromise = useRef<Promise<void> | undefined>(undefined);
  useEffect(() => {
    const currentInterval = setInterval(() => {
      if (pendingPromise.current) {
        return; // something is pending
      }
      if (!fetchContext.pdfLoading) {
        return;
      }
      const pollS3 = async () => {
        try {
          const resp = await fetchPdf(fetchContext);
          if (!resp || resp.status !== 200) {
            fetchContext.setPdfLoading(false);
            console.log("Something is wrong", resp);
            return {
              isError: true,
              received: false,
            };
          }
          const data = await resp.json();
          if (!data || !data.message || data.message === "PDF doesn't exist") {
            return {
              isError: false,
              received: false,
            };
          }
          // await new Promise((res) => setTimeout(res, 5000)); // dirty hack to avoid no key error
          const pdfUrl = data.message;
          fetchContext.setPdfLoading(false);
          const pdfResp = await fetch(pdfUrl);
          const pdfBlob = await pdfResp.blob();
          saveAs(pdfBlob, "document.pdf");
          return {
            isError: false,
            received: true,
          };
        } catch (err) {
          console.log("Error -- Not retrieved");
          return {
            isError: false,
            received: false,
          };
        }
      };
      pendingPromise.current = pollS3().then(() => {
        pendingPromise.current = undefined;
      });
    }, 5000);
    return () => {
      clearInterval(currentInterval);
    };
  }, [s3Output, fetchContext]);
};
