import { AuthAction, withAuthUser, useAuthUser } from "next-firebase-auth";
import { FullButton, IconButton } from "../../../components/Button";
import styles from "../../../styles/Contests.module.css";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useContestId } from "../../../utils/useContestId";
import { callCreateTaskApi } from "../../api/task/create";
import { callListTasksApi } from "../../api/task/list";
import { callDeleteTaskApi } from "../../api/task/delete";
import { callMoveTaskApi } from "../../api/task/move";
import { callDuplicateTaskApi } from "../../api/task/duplicate";
import Head from "next/head";
import { FiCopy, FiShuffle, FiPlus, FiTrash } from "react-icons/fi";
import { FloatingButton } from "../../../components/FloatingButton";
import { Spinner } from "../../../components/Spinner";

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
      "Enter the id of the contest you want to move this task to.",
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
        <IconButton title="Move to other contest" onClick={moveTask}>
          <FiShuffle />
        </IconButton>
      </td>
      <td className={styles.tablebtn}>
        <IconButton title="Duplicate task" onClick={duplicateTask}>
          <FiCopy />
        </IconButton>
      </td>
      <td className={styles.tablebtn}>
        <IconButton title="Delete task" onClick={deleteTask}>
          <FiTrash />
        </IconButton>
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
  const [tasks, setTasks] = useState<Task[] | null>(null);
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
  const rows =
    tasks &&
    tasks.map((task) => (
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
      <Head>
        <title>task-pdf-writer | Tasks</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Tasks</h1>
        </div>
        <div className={styles.panelcontainer}>
          {tasks !== null ? (
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
      <FloatingButton title="Add new task" theme="dark" onClick={createTask}>
        <FiPlus />
      </FloatingButton>
    </>
  );
});
