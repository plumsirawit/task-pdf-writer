import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { useEffect, useRef } from "react";
import s3Client from "./s3Client";

export const useFetcher = (s3Output: string, callWhenDone: () => void) => {
  const globalS3Output = useRef<string>("");
  const currentObjectExists = useRef<boolean>(false);
  useEffect(() => {
    if (s3Output !== globalS3Output.current) {
      globalS3Output.current = s3Output;
      currentObjectExists.current = false;
      const pollS3 = async () => {
        if (s3Output !== globalS3Output.current || currentObjectExists.current)
          return;
        const s3HeadObjectCommand = new HeadObjectCommand({
          Bucket: "task-pdf-writer-v1",
          Key: s3Output,
        });
        try {
          const data = await s3Client.send(s3HeadObjectCommand);
          console.log("Success -- Retrieved", data);
          currentObjectExists.current = true;
          callWhenDone();
        } catch (err) {
          console.log("Error -- Not retrieved", err);
        }
      };
      const TIMING_HEURISTICS = [
        5, 10, 13, 15, 18, 20, 21, 22, 23, 24, 25, 26, 27, 30, 33, 36, 40, 45,
        50, 55, 60, 65, 70, 75, 80, 85, 90, 100,
      ];
      TIMING_HEURISTICS.map((t) =>
        new Promise<void>((res) => setTimeout(res, t * 1000)).then(pollS3)
      );
    }
  }, [s3Output]);
};
