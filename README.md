**IMPORTANT: SECURITY BOUNTY**

According to the scan from [GitRoll](https://gitroll.io/result/repo/TWYT9Bb9YC0hyD57q1Xa), there might be severe vulnerabilities in this repository. After a bit of manually checking the access permission on S3, I confirm that the report is somehow misleading, i.e., the AWS IAM is being controlled properly and the exposed secret key is only for the client to upload files on S3 directly. This can be improved easily by revoking that direct access to S3 and offload the work to another Lambda instead (which would give a stupid overhead but well... maybe a bit safer since no direct contact is made to AWS S3?). I'll make this into a GitHub issue, and deal with it if I have time.

However, there might be other hidden vulnerabilities! Even if I'm very sure that there is none of them, no one could guarantee that directly. Therefore, I'm going to put a **SECURITY BOUNTY** of $200 for anyone who found a severe security flaw (such as: eavesdroppers can read/write problem statements or images). Minor security flaw reports are appreciated, but the bounty will be lower, accordingly.

Please submit the vulnerability / security flaw reports by opening a GitHub Issue. If I'm not notified in 24 hours, send me an email directly.

![](https://raw.githubusercontent.com/plumsirawit/task-pdf-writer/main/public/task-pdf-writer-banner.svg)

This project is a website as a tool/service to maintain PDF production for competitive programming tasks. The PDFs generated by this tool have the same appearance as from the IOI's translation system. In fact, this project's back-end is copied and modified from IOI 2017's translation system to support the serverless framework (to reduce operation costs). The back-end uses the serverless framework on AWS Lambda. For the front-end, this project uses firebase, Next.js, and Vercel.

The main website is hosted [here](https://pdf.graders.me/). However, you can fork, edit, and host your own versions too.

Feel free to open pull requests if you want to contribute 😃. Also, if you found any bugs or problems please report by creating new GitHub issues.

## Getting Started (front-end and Nextjs back-end)

First, install dependencies:

```bash
yarn
```

This project requires two additional environment variables: `FIREBASE_PRIVATE_KEY` and `COOKIE_SECRET_CURRENT`. `FIREBASE_PRIVATE_KEY` is the private key of the firebase project. In case of external development, you can start a new firebase project and generate the private key. After that you'll need to edit the firebase config in `constants.ts`. For `COOKIE_SECRET_CURRENT`, this can be any secure random string.

Then run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Getting Started (AWS back-end)

First, change directory to `aws-python-api` and install dependencies:

```bash
cd aws-python-api
npm i
```

Most of the installing tasks are done in the `Dockerfile`. You'll need to have docker installed before building docker images locally.

For anything else, you can edit the files as a serverless project. You'll need to login to serverless in order to deploy, then `npm run deploy` to deploy.
