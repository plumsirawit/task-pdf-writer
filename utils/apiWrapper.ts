import { AuthUser } from "next-firebase-auth";

export function wrapApi<Payload, Response>(path: string, method: string) {
  return async (authUser: AuthUser, payload: Payload) => {
    try {
      const token = await authUser.getIdToken();
      const response = await fetch(path, {
        body: JSON.stringify(payload),
        headers: {
          Authorization: token ?? "",
          "Content-Type": "application/json",
        },
        method,
      });
      return (await response.json()) as Response;
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };
}
