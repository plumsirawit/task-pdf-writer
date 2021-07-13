import { useRef, useState } from "react";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";

export default function Editor() {
  const outputRef = useRef<HTMLDivElement>(null);
  const [markdownInput, setMarkdownInput] = useState<string>("hello, world");
  return (
    <div>
      <div>
        <SimpleMDE value={markdownInput} onChange={setMarkdownInput} />
      </div>
      <div ref={outputRef}></div>
    </div>
  );
}
