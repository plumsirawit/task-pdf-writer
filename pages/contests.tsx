import styles from "../styles/Contests.module.css";

export default function Contests() {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Contests</h1>
        </div>
        <div className={styles.panelcontainer}>
          <table>
            <tbody>
              <tr>
                <td className={styles.tablects}>
                  <a href="#">Contest A</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">SET</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DEL</a>
                </td>
              </tr>
              <tr>
                <td className={styles.tablects}>
                  <a href="#">Contest B</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">SET</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">DEL</a>
                </td>
              </tr>
              <tr>
                <td className={styles.tablects}>
                  <a href="#">Contest C</a>
                </td>
                <td className={styles.tablebtn}>
                  <a href="#">SET</a>
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
