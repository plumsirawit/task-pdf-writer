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

// Handles $, $$, \[, \( math delimiters — same set as the frontend's
// renderMathInElement. Uses indexOf for closing delimiters; unmatched
// openers are emitted as literal text so a stray $ never breaks the page.
function parseLatex(st: string): string {
    st = st.replace(/&lt;/g, "<");
    const outputList: string[] = [];
    let i = 0;
    let normalStart = 0;

    while (i < st.length) {
        const ch = st.charAt(i);
        const ch2 = i + 1 < st.length ? st.charAt(i + 1) : "";

        if (ch === "$" && ch2 === "$") {
            outputList.push(st.substring(normalStart, i));
            const contentStart = i + 2;
            const closeIdx = st.indexOf("$$", contentStart);
            if (closeIdx === -1) {
                outputList.push("$$");
                i = contentStart;
            } else {
                outputList.push(
                    renderToString(st.substring(contentStart, closeIdx), {
                        throwOnError: false,
                        displayMode: true,
                    })
                );
                i = closeIdx + 2;
            }
            normalStart = i;
        } else if (ch === "$") {
            outputList.push(st.substring(normalStart, i));
            const contentStart = i + 1;
            const closeIdx = st.indexOf("$", contentStart);
            if (closeIdx === -1) {
                outputList.push("$");
                i = contentStart;
            } else {
                outputList.push(
                    renderToString(st.substring(contentStart, closeIdx), {
                        throwOnError: false,
                    })
                );
                i = closeIdx + 1;
            }
            normalStart = i;
        } else if (ch === "\\" && ch2 === "[") {
            outputList.push(st.substring(normalStart, i));
            const contentStart = i + 2;
            const closeIdx = st.indexOf("\\]", contentStart);
            if (closeIdx === -1) {
                outputList.push("\\[");
                i = contentStart;
            } else {
                outputList.push(
                    renderToString(st.substring(contentStart, closeIdx), {
                        throwOnError: false,
                        displayMode: true,
                    })
                );
                i = closeIdx + 2;
            }
            normalStart = i;
        } else if (ch === "\\" && ch2 === "(") {
            outputList.push(st.substring(normalStart, i));
            const contentStart = i + 2;
            const closeIdx = st.indexOf("\\)", contentStart);
            if (closeIdx === -1) {
                outputList.push("\\(");
                i = contentStart;
            } else {
                outputList.push(
                    renderToString(st.substring(contentStart, closeIdx), {
                        throwOnError: false,
                    })
                );
                i = closeIdx + 2;
            }
            normalStart = i;
        } else {
            i++;
        }
    }

    outputList.push(st.substring(normalStart));
    return outputList.join("");
}

export function renderMarkdownToHTML(markdownInput: string): string {
    const htmlWithMath = parseLatex(markdownInput);
    return marked.parse(htmlWithMath) as string;
}
