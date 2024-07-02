import { renderMarkdownToHTML } from "./render";
import { ACCESS_KEY, SECRET_ACCESS_KEY } from "./secret";
import * as AWS from "aws-sdk";
AWS.config.update({
    region: "ap-southeast-1",
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
});
import * as fs from "node:fs";

const htmlTemplate = fs.readFileSync("template.html").toString();
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const BUCKET = "sam-task-pdf-writer-tpws3bucket";

export const handler = async (event: any, context: any) => {
    const key: string = event.Records[0].s3.object.key;
    const output = await new Promise<AWS.S3.GetObjectOutput>((res, rej) => {
        s3.getObject(
            {
                Bucket: BUCKET,
                Key: key,
            },
            (err, data) => {
                if (data) res(data);
                rej(err);
            }
        );
    });
    const metadata = output.Metadata;
    const mdInput = output.Body.toString();
    const htmlOutput = renderMarkdownToHTML(mdInput);
    const fullOutput = htmlTemplate.replace("{{RENDERED_CONTENT}}", htmlOutput);
    const data = await new Promise<AWS.S3.ManagedUpload.SendData>(
        (res, rej) => {
            s3.upload(
                {
                    Bucket: BUCKET,
                    Key: key.replace(".md", ".html"),
                    Body: fullOutput,
                    Metadata: metadata,
                },
                (err, data) => {
                    if (data) res(data);
                    rej(err);
                }
            );
        }
    );
    console.log("Success", data.Location);
};
