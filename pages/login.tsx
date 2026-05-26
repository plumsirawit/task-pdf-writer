import Head from "next/head";
import styles from "../styles/Login.module.css";
import { useState } from "react";
import { Card } from "../components/Card";
import { Input, InputHead } from "../components/Input";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { withGuestGuard } from "../utils/withAuthGuard";
import firebase from "../utils/firebase";

export default withGuestGuard(function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const signIn = () => {
    setIsLoading(true);
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((e) => alert(e.message))
      .finally(() => setIsLoading(false));
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>task-pdf-writer | Login</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <form
        className={styles.main}
        onSubmit={(e) => {
          e.preventDefault();
          signIn();
        }}
      >
        <h1 className={styles.title}>Login</h1>

        <p className={styles.description}>Welcome back!</p>

        <Card>
          <InputHead>Email</InputHead>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputHead>Password</InputHead>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={signIn} disabled={isLoading}>
            {isLoading ? <Spinner /> : <>Sign in</>}
          </Button>
        </Card>
      </form>
    </div>
  );
});
