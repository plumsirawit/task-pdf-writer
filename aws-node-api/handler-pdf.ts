import AWS from "aws-sdk";
import express from "express";
import serverless from "serverless-http";
import wkhtmltopdf from "wkhtmltopdf";
import { spawn, execSync } from "child_process";
wkhtmltopdf.command = "/opt/bin/wkhtmltopdf";

import fs from "fs";
const app = express();

// app.use(express.json());

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
  res.send(fs.readFileSync(file, { encoding: 'base64' }))
  // use this because res.sendFile and res.download seems to be buggy
  // bug: file content got corrupted (i.e. FE FF turns into EF BF BD EF BF BD)
  // no idea why is this happening
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
  args.push("/tmp/out-bbb.pdf");
  const child = spawn(
    wkhtmltopdf.shell, ["-c", "set -oe pipefail ; " + args.join(" ")]
  );
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.on('exit', (code) => {
    console.log('code', code)
    res.send(fs.readFileSync("/tmp/out-bbb.pdf", { encoding: 'base64' }))
  })
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
