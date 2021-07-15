import { useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import styles from "../styles/Editor.module.css";
import dynamic from "next/dynamic";
import marked from "../utils/initMarked";
import renderMathInElement from "katex/dist/contrib/auto-render";
export default function Editor() {
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
  const generatePdf = async () => {
    const resp = await fetch(
      "https://973i5k6wjg.execute-api.ap-southeast-1.amazonaws.com/dev/genpdf",
      {
        body: JSON.stringify({
          content: markdownInput,
          contest_full_title: "CONTEST_FULL_TITLE",
          contest_title: "CONTEST_TITLE",
          contest: "CONTEST",
          task_name: "TASK_NAME",
          country: "COUNTRY",
          language: "LANG",
          language_code: "LANGCODE",
          contest_date: "CONTEST_DATE",
        }),
        method: "post",
      }
    );
    const respJson = await resp.json();
    const buffer = Buffer.from(respJson.message, "base64");
    saveAs(new Blob([buffer], { type: "application/pdf" }), "document.pdf");
  };
  const saveMarkdown = () => {
    saveAs(
      new Blob([markdownInput], { type: "text/plain;charset=utf-8" }),
      "document.md"
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <button onClick={generatePdf} className={styles.button}>
          Generate PDF
        </button>
        <button onClick={saveMarkdown} className={styles.button}>
          Save Markdown
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
  );
}
