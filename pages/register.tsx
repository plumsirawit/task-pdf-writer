import { withAuthUser, useAuthUser, AuthAction } from "next-firebase-auth";
import Head from "next/head";
import styles from "../styles/Register.module.css";
import { useState } from "react";
import { MoonLoader } from "react-spinners";
import { callRegisterApi } from "./api/register";
import firebase from "firebase/app";
import "firebase/auth";
import { Input, InputHead } from "../components/Input";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { Card } from "../components/Card";

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})(function Register() {
  const authUser = useAuthUser();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const register = async () => {
    setIsLoading(true);
    if (password !== confirmPassword) {
      alert("Password confirmation mismatch");
      setIsLoading(false);
      return;
    }
    const resp = await callRegisterApi(authUser, {
      email,
      password,
      fullname: fullName,
      displayname: displayName,
    });
    if (!resp?.message) {
      alert(resp?.error);
      setIsLoading(false);
      return;
    }
    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((e) => alert(e.message));
    setIsLoading(false);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>task-pdf-writer | Register</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Register</h1>

        <p className={styles.description}>Tell us who you are!</p>

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
          <InputHead>Confirm Password</InputHead>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputHead>Full Name</InputHead>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <InputHead>Display Name</InputHead>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button onClick={register} disabled={isLoading}>
            {isLoading ? <Spinner /> : <>Register</>}
          </Button>
        </Card>
      </main>
    </div>
  );
});
