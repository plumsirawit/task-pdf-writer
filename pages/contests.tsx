import { AuthAction, withAuthUser, useAuthUser } from "next-firebase-auth";
import { Button } from "../components/Button";
import styles from "../styles/Contests.module.css";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { AddButton } from "../components/AddButton";
import { FloatingButton } from "../components/FloatingButton";
import { callCreateContestApi } from "./api/contest/create";
import { callDeleteContestApi } from "./api/contest/delete";

const FullButton = styled(Button)`
  margin: 0;
  min-width: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #212529;
  color: white;
  text-decoration: none;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  transition: color 0.15s ease, border-color 0.15s ease;
`;

interface IContestRowProps {
  contest: string;
  cid: string;
}
const ContestRow = (props: IContestRowProps) => {
  const router = useRouter();
  const authUser = useAuthUser();
  const deleteContest = async () => {
    if (!props.cid) {
      return;
    }
    const answer = prompt(
      "Are you sure you want to delete this contest? This action is irreversible. Type 'delete' to continue.",
      ""
    );
    if (answer !== "delete") {
      return;
    }
    await callDeleteContestApi(authUser, {
      contestId: props.cid,
    });
  };
  return (
    <tr>
      <td className={styles.tablects}>
        <FullButton onClick={() => router.push(`/contest/${props.cid}`)}>
          {props.contest}
        </FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton
          onClick={() => router.push(`/contest/${props.cid}/settings`)}
        >
          SET
        </FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton onClick={deleteContest}>DEL</FullButton>
      </td>
    </tr>
  );
};

interface Contest {
  contest: string;
  cid: string;
}

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contests() {
  const authUser = useAuthUser();
  const [contests, setContests] = useState<Contest[]>([]);
  const rows = useMemo(
    () =>
      contests.map((contest) => (
        <ContestRow
          contest={contest.contest}
          cid={contest.cid}
          key={contest.cid}
        />
      )),
    [contests]
  );
  useEffect(() => {
    const uid = authUser.id;
    if (!uid) {
      return;
    }
    console.log(uid);
    return firebase
      .firestore()
      .collection("contests")
      .where("users", "array-contains", uid)
      .orderBy(firebase.firestore.FieldPath.documentId())
      .onSnapshot((contests) => {
        const currentContests: Contest[] = [];
        console.log("Start");
        contests.forEach((contest) => {
          currentContests.push({
            contest: contest.data().title,
            cid: contest.id,
          });
          console.log("This time", contest.id);
        });
        setContests(currentContests);
      });
  }, [authUser]);
  const createContest = async () => {
    await callCreateContestApi(authUser, {});
  };
  const logout = () => firebase.auth().signOut();
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Contests</h1>
        </div>
        <div className={styles.panelcontainer}>
          <table>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
      <AddButton onClick={createContest} />
      <FloatingButton onClick={logout} index={1}>
        🚶
      </FloatingButton>
    </>
  );
});
