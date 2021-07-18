import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/Button";
import { Input as DefaultInput } from "../../../components/Input";
import styles from "../../../styles/Settings.module.css";
import styled from "styled-components";
import firebase from "firebase/app";
import "firebase/firestore";
import { callUpdateContestApi } from "../../api/contest/update";
import { toBase64 } from "../../../utils/toBase64";
const Input = styled(DefaultInput)`
  margin-bottom: 5px;
`;

interface ISettingsFormProps {
  contestFullTitle: string;
  contestTitle: string;
  contest: string;
  country: string;
  language: string;
  languageCode: string;
  contestDate: string;
  logo: string;
  contestId: string;
}

const SettingsForm = (props: ISettingsFormProps) => {
  const [contestFullTitle, setContestFullTitle] = useState<string>(
    props.contestFullTitle
  );
  const [contestTitle, setContestTitle] = useState<string>(props.contestTitle);
  const [contest, setContest] = useState<string>(props.contest);
  const [country, setCountry] = useState<string>(props.country);
  const [language, setLanguage] = useState<string>(props.language);
  const [languageCode, setLanguageCode] = useState<string>(props.languageCode);
  const [contestDate, setContestDate] = useState<string>(props.contestDate);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setContestFullTitle(props.contestFullTitle);
    setContestTitle(props.contestTitle);
    setContest(props.contest);
    setCountry(props.country);
    setLanguage(props.language);
    setLanguageCode(props.languageCode);
    setContestDate(props.contestDate);
  }, [props]);
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
      contestId: props.contestId,
    });
    if (response?.error) {
      alert(response.error);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };
  return (
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
        <img src={props.logo} className={styles.logo} />
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
  );
};

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contest() {
  const AuthUser = useAuthUser();
  const router = useRouter();
  const [contestId, setContestId] = useState<string>("");
  const [contentReady, setContentReady] = useState<boolean>(false);
  useEffect(() => {
    setContestId(router.query.contest as string);
  }, [router.query]);
  const [contestFullTitle, setContestFullTitle] = useState<string>("");
  const [contestTitle, setContestTitle] = useState<string>("");
  const [contest, setContest] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [languageCode, setLanguageCode] = useState<string>("");
  const [contestDate, setContestDate] = useState<string>("");
  const [logo, setLogo] = useState<string>("https://picsum.photos/300/200"); // base64
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
  });
  return (
    <>
      {contentReady && (
        <div className={styles.container}>
          <div className={styles.topbar}>
            <h1 className={styles.title}>Contest Settings</h1>
          </div>
          <div className={styles.panelcontainer}>
            <SettingsForm
              contestFullTitle={contestFullTitle}
              contestTitle={contestTitle}
              contest={contest}
              country={country}
              language={language}
              languageCode={languageCode}
              contestDate={contestDate}
              logo={logo}
              contestId={contestId}
            />
          </div>
        </div>
      )}
    </>
  );
});
