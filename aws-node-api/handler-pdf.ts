import AWS from "aws-sdk";
import express from "express";
import serverless from "serverless-http";
import wkhtmltopdf from "wkhtmltopdf";
wkhtmltopdf.command = "/opt/bin/wkhtmltopdf";

import fs from "fs";
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
  res.status(200).json({
    message: 'OK',
    filecontent: fs.readFileSync(file, { encoding: 'base64' })
  });
  // use this because res.sendFile and res.download seems to be buggy
  // bug: file content got corrupted (i.e. FE FF turns into EF BF BD EF BF BD)
  // no idea why is this happening
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
