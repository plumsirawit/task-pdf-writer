import { marked, Renderer } from "marked";
import { renderToString } from "katex";

marked.use({
    gfm: true,
    breaks: false,
    pedantic: false,
});

// Pass backslash sequences through to KaTeX unmodified (mirrors front-end initMarked.ts).
// Without this, marked's escape tokenizer consumes \\ → \, corrupting constructs
// like \\\vdots and making a lone \ display as \\.
marked.use({
    tokenizer: {
        escape(src: string) {
            const cap = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/.exec(src);
            if (cap) {
                return { type: "text", raw: cap[0], text: cap[0] };
            }
            return false as any;
        },
    },
});

const defaultTableRenderer = Renderer.prototype.table;

marked.use({
    renderer: {
        image(href: string, title: string | null, text: string) {
            let style = "page-break-inside:avoid; ";
            if (title) {
                const size = title.split("x");
                if (size[1]) {
                    style += `width: ${size[0]}px; height: ${size[1]}px;`;
                } else {
                    style += `width: ${size[0]}px;`;
                }
            }
            return `<img src="${href}" alt="${text}" style="${style}">`;
        },
        code(code: string, _infostring: string | undefined, _escaped: boolean) {
            return `<pre style="page-break-inside:avoid;"><code>${code}</code></pre>`;
        },
        table(header: string, body: string) {
            let tags = 'style="page-break-inside:avoid;"';
            if (header.indexOf("%ltr%") < 0) {
                tags += ' dir="ltr"';
                return `<div ${tags}>${defaultTableRenderer.call(this, header, body)}</div>`;
            } else {
                const cleanHeader = header.replace("%ltr%", "");
                return `<div ${tags}>${defaultTableRenderer.call(this, cleanHeader, body)}</div>`;
            }
        },
    },
});

function parseLatex(st: string): string {
    enum State {
        NORMAL,
        SINGLE,
        DOUBLE,
    }
    st = st.replace(/&lt;/g, "<");
    let state = State.NORMAL;
    let lastIndex = 0;
    const outputList: string[] = [];

    for (let i = 0; i < st.length; i++) {
        const isDouble =
            st.charAt(i) === "$" && i + 1 < st.length && st.charAt(i + 1) === "$";
        const currentToken = isDouble
            ? State.DOUBLE
            : st.charAt(i) === "$"
            ? State.SINGLE
            : State.NORMAL;

        if (state === State.NORMAL) {
            if (currentToken !== State.NORMAL) {
                outputList.push(st.substring(lastIndex, i));
                state = currentToken;
                lastIndex = i;
            }
        } else if (currentToken !== State.NORMAL) {
            if (state === currentToken) {
                // Matching closing delimiter — render the math
                const mathStr = st.substring(
                    lastIndex + (state === State.DOUBLE ? 2 : 1),
                    i
                );
                outputList.push(renderToString(mathStr, { throwOnError: false }));
                lastIndex = i + (state === State.DOUBLE ? 2 : 1);
                state = State.NORMAL;
            } else if (state === State.SINGLE && currentToken === State.DOUBLE) {
                // $a$$ case: the first $ of $$ closes the inline expression.
                // i-- counters the upcoming i++ for DOUBLE so the net advance is +1,
                // letting the next iteration start at i+1 (the second $ of $$).
                const mathStr = st.substring(lastIndex + 1, i);
                outputList.push(renderToString(mathStr, { throwOnError: false }));
                lastIndex = i + 1;
                state = State.NORMAL;
                i--;
            } else {
                // state === DOUBLE, currentToken === SINGLE: stray $ inside display math.
                // Treat the opening $$ as literal text and restart from after it.
                outputList.push(st.substring(lastIndex, lastIndex + 2));
                i = lastIndex + 1;
                lastIndex = lastIndex + 2;
                state = State.NORMAL;
                continue;
            }
        }

        if (currentToken === State.DOUBLE) {
            i++;
        }
    }

    // Unmatched delimiter at end of string — emit everything from the opening
    // delimiter onwards as literal text (handles stray currency $ etc.)
    outputList.push(st.substring(lastIndex));
    return outputList.join("");
}

export function renderMarkdownToHTML(markdownInput: string): string {
    const htmlWithMath = parseLatex(markdownInput);
    return marked.parse(htmlWithMath) as string;
}
