import { FullButton, IconButton } from "../components/Button";
import styles from "../styles/Contests.module.css";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { FloatingButton } from "../components/FloatingButton";
import { callCreateContestApi, callDeleteContestApi } from "../utils/apiCalls";
import Head from "next/head";
import { FiImage, FiLogOut, FiPlus, FiSettings, FiTrash } from "react-icons/fi";
import { Spinner } from "../components/Spinner";
import { withAuthGuard } from "../utils/withAuthGuard";
import { useAuth } from "../utils/AuthContext";
import firebase from "../utils/firebase";

interface IContestRowProps {
  contest: string;
  cid: string;
}
const ContestRow = (props: IContestRowProps) => {
  const router = useRouter();
  const { user } = useAuth();
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
    await callDeleteContestApi(user, {
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
        <IconButton
          title="Settings"
          onClick={() => router.push(`/contest/${props.cid}/settings`)}
        >
          <FiSettings />
        </IconButton>
      </td>
      <td className={styles.tablebtn}>
        <IconButton
          title="Upload Assets"
          onClick={() => router.push(`/contest/${props.cid}/assets`)}
        >
          <FiImage />
        </IconButton>
      </td>
      <td className={styles.tablebtn}>
        <IconButton title="Delete" onClick={deleteContest}>
          <FiTrash />
        </IconButton>
      </td>
    </tr>
  );
};

interface Contest {
  contest: string;
  cid: string;
}

export default withAuthGuard(function Contests() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[] | null>(null);
  const rows = useMemo(
    () =>
      contests &&
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
    const uid = user?.uid;
    if (!uid) {
      return;
    }
    return firebase
      .firestore()
      .collection("contests")
      .where("users", "array-contains", uid)
      .orderBy(firebase.firestore.FieldPath.documentId())
      .onSnapshot((contests) => {
        const currentContests: Contest[] = [];
        contests.forEach((contest) => {
          currentContests.push({
            contest: contest.data().title,
            cid: contest.id,
          });
        });
        setContests(currentContests);
      });
  }, [user]);
  const createContest = async () => {
    await callCreateContestApi(user, {});
  };
  const logout = () => firebase.auth().signOut();
  return (
    <>
      <Head>
        <title>task-pdf-writer | Contests</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Contests</h1>
        </div>
        <div className={styles.panelcontainer}>
          {contests !== null ? (
            <table>
              <tbody>{rows}</tbody>
            </table>
          ) : (
            <div className={styles.spinnercontainer}>
              <Spinner big />
            </div>
          )}
        </div>
      </div>
      <FloatingButton
        title="Add new contest"
        theme="dark"
        onClick={createContest}
        index={1}
      >
        <FiPlus />
      </FloatingButton>
      <FloatingButton title="Logout" theme="dark" onClick={logout} index={2}>
        <FiLogOut />
      </FloatingButton>
      <footer className={styles.footer}>
        <h3>User id:</h3>
        <code>{user?.uid}</code>
      </footer>
    </>
  );
});
