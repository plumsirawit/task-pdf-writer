import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../../styles/Contests.module.css";

export default function Contest() {
  const router = useRouter();
  const [contestId, setContestId] = useState<string>("");
  useEffect(() => {
    setContestId(router.query.contest as string);
  }, [router.query]);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Tasks</h1>
        </div>
        <div className={styles.panelcontainer}>
          <table>
            <tbody>
              <tr>
                <td className={styles.tablects}>
                  <a href="#">Task A</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DUP</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">MOV</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DEL</a>
                </td>
              </tr>
              <tr>
                <td className={styles.tablects}>
                  <a href="#">Task B</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DUP</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">MOV</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DEL</a>
                </td>
              </tr>
              <tr>
                <td className={styles.tablects}>
                  <a href="#">Task C</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DUP</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">MOV</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DEL</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
