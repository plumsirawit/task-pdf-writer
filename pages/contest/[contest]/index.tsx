import { AuthAction, withAuthUser } from "next-firebase-auth";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from "../../../styles/Contest.module.css";

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contest() {
  const router = useRouter();
  const [contestId, setContestId] = useState<string>("");
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Contest Settings</h1>
        </div>
        <div className={styles.panelcontainer}>
          <h3>Full Title</h3>
          <input
            type="text"
            value={contestFullTitle}
            onChange={(e) => setContestFullTitle(e.target.value)}
            placeholder="International Olympiad in Informatics 2019"
          />
          <h3>Short Title</h3>
          <input
            type="text"
            value={contestTitle}
            onChange={(e) => setContestTitle(e.target.value)}
            placeholder="IOI 2019"
          />
          <h3>Name</h3>
          <input
            type="text"
            value={contest}
            onChange={(e) => setContest(e.target.value)}
            placeholder="Day 1"
          />
          <h3>Country Code</h3>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="THA"
          />
          <h3>Language</h3>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Thai"
          />
          <h3>Language Code</h3>
          <input
            type="text"
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            placeholder="THA"
          />
          <h3>Contest Date</h3>
          <input
            type="text"
            value={contestDate}
            onChange={(e) => setContestDate(e.target.value)}
            placeholder="September 4, 2019"
          />
          <h3>Logo</h3>
          <input type="file" ref={fileInputRef} multiple={false} />
        </div>
      </div>
    </>
  );
});
