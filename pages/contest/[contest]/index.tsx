import { AuthAction, withAuthUser, useAuthUser } from "next-firebase-auth";
import { Button } from "../../../components/Button";
import styles from "../../../styles/Contests.module.css";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useContestId } from "../../../utils/useContestId";
import { callCreateTaskApi } from "../../api/task/create";
import { AddButton } from "../../../components/AddButton";
import { callListTasksApi } from "../../api/task/list";
import { callDeleteTaskApi } from "../../api/task/delete";
import { callMoveTaskApi } from "../../api/task/move";
import { callDuplicateTaskApi } from "../../api/task/duplicate";

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
  fetchTasks: () => Promise<void>;
}
const TaskRow = (props: ITaskRowProps) => {
  const router = useRouter();
  const authUser = useAuthUser();
  const deleteTask = async () => {
    if (!props.cid) {
      return;
    }
    const answer = prompt(
      "Are you sure you want to delete this task? This action is irreversible. Type 'delete' to continue.",
      ""
    );
    if (answer !== "delete") {
      return;
    }
    await callDeleteTaskApi(authUser, {
      contestId: props.cid,
      taskId: props.pid,
    });
    await props.fetchTasks();
  };
  const moveTask = async () => {
    if (!props.cid) {
      return;
    }
    const answer = prompt(
      "Enter the uid of the contest you want to move this task to.",
      ""
    );
    if (answer === props.cid) {
      alert("The contest cannot be the same as current one");
      return;
    }
    if (!answer) {
      return;
    }
    await callMoveTaskApi(authUser, {
      srcContestId: props.cid,
      destContestId: answer,
      taskId: props.pid,
    });
    await props.fetchTasks();
  };
  const duplicateTask = async () => {
    if (!props.cid) {
      return;
    }
    await callDuplicateTaskApi(authUser, {
      contestId: props.cid,
      taskId: props.pid,
    });
    await props.fetchTasks();
  };
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
        <FullButton onClick={moveTask}>MOV</FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton onClick={duplicateTask}>DUP</FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton onClick={deleteTask}>DEL</FullButton>
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
  const fetchTasks = useCallback(async () => {
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
  }, [contestId, authUser]);
  const rows = tasks.map((task) => (
    <TaskRow
      task={task.task}
      cid={contestId ?? ""}
      pid={task.pid}
      key={task.pid}
      fetchTasks={fetchTasks}
    />
  ));
  useEffect(() => {
    const uid = authUser.id;
    if (!uid || !contestId) {
      return;
    }
    fetchTasks();
  }, [authUser, contestId, fetchTasks]);
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
