import { useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { MoonLoader } from "react-spinners";
import Modal from "react-modal";
import { toBase64 } from "../utils/toBase64";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import styles from "../styles/Editor.module.css";
import dynamic from "next/dynamic";
import marked from "../utils/initMarked";
// @ts-ignore
import renderMathInElement from "katex/contrib/auto-render";
import Head from "next/head";

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
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [contestFullTitle, setContestFullTitle] =
    useState<string>("CONTEST_FULL_TITLE");
  const [contestTitle, setContestTitle] = useState<string>("CONTEST_TITLE");
  const [contest, setContest] = useState<string>("CONTEST");
  const [taskName, setTaskName] = useState<string>("TASK_NAME");
  const [country, setCountry] = useState<string>("COUNTRY");
  const [language, setLanguage] = useState<string>("LANGUAGE");
  const [languageCode, setLanguageCode] = useState<string>("LANGCODE");
  const [contestDate, setContestDate] = useState<string>("CONTEST_DATE");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatePdf = async () => {
    setPdfLoading(true);
    let imageBase64 = "";
    const file = fileInputRef?.current?.files?.item(0);
    if (file) {
      imageBase64 = (await toBase64(file)) ?? "";
    }
    const resp = await fetch(
      "https://973i5k6wjg.execute-api.ap-southeast-1.amazonaws.com/dev/genpdf",
      {
        body: JSON.stringify({
          content: markdownInput,
          contest_full_title: contestFullTitle,
          contest_title: contestTitle,
          contest: contest,
          task_name: taskName,
          country: country,
          language: language,
          language_code: languageCode,
          contest_date: contestDate,
          image_base64: imageBase64,
        }),
        method: "post",
      }
    );
    const respJson = await resp.json();
    setPdfLoading(false);
    const buffer = Buffer.from(respJson.message, "base64");
    saveAs(new Blob([buffer], { type: "application/pdf" }), "document.pdf");
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
      <Head>
        <title>task-pdf-writer | Editor</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Modal isOpen={modalIsOpen} contentLabel="Example Modal">
        <div className={styles.modal}>
          <div className={styles.modalrow}>
            <h2>Parameter Setings</h2>
            <button onClick={() => setModalIsOpen(false)}>Close</button>
          </div>
          <input
            type="text"
            value={contestFullTitle}
            onChange={(e) => setContestFullTitle(e.target.value)}
            placeholder="Contest Full Title"
          />
          <input
            type="text"
            value={contestTitle}
            onChange={(e) => setContestTitle(e.target.value)}
            placeholder="Contest Title"
          />
          <input
            type="text"
            value={contest}
            onChange={(e) => setContest(e.target.value)}
            placeholder="Contest"
          />
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
          />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country Code"
          />
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language"
          />
          <input
            type="text"
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            placeholder="Language Code"
          />
          <input
            type="text"
            value={contestDate}
            onChange={(e) => setContestDate(e.target.value)}
            placeholder="Contest Date"
          />
          <input type="file" ref={fileInputRef} multiple={false} />
          <button
            onClick={generatePdf}
            className={styles.button}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <div className={styles.spinnerwrapper}>
                <MoonLoader size="15" color="white" css="display: block" />
              </div>
            ) : (
              <>Generate</>
            )}
          </button>
        </div>
      </Modal>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <button
            onClick={() => setModalIsOpen(true)}
            className={styles.button}
          >
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
    </>
  );
}
