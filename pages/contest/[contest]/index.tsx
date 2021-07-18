import { AuthAction, withAuthUser, useAuthUser } from "next-firebase-auth";
import { Button } from "../../../components/Button";
import styles from "../../../styles/Contests.module.css";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/database";
import { useContestId } from "../../../utils/useContestId";
import { callCreateTaskApi } from "../../api/task/create";
import { AddButton } from "../../../components/AddButton";
import { callListTasksApi } from "../../api/task/list";

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
  cid: string;
}
const TaskRow = (props: ITaskRowProps) => {
  const router = useRouter();
  console.log(props);
  return (
    <tr>
      <td className={styles.tablects}>
        <FullButton
          onClick={() => router.push(`/contest/${props.cid}/task/${props.pid}`)}
        >
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
  const contestId = useContestId();
  const rows = tasks.map((task) => (
    <TaskRow
      task={task.task}
      cid={contestId ?? ""}
      pid={task.pid}
      key={task.pid}
    />
  ));
  const fetchTasks = async () => {
    if (!contestId) {
      return;
    }
    const data = await callListTasksApi(authUser, { contestId });
    if (!data || !data.tasks) {
      return;
    }
    setTasks(
      Object.entries(data.tasks)
        .map(([k, v]) => ({
          task: v.name,
          pid: k,
        }))
        .sort((a, b) => (a.pid < b.pid ? -1 : 1))
    );
  };
  useEffect(() => {
    const uid = authUser.id;
    if (!uid || !contestId) {
      return;
    }
    fetchTasks();
  }, [authUser, contestId]);
  const createTask = async () => {
    if (!contestId) {
      return;
    }
    await callCreateTaskApi(authUser, {
      contestId,
    });
    await fetchTasks();
  };
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
      <AddButton onClick={createTask} />
    </>
  );
});
