import { wrapApi } from "./apiWrapper";

export interface Task {
  "allowed-uids": Record<string, string>;
  contest: string;
  "current-uid": string;
  markdown: string;
  name: string;
}

export const callRegisterApi = wrapApi<
  { email: string; password: string; fullname: string; displayname: string },
  { message?: string; error?: string }
>("/api/register", "post");

export const callAddUserToContestApi = wrapApi<
  { contestId: string; otherUserId: string },
  { message?: string; error?: string }
>("/api/contest/adduser", "put");

export const callCreateContestApi = wrapApi<
  {},
  { message?: string; error?: string; contestId?: string }
>("/api/contest/create", "post");

export const callDeleteContestApi = wrapApi<
  { contestId: string },
  { message?: string; error?: string }
>("/api/contest/delete", "delete");

export const callRemoveUserFromContestApi = wrapApi<
  { contestId: string; otherUserId: string },
  { message?: string; error?: string }
>("/api/contest/removeuser", "delete");

export const callUpdateContestApi = wrapApi<
  {
    contestId: string;
    contestFullTitle?: string;
    contestTitle?: string;
    contest?: string;
    country?: string;
    language?: string;
    languageCode?: string;
    contestDate?: string;
    logo?: string;
  },
  { message?: string; error?: string }
>("/api/contest/update", "post");

export const callCreateTaskApi = wrapApi<
  { contestId: string },
  { message?: string; error?: string; taskId?: string }
>("/api/task/create", "post");

export const callDeleteTaskApi = wrapApi<
  { contestId: string; taskId: string },
  { message?: string; error?: string }
>("/api/task/delete", "delete");

export const callDuplicateTaskApi = wrapApi<
  { contestId: string; taskId: string },
  { message?: string; error?: string; taskId?: string }
>("/api/task/duplicate", "post");

export const callListTasksApi = wrapApi<
  { contestId: string },
  { message?: string; error?: string; tasks?: Record<string, Task> }
>("/api/task/list", "post");

export const callMoveTaskApi = wrapApi<
  { srcContestId: string; destContestId: string; taskId: string },
  { message?: string; error?: string }
>("/api/task/move", "post");

export const callOverrideTaskApi = wrapApi<
  { contestId: string; taskId: string },
  { message?: string; error?: string }
>("/api/task/override", "post");

export const callCreateAssetApi = wrapApi<
  { contestId: string; base64Content: string },
  { message?: string; error?: string; assetId?: string }
>("/api/asset/create", "post");

export const callDeleteAssetApi = wrapApi<
  { contestId: string; assetId: string },
  { message?: string; error?: string }
>("/api/asset/delete", "delete");
