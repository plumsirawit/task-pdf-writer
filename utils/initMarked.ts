import { marked } from "marked";
import katex from "katex";

const parser: marked.Parser = new marked.Parser();
const renderer: marked.Renderer = parser.renderer;
const original_table_renderer = renderer.table.bind({ parser });
let IMAGES_URL: string;

// enable resize option for images
renderer.image = function (href: string, title: string, text: string) {
  var style = "page-break-inside:avoid; ";
  var images_folder = "";
  if (href.indexOf("/") < 0 && typeof IMAGES_URL !== "undefined")
    images_folder = IMAGES_URL;
  if (title) {
    const size = title.split("x");
    if (size[1])
      style += "width: " + size[0] + "px; height: " + size[1] + "px;";
    else style += "width: " + size[0] + "px;";
  }
  return (
    "" +
    '<img src="' +
    images_folder +
    href +
    '" alt="' +
    text +
    '" style="' +
    style +
    '">'
  );
};

// remove trailing newline in code blocks
renderer.code = function (code: string, language: string) {
  return (
    '<pre style="page-break-inside:avoid;"><code>' + code + "</code></pre>"
  );
};

// render ltr tables (started with %ltr%)
renderer.table = function (header, body) {
  var html = "";
  var tags = 'style="page-break-inside:avoid;"';
  if (header.search("%ltr%") < 0) {
    tags += ' dir="ltr"';
  } else {
    header = header.replace("%ltr%", "");
  }
  html =
    "<div " + tags + ">" + original_table_renderer(header, body) + "</div>";
  return html;
};

const original_em = renderer.em.bind({ parser });
renderer.em = function (text: string) {
  if (text.includes("$")) return "_" + text + "_";
  else return original_em(text);
};

const blockRegex = /\$\$([\s\S]+?)\$\$/g;
const inlineRegex = /\$([^\$]*)\$/g;
const replacer = (text: string) => {
  text = text.replace(blockRegex, (match, expression) => {
    return katex.renderToString(expression, {
      displayMode: true,
      throwOnError: false,
    });
  });
  text = text.replace(inlineRegex, (match, expression) => {
    console.log("expr", expression);
    return katex.renderToString(expression, {
      displayMode: false,
      throwOnError: false,
    });
  });
  return text;
};

const replaceTypes = ["listitem", "tablecell", "paragraph"];
replaceTypes.forEach((type) => {
  // @ts-ignore
  const original = renderer[type].bind({ parser });
  // @ts-ignore
  renderer[type] = (...args) => {
    args[0] = replacer(args[0]);
    return original(...args);
  };
});

// global options
marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

export default marked;
