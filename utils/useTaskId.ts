import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useTaskId = (): string | null => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setTaskId(router.query.task as string);
  }, [router.query]);
  return taskId;
};
