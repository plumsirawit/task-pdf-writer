import { exit } from "node:process";
import { renderMarkdownToHTML } from "./render";
import * as fs from "node:fs";

console.log(process.argv);

if (process.argv.length < 5) {
    console.log("Input/Output/Template file not specified. Aborting.");
    exit(0);
}

const inputFilename = process.argv[2];
const outputFilename = process.argv[3];
const templateFilename = process.argv[4];
const htmlTemplateBuffer = fs.readFileSync(templateFilename);

if (!htmlTemplateBuffer) {
    console.log("Input file not found. Aborting.");
    exit(0);
}

const htmlTemplate = htmlTemplateBuffer.toString();
const buffer = fs.readFileSync(inputFilename);

if (!buffer) {
    console.log("Input file not found. Aborting.");
    exit(0);
}

const inputMd = buffer.toString();

const st = renderMarkdownToHTML(inputMd);
const outHtml = htmlTemplate.replace("{{RENDERED_CONTENT}}", st);
fs.writeFileSync(outputFilename, outHtml);
console.log("Done.");
