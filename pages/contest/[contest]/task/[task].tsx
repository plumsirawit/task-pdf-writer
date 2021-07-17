import renderMathInElement from "katex/dist/contrib/auto-render";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../../../styles/Task.module.css";
import dynamic from "next/dynamic";
import marked from "../../../../utils/initMarked";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import Modal from "react-modal";

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contest() {
  const router = useRouter();
  const [contestId, setContestId] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("");
  useEffect(() => {
    setContestId(router.query.contest as string);
    setTaskId(router.query.task as string);
  }, [router.query]);
  const outputRef = useRef<HTMLDivElement>(null);
  const [markdownInput, setMarkdownInput] = useState<string>("hello, world");
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
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  Modal.setAppElement("#__next");
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Edit Task</h1>
          <button
            onClick={() => setModalIsOpen(true)}
            className={styles.button}
          >
            Generate PDF
          </button>
          <button onClick={saveMarkdown} className={styles.button}>
            Download Markdown
          </button>
          <button onClick={saveMarkdown} className={styles.button}>
            Override
          </button>
        </div>
        <div className={styles.panelcontainer}>
          <div className={`${styles["col-6"]} ${styles["edit-pane"]}`}>
            <SimpleMDE
              onChange={setMarkdownInput}
              options={useMemo(
                () => ({
                  toolbar: false,
                  spellChecker: false,
                  status: false,
                }),
                []
              )}
            />
          </div>
          <div
            className={`${styles["col-6"]} ${styles["preview-pane"]} ${styles["markdown-body"]} markdown-body`}
            ref={outputRef}
          ></div>
        </div>
      </div>
    </>
  );
});
