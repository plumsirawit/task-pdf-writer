import { AuthAction, withAuthUser } from "next-firebase-auth";
import { Button } from "../components/Button";
import styles from "../styles/Contests.module.css";
import styled from "styled-components";
import { useRouter } from "next/router";

const FullButton = styled(Button)`
  margin: 0;
  min-width: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #212529;
  color: white;
  text-decoration: none;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  transition: color 0.15s ease, border-color 0.15s ease;
`;

interface IContestRowProps {
  contest: string;
  cid: string;
}
const ContestRow = (props: IContestRowProps) => {
  const router = useRouter();
  return (
    <tr>
      <td className={styles.tablects}>
        <FullButton onClick={() => router.push(`/contest/${props.cid}`)}>
          {props.contest}
        </FullButton>
      </td>
      <td className={styles.tablebtn}>
        <FullButton>DEL</FullButton>
      </td>
    </tr>
  );
};
export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Contests() {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Contests</h1>
        </div>
        <div className={styles.panelcontainer}>
          <table>
            <tbody>
              <ContestRow contest="Contest A" cid="a" />
              <ContestRow contest="Contest B" cid="b" />
              <ContestRow contest="Contest C" cid="c" />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});
