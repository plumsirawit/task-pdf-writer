import { useEffect, useRef, useState } from "react";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";
import styles from "../styles/Editor.module.css";
import dynamic from "next/dynamic";
import marked from "../utils/initMarked";

export default function Editor() {
  const outputRef = useRef<HTMLDivElement>(null);
  const [markdownInput, setMarkdownInput] = useState<string>("hello, world");
  useEffect(() => {
    const outputDiv = outputRef.current;
    if (!outputDiv) {
      return;
    }
    outputDiv.innerHTML = marked(markdownInput);
  }, [markdownInput]);
  return (
    <div className="row">
      <div className={`${styles["col-6"]} ${styles["edit-pane"]}`}>
        <SimpleMDE value={markdownInput} onChange={setMarkdownInput} />
      </div>
      <div
        className={`${styles["col-6"]} ${styles["preview-pane"]} ${styles["markdown-body"]} markdown-body`}
        ref={outputRef}
      ></div>
    </div>
  );
}
