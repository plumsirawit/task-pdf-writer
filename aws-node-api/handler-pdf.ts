import AWS from "aws-sdk";
import express from "express";
import serverless from "serverless-http";

const app = express();

app.use(express.json());

app.get("/pdf/hello", async function (req, res) {
  res.status(200).json({ message: "Hello, world!" });
});

app.post("/pdf/generate", async function (req, res) {
  res.status(501).json({ error: "not yet implemented" });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
