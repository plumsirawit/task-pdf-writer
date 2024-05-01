// @ts-ignore
import renderMathInElement from "katex/contrib/auto-render";
import { AuthAction, withAuthUser, useAuthUser } from "next-firebase-auth";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../../../styles/Task.module.css";
import dynamic from "next/dynamic";
import marked from "../../../../utils/initMarked";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import { useContestId } from "../../../../utils/useContestId";
import { useTaskId } from "../../../../utils/useTaskId";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/firestore";
import debounce from "lodash.debounce";
import toast, { Toaster } from "react-hot-toast";
import { FloatingButton } from "../../../../components/FloatingButton";
import { BlackIconSpinner } from "../../../../components/Spinner";
import { IconButton } from "../../../../components/Button";
import styled from "styled-components";
import { callOverrideTaskApi } from "../../../api/task/override";
import { saveAs } from "file-saver";
import Head from "next/head";
import { FiDownload, FiEdit3, FiFileText, FiType } from "react-icons/fi";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../../../../utils/s3Client";
import { useFetcher } from "../../../../utils/useFetcher";
import cryptoRandomString from "crypto-random-string";

const RenameButton = styled(IconButton)`
  width: 64px;
  height: 64px;
  margin: auto 0px;
  position: absolute;
  right: 2vmin;
  top: 50%;
  transform: translate(0%, -50%);
`;

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contest() {
  const router = useRouter();
  const authUser = useAuthUser();
  const contestId = useContestId();
  const taskId = useTaskId();
  const outputRef = useRef<HTMLDivElement>(null);
  const [markdownInput, setMarkdownInput] = useState<string>("");
  useEffect(() => {
    const outputDiv = outputRef.current;
    if (!outputDiv) {
      return;
    }
    outputDiv.innerHTML = marked.parse(markdownInput.replaceAll(/\\/g, "\\\\"));
    renderMathInElement(outputDiv, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }, [markdownInput]);
  const fetchMarkdown = useCallback(() => {
    if (!contestId || !taskId) {
      return;
    }
    return new Promise((reso) =>
      firebase
        .database()
        .ref("tasks/" + taskId + "/markdown")
        .once("value", (docs) => {
          setMarkdownInput(docs.val());
          reso(docs.val());
        })
    );
  }, [contestId, taskId]);
  const [name, setName] = useState<string>("");
  const fetchName = useCallback(() => {
    if (!contestId || !taskId) {
      return;
    }
    return new Promise((reso) =>
      firebase
        .database()
        .ref("tasks/" + taskId + "/name")
        .once("value", (docs) => {
          setName(docs.val());
          reso(docs.val());
        })
    );
  }, [contestId, taskId]);
  const [currentUid, setCurrentUid] = useState<string>("");
  const storeMarkdown = useMemo(
    () =>
      debounce((markdownInput) => {
        if (!contestId || !taskId) {
          return;
        }
        toast("Saving...", {
          position: "bottom-center",
          icon: "💾",
          duration: 1000,
        });
        return firebase
          .database()
          .ref("tasks/" + taskId + "/markdown")
          .set(markdownInput);
      }, 1000),
    [contestId, taskId]
  );
  useEffect(() => {
    fetchMarkdown();
    fetchName();
    if (!contestId || !taskId) {
      return;
    }
    const cb = firebase
      .database()
      .ref("tasks/" + taskId + "/current-uid")
      .on("value", (docs) => {
        setCurrentUid(docs.val());
      });
    return () =>
      firebase
        .database()
        .ref("tasks/" + taskId + "/current-uid")
        .off("value", cb);
  }, [contestId, taskId, fetchMarkdown, fetchName]);
  useEffect(() => {
    if (currentUid !== authUser.id) {
      storeMarkdown.cancel();
      const cb = firebase
        .database()
        .ref("tasks/" + taskId + "/markdown")
        .on("value", (docs) => {
          setMarkdownInput(docs.val());
        });
      return () =>
        firebase
          .database()
          .ref("tasks/" + taskId + "/markdown")
          .off("value", cb);
    }
  }, [currentUid, authUser, taskId, storeMarkdown]);
  useEffect(() => {
    markdownInput && storeMarkdown(markdownInput);
  }, [markdownInput, storeMarkdown]);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [s3Now, setS3Now] = useState<number>(0);
  const [secretSuffix, setSecretSuffix] = useState<string>("");
  const generatePdf = async () => {
    if (!contestId || !taskId) {
      return;
    }
    setPdfLoading(true);
    const contestDoc = await firebase
      .firestore()
      .collection("contests")
      .doc(contestId)
      .get();
    const contestData = contestDoc.data();
    if (!contestData) {
      alert("contest not found (probably a bug)");
      setPdfLoading(false);
      return;
    }
    const currentS3Now = Date.now();
    const currentSecretSuffix = cryptoRandomString({ length: 24 });
    firebase
      .database()
      .ref("tasks/" + taskId + "/s3now")
      .set(currentS3Now);
    firebase
      .database()
      .ref("tasks/" + taskId + "/secretsuffix")
      .set(currentSecretSuffix);
    const s3Key = `protected/${contestId}-${taskId}-${currentS3Now}-${currentSecretSuffix}.md`;
    const s3UploadCommand = new PutObjectCommand({
      Bucket: "sam-task-pdf-writer-tpws3bucket",
      Key: s3Key,
      Body: markdownInput,
      Metadata: {
        "tpw-contest-id": contestId,
        "tpw-task-name": name,
      },
    });
    try {
      const data = await s3Client.send(s3UploadCommand);
      console.log("Success", data);
    } catch (err) {
      console.log("Error", err);
      setPdfLoading(false);
    }
    /*
    OLD (before 2022-09-05)
    const innerResp = await fetch(
      "https://hh8z43oxfh.execute-api.ap-southeast-1.amazonaws.com/Prod/genpdf",
      {
        body: JSON.stringify({
          content: markdownInput,
          contest_full_title: contestData.fulltitle,
          contest_title: contestData.title,
          contest: contestData.shortname,
          task_name: name,
          country: contestData.country,
          language: contestData.language,
          language_code: contestData.langcode,
          contest_date: contestData.date,
          image_base64: contestData.logo,
        }),
        method: "post",
      }
    ).catch((reason) => {
      setPdfLoading(false);
      alert("Fetch failed with reason " + reason.message);
      alert(
        "Note: the lambda may experience a cold boot, in this case please try again for a few times. Otherwise there are some unexpected errors."
      );
      return null;
    });
    if (!innerResp) {
      return;
    }
    const pdfResult = (await innerResp.json()).message;
    setPdfLoading(false);
    if (pdfResult) {
      const buffer = Buffer.from(pdfResult, "base64");
      saveAs(new Blob([buffer], { type: "application/pdf" }), "document.pdf");
    } else {
      alert("genpdf error");
    }
    */
  };
  useEffect(() => {
    const cb = firebase
      .database()
      .ref("tasks/" + taskId + "/s3now")
      .on("value", (docs) => {
        setS3Now(docs.val());
      });
    return () =>
      firebase
        .database()
        .ref("tasks/" + taskId + "/s3now")
        .off("value", cb);
  }, [taskId]);
  useEffect(() => {
    const cb = firebase
      .database()
      .ref("tasks/" + taskId + "/secretsuffix")
      .on("value", (docs) => {
        setSecretSuffix(docs.val());
      });
    return () =>
      firebase
        .database()
        .ref("tasks/" + taskId + "/secretsuffix")
        .off("value", cb);
  }, [taskId]);
  useFetcher(`protected/${contestId}-${taskId}-${s3Now}-${secretSuffix}.pdf`, {
    pdfLoading,
    setPdfLoading,
    contestId,
    taskId,
    s3Now,
    secretSuffix,
    authUser,
  });
  const saveMarkdown = () => {
    saveAs(
      new Blob([markdownInput], { type: "text/plain;charset=utf-8" }),
      "document.md"
    );
  };
  const promptRenameTask = () => {
    const newName = prompt("Enter new task name", name) ?? name;
    if (/^[a-z0-9]*$/.test(newName) && newName.length <= 30) {
      firebase
        .database()
        .ref("tasks/" + taskId + "/name")
        .set(newName)
        .then(() => setName(newName));
    } else {
      alert(
        "Task name must contain only lowercase English characters or numbers and must be no more than 30 characters long."
      );
    }
  };
  const [overrideLoading, setOverrideLoading] = useState<boolean>(false);
  const override = async () => {
    if (!contestId || !taskId) {
      return;
    }
    setOverrideLoading(true);
    await callOverrideTaskApi(authUser, { contestId, taskId });
    setOverrideLoading(false);
  };
  const options = useMemo(
    () => ({
      toolbar: false,
      spellChecker: false,
      status: false,
    }),
    []
  );
  return (
    <>
      <Head>
        <title>task-pdf-writer | Task</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Edit Task: {name}</h1>
          <RenameButton onClick={promptRenameTask}>
            <FiEdit3 />
          </RenameButton>
        </div>
        <div className={styles.panelcontainer}>
          <div className={`${styles["col-6"]} ${styles["edit-pane"]}`}>
            {currentUid === authUser.id && (
              <SimpleMDE
                value={markdownInput}
                onChange={setMarkdownInput}
                options={options}
              />
            )}
          </div>
          <div
            className={`${styles["col-6"]} ${styles["preview-pane"]} ${styles["markdown-body"]} markdown-body`}
            ref={outputRef}
          ></div>
        </div>
      </div>
      <Toaster />
      <FloatingButton
        title="Generate PDF"
        disabled={pdfLoading}
        onClick={generatePdf}
        index={2}
      >
        {pdfLoading ? <BlackIconSpinner /> : <FiFileText />}
      </FloatingButton>
      <FloatingButton
        title="Download markdown"
        onClick={saveMarkdown}
        index={1}
      >
        <FiDownload />
      </FloatingButton>
      <FloatingButton
        title="Override control"
        disabled={overrideLoading}
        onClick={override}
        index={0}
      >
        {overrideLoading ? <BlackIconSpinner /> : <FiType />}
      </FloatingButton>
    </>
  );
});
