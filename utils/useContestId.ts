import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useContestId = (): string | null => {
  const [contestId, setContestId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setContestId(router.query.contest as string);
  }, [router.query]);
  return contestId;
};
