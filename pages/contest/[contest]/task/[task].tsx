import renderMathInElement from "katex/dist/contrib/auto-render";
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
import debounce from "lodash.debounce";
import toast, { Toaster } from "react-hot-toast";
import { FloatingButton } from "../../../../components/FloatingButton";
import { BlackIconSpinner } from "../../../../components/Spinner";
import { Button } from "../../../../components/Button";
import styled from "styled-components";
import { callOverrideTaskApi } from "../../../api/task/override";

const RenameButton = styled(Button)`
  margin: auto 0px;
  position: absolute;
  right: 2vmin;
  top: calc(0.67 * 32px + 18.5px);
  transform: translate(0%, -50%);
`;
const PDFButton = (props: any) => (
  <FloatingButton {...props} index={2}>
    {props.disabled ? <BlackIconSpinner /> : "📄"}
  </FloatingButton>
);
const SaveButton = (props: any) => (
  <FloatingButton {...props} index={1}>
    {props.disabled ? <BlackIconSpinner /> : "📥"}
  </FloatingButton>
);
const OverrideButton = (props: any) => (
  <FloatingButton {...props} index={0}>
    {props.disabled ? <BlackIconSpinner /> : "🎛️"}
  </FloatingButton>
);

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
    outputDiv.innerHTML = marked(markdownInput.replaceAll(/\\/g, "\\\\"));
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
        });
        return firebase
          .database()
          .ref("tasks/" + taskId + "/markdown")
          .set(markdownInput);
      }, 10000),
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
    }
  }, [currentUid, authUser, storeMarkdown]);
  useEffect(() => {
    markdownInput && storeMarkdown(markdownInput);
  }, [markdownInput, storeMarkdown]);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const generatePdf = async () => {
    setPdfLoading(true);
  };
  const saveMarkdown = () => {
    saveAs(
      new Blob([markdownInput], { type: "text/plain;charset=utf-8" }),
      "document.md"
    );
  };
  const promptRenameTask = () => {
    const newName = prompt("Enter new task name", name) ?? name;
    firebase
      .database()
      .ref("tasks/" + taskId + "/name")
      .set(newName)
      .then(() => setName(newName));
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
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Edit Task: {name}</h1>
          <RenameButton onClick={promptRenameTask}>Rename</RenameButton>
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
      <PDFButton disabled={pdfLoading} onClick={generatePdf} />
      <SaveButton onClick={saveMarkdown} />
      <OverrideButton disabled={overrideLoading} onClick={override} />
    </>
  );
});
