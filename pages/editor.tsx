import { useEffect, useMemo, useRef, useState } from "react";
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
  return (
    <div className="row">
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
  );
}
