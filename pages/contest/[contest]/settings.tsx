import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/Button";
import { Input as DefaultInput } from "../../../components/Input";
import styles from "../../../styles/Settings.module.css";
import styled from "styled-components";
import firebase from "firebase/app";
import "firebase/firestore";
import { callUpdateContestApi } from "../../api/contest/update";
import { toBase64 } from "../../../utils/toBase64";
import { useContestId } from "../../../utils/useContestId";
import { useRouter } from "next/router";
import { FloatingButton } from "../../../components/FloatingButton";
import { callAddUserToContestApi } from "../../api/contest/adduser";
import { callRemoveUserFromContestApi } from "../../api/contest/removeuser";
import Image from "next/image";

const Input = styled(DefaultInput)`
  margin-bottom: 5px;
`;

const SettingsForm = () => {
  const router = useRouter();
  const contestId = useContestId();
  const [contentReady, setContentReady] = useState<boolean>(false);
  const [contestFullTitle, setContestFullTitle] = useState<string>("");
  const [contestTitle, setContestTitle] = useState<string>("");
  const [contest, setContest] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [languageCode, setLanguageCode] = useState<string>("");
  const [contestDate, setContestDate] = useState<string>("");
  const [logo, setLogo] = useState<string>(""); // base64
  useEffect(() => {
    if (!contestId) {
      return;
    }
    setContentReady(true);
    firebase
      .firestore()
      .collection("contests")
      .doc(contestId)
      .get()
      .then((contestDoc) => {
        const data = contestDoc.data();
        if (!data) {
          throw Error("Contest not found!");
        } else {
          setContestFullTitle(data.fulltitle);
          setContestTitle(data.title);
          setContest(data.shortname);
          setCountry(data.country);
          setLanguage(data.language);
          setLanguageCode(data.langcode);
          setContestDate(data.date);
          setLogo(data.logo);
        }
      })
      .catch((e) => {
        console.log(e);
        alert(e.message);
        router.push("/contests");
      });
  }, [contestId, router]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authUser = useAuthUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitForm = async () => {
    setIsLoading(true);
    const fileInput = fileInputRef.current;
    if (!fileInput) {
      alert("file input not loaded");
      setIsLoading(false);
      return;
    }
    if (!contestId) {
      alert("contest id not loaded");
      setIsLoading(false);
      return;
    }
    const file = fileInput.files?.[0];
    const response = await callUpdateContestApi(authUser, {
      contestFullTitle,
      contestTitle,
      contest,
      country,
      language,
      languageCode,
      contestDate,
      logo: file && (await toBase64(file)),
      contestId,
    });
    if (response?.error) {
      alert(response.error);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (!fileInputRef.current) {
      return;
    }
    const fileInput = fileInputRef.current;
    const cb = async () => {
      const file = fileInput.files?.[0];
      const newLogo = file && (await toBase64(file));
      if (newLogo) {
        setLogo(newLogo);
      }
    };
    fileInput.addEventListener("change", cb);
    return () => fileInput.removeEventListener("change", cb);
  }, [fileInputRef]);
  return (
    <>
      {contentReady && contestId && (
        <>
          <h3>Full Title</h3>
          <Input
            type="text"
            value={contestFullTitle}
            onChange={(e) => setContestFullTitle(e.target.value)}
            placeholder="International Olympiad in Informatics 2019"
          />
          <h3>Short Title</h3>
          <Input
            type="text"
            value={contestTitle}
            onChange={(e) => setContestTitle(e.target.value)}
            placeholder="IOI 2019"
          />
          <h3>Name</h3>
          <Input
            type="text"
            value={contest}
            onChange={(e) => setContest(e.target.value)}
            placeholder="Day 1"
          />
          <h3>Country Code</h3>
          <Input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="THA"
          />
          <h3>Language</h3>
          <Input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Thai"
          />
          <h3>Language Code</h3>
          <Input
            type="text"
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            placeholder="THA"
          />
          <h3>Contest Date</h3>
          <Input
            type="text"
            value={contestDate}
            onChange={(e) => setContestDate(e.target.value)}
            placeholder="September 4, 2019"
          />
          <h3>Logo</h3>
          <div className={styles.row}>
            <span>Current Logo:</span>
            <Image
              src={logo}
              layout="fill"
              alt="contest logo"
              className={styles.logo}
            />
          </div>
          <Input type="file" ref={fileInputRef} multiple={false} />
          <Button
            onClick={submitForm}
            style={{ marginBottom: 40 }}
            disabled={isLoading}
          >
            Update
          </Button>
        </>
      )}
    </>
  );
};

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contest() {
  const authUser = useAuthUser();
  const contestId = useContestId();
  const addUser = async () => {
    if (!contestId) {
      return;
    }
    const answer = prompt("Add user: enter another user's uid", "");
    if (!answer) {
      return;
    }
    const resp = await callAddUserToContestApi(authUser, {
      contestId,
      otherUserId: answer,
    });
    if (resp?.message === "success") {
      alert("Success!");
    } else {
      alert(resp?.error);
    }
  };
  const removeUser = async () => {
    if (!contestId) {
      return;
    }
    const answer = prompt("Remove user: enter another user's uid", "");
    if (!answer) {
      return;
    }
    const resp = await callRemoveUserFromContestApi(authUser, {
      contestId,
      otherUserId: answer,
    });
    if (resp?.message === "success") {
      alert("Success!");
    } else {
      alert(resp?.error);
    }
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Contest Settings</h1>
        </div>
        <div className={styles.panelcontainer}>
          <SettingsForm />
        </div>
      </div>
      <FloatingButton index={1} onClick={removeUser}>
        🚫
      </FloatingButton>
      <FloatingButton index={0} onClick={addUser}>
        👥
      </FloatingButton>
    </>
  );
});
