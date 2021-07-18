import { AuthAction, withAuthUser, useAuthUser } from "next-firebase-auth";
import { Button } from "../../../components/Button";
import styles from "../../../styles/Contests.module.css";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import { useContestId } from "../../../utils/useContestId";

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

interface ITaskRowProps {
  task: string;
  pid: string;
}
const TaskRow = (props: ITaskRowProps) => {
  const router = useRouter();
  return (
    <tr>
      <td className={styles.tablects}>
        <FullButton onClick={() => router.push(`/task/${props.pid}`)}>
          {props.task}
        </FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton>MOV</FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton>DUP</FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton>DEL</FullButton>
      </td>
    </tr>
  );
};

interface Task {
  task: string;
  pid: string;
}

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Tasks() {
  const authUser = useAuthUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const rows = tasks.map((task) => (
    <TaskRow task={task.task} pid={task.pid} key={task.pid} />
  ));
  const contestId = useContestId();
  useEffect(() => {
    const uid = authUser.id;
    if (!uid || !contestId) {
      return;
    }
    firebase
      .firestore()
      .collection("contests")
      .doc(contestId)
      .get()
      .then((contest) => {
        setTasks(contest.data()?.tasks ?? []);
      });
  }, [authUser, contestId]);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Tasks</h1>
        </div>
        <div className={styles.panelcontainer}>
          <table>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    </>
  );
});
