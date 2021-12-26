// Initilize Makrded.js Renderer

var renderer = new marked.Renderer();
var original_table_renderer = renderer.table;
var IMAGES_URL;

// enable resize option for images
renderer.image = function (href, title, text) {
  var style = "page-break-inside:avoid; ";
  var images_folder = "";
  if (href.indexOf("/") < 0 && typeof IMAGES_URL !== "undefined")
    images_folder = IMAGES_URL;
  if (title) {
    size = title.split("x");
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
renderer.code = function (code, language) {
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

// Edited from https://gist.github.com/tajpure/47c65cf72c44cb16f3a5df0ebc045f2f

function renderMathsExpression(expr) {
  if (expr[0] === "$" && expr[expr.length - 1] === "$") {
    var displayStyle = false;
    expr = expr.substr(1, expr.length - 2);
    if (expr[0] === "$" && expr[expr.length - 1] === "$") {
      displayStyle = true;
      expr = expr.substr(1, expr.length - 2);
    }
    return katex.renderToString(expr, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
      displayMode: displayStyle,
    });
    // try {
    //   html = katex.renderToString(expr);
    // } catch (e) {
    //   html = e.toString();
    //   //console.err(e);
    // }
    // if (displayStyle && html) {
    //   html = html.replace(
    //     /class="katex"/g,
    //     'class="katex katex-block" style="display: block;"'
    //   );
    // }
    // return html;
  } else {
    return null;
  }
}

function parse(text) {
  var blockRegex = /\$\$[^\$]*\$\$/g;
  var inlineRegex = /\$[^\$]*\$/g;
  var blockExprArray = text.match(blockRegex);
  var inlineExprArray = text.match(inlineRegex);
  for (var i in blockExprArray) {
    text = text.replace(
      blockExprArray[i],
      renderMathsExpression(blockExprArray[i])
    );
  }
  for (var j in inlineExprArray) {
    text = text.replace(
      inlineExprArray[j],
      renderMathsExpression(inlineExprArray[j])
    );
  }
  return text;
}

var originParagraph = renderer.paragraph.bind(renderer);
renderer.paragraph = function (text) {
  return originParagraph(parse(text));
};
var originHeading = renderer.heading.bind(renderer);
renderer.heading = function (text, level, raw, slugger) {
  return originHeading(parse(text), level, raw, slugger);
};
var originList = renderer.heading.bind(renderer);
renderer.list = function (body, ordered, start) {
  return originList(parse(body), ordered, start);
};
var originTable = renderer.table.bind(renderer);
renderer.table = function (header, body) {
  return originTable(parse(header), parse(body));
};

// global options
marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});
