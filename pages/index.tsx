import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { FiGithub } from "react-icons/fi";
import { IconButton } from "../components/Button";
import { FloatingButton } from "../components/FloatingButton";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>task-pdf-writer</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <code className={styles.code}>task-pdf-writer</code>
        </h1>

        <div className={styles.grid}>
          <Link href="/register">
            <a className={styles.card}>
              <h2>Register &rarr;</h2>
              <p>
                Register to discover, create, and share simple task statements.
              </p>
            </a>
          </Link>

          <Link href="/login">
            <a className={styles.card}>
              <h2>Login &rarr;</h2>
              <p>Already have an account? Let&apos;s start!</p>
            </a>
          </Link>

          <Link href="/editor">
            <a className={styles.card}>
              <h2>Try &rarr;</h2>
              <p>Discover the tool without having to register an account!</p>
            </a>
          </Link>

          <a
            href="https://github.com/plumsirawit/task-pdf-writer"
            className={styles.card}
          >
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about task-pdf-writer features.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerwrapper}>
          Powered by{" "}
          <span className={styles.vercellogo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
          <span className={styles.firebaselogo}>
            <Image
              src="/logo-built_black.svg"
              alt="Firebase Logo"
              width={100}
              height={44}
            />
          </span>
          <span className={styles.firebaselogo}>
            <Image
              src="/powered-by-aws-white.png"
              alt="AWS Logo"
              width={100}
              height={36}
            />
          </span>
        </div>
      </footer>

      <a
        href="https://github.com/plumsirawit/task-pdf-writer"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ghlogo}
      >
        <FloatingButton theme="dark">
          <FiGithub />
        </FloatingButton>
        {/* <Image
          src="/GitHub-Mark-Light-64px.png"
          alt="GitHub Logo"
          width={64}
          height={64}
        /> */}
      </a>
    </div>
  );
}
