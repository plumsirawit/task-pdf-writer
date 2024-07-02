import { marked } from "marked";
import * as E from "fp-ts/Either";
import { renderToString } from "katex";

function parseLatex(st: string): E.Either<string, Error> {
    enum State {
        NORMAL,
        SINGLE,
        DOUBLE,
    }
    st = st.replace(/&lt;/g, "<");
    let state = State.NORMAL;
    let lastIndex = 0;
    let outputList: String[] = [];
    for (let i = 0; i < st.length; i++) {
        if (
            i + 2 < st.length &&
            st.charAt(i) == "$" &&
            st.charAt(i + 1) == "$" &&
            st.charAt(i + 2) == "$"
        ) {
            return E.right(Error("Three consecutive $ found."));
        }
        let currentToken =
            st.charAt(i) == "$" && i + 1 < st.length && st.charAt(i + 1) == "$"
                ? State.DOUBLE
                : st.charAt(i) == "$"
                ? State.SINGLE
                : State.NORMAL;
        if (state == State.NORMAL) {
            if (currentToken != State.NORMAL) {
                outputList.push(st.substring(lastIndex, i));
                state = currentToken;
                lastIndex = i;
            }
        } else if (currentToken != State.NORMAL) {
            if (state != currentToken) {
                return E.right(Error("Token mismatched."));
            }
            const mathStr = st.substring(
                lastIndex + (state == State.DOUBLE ? 2 : 1),
                i
            );
            const renderedStr = renderToString(mathStr);
            outputList.push(renderedStr);
            lastIndex = i + (state == State.DOUBLE ? 2 : 1);
            state = State.NORMAL;
        }
        if (currentToken == State.DOUBLE) {
            i++;
        }
    }
    if (state != State.NORMAL) {
        return E.right(Error("Token mismatched at the end."));
    }
    outputList.push(st.substring(lastIndex));
    return E.left(outputList.join(""));
}

export function renderMarkdownToHTML(markdownInput: string): string {
    const latexDone = parseLatex(markdownInput);
    if (latexDone._tag == "Right") {
        return "[ERROR] " + latexDone.right.message;
    }
    return marked.parse(latexDone.left) as string;
}
