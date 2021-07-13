import AWS from "aws-sdk";
import express from "express";
import serverless from "serverless-http";
import wkhtmltopdf from "wkhtmltopdf";
import { spawn, execSync } from "child_process";
//wkhtmltopdf.command = "/opt/bin/wkhtmltopdf";
wkhtmltopdf.shell = "bash";

import fs from "fs";
import path from "path";
const app = express();

app.use(express.json());

app.get("/pdf/hello", async function (req, res) {
  res.status(200).json({ message: "Hello, world!" });
});

app.get("/pdf/generate", async function (req, res) {
  const file = "/tmp/out.pdf";
  await new Promise<void>((reso) =>
    wkhtmltopdf("https://www.google.com/", {
      pageSize: "A4",
    })
      .pipe(fs.createWriteStream(file))
      .on("finish", () => reso())
  );
  res.download(file);
  // res.status(501).json({ error: "not yet implemented" });
});

app.get("/pdf/readfiles", async function (req, res) {
  const dir = (req.query.dir as string) ?? __dirname;
  try {
    const dirList = fs.readdirSync(dir);
    res.status(200).json({ listing: dirList, directory: dir });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/pdf/manual", async function (req, res) {
  function quote(val) {
    // escape and quote the value if it is a string and this isn't windows
    if (typeof val === "string" && process.platform !== "win32") {
      val = '"' + val.replace(/(["\\$`])/g, "\\$1") + '"';
    }

    return val;
  }
  const args = [wkhtmltopdf.command];
  const input = req.query.input as string;
  const isUrl = /^(https?|file):\/\//.test(input);
  if (input) {
    args.push(isUrl ? quote(input) : "-");
  }
  args.push("C:/tmp/out-bbb.pdf");
  const child = execSync(
    [wkhtmltopdf.shell, "-c", "set -oe pipefail ; " + args.join(" ")].join(" ")
  );
  res.download("C:/tmp/out-bbb.pdf");
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
