import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { useEffect, useRef, useState } from "react";
import { Button, FullButton, IconButton } from "../../../components/Button";
import { Input as DefaultInput } from "../../../components/Input";
import styles from "../../../styles/Contests.module.css";
import styled from "styled-components";
import { useContestId } from "../../../utils/useContestId";
import { useRouter } from "next/router";
import { FloatingButton } from "../../../components/FloatingButton";
import Head from "next/head";
import { FiTrash, FiUploadCloud } from "react-icons/fi";
import { Spinner } from "../../../components/Spinner";
import Image from "next/image";
import { toBase64 } from "../../../utils/toBase64";
import { callCreateAssetApi } from "../../api/asset/create";
import toast, { Toaster } from "react-hot-toast";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import mime from "mime";
import { callDeleteAssetApi } from "../../api/asset/delete";

interface IAssetRowProps {
  cid: string;
  aid: string;
  mimeType: string;
}
const AssetRow = (props: IAssetRowProps) => {
  const router = useRouter();
  const authUser = useAuthUser();
  const deleteAsset = async () => {
    if (!props.cid) {
      return;
    }
    const answer = prompt(
      "Are you sure you want to delete this asset? This action is irreversible. Type 'delete' to continue.",
      ""
    );
    if (answer !== "delete") {
      return;
    }
    const resp = await callDeleteAssetApi(authUser, {
      contestId: props.cid,
      assetId: props.aid,
    });
    if (resp?.message === "success") {
      toast("Deleted successfully", {
        position: "bottom-center",
        icon: "🗑️",
      });
    }
  };
  const [assetSrc, setAssetSrc] = useState<string>("");
  useEffect(() => {
    const ext = mime.getExtension(props.mimeType);
    const pathReference = firebase.storage().ref(`assets/${props.aid}.${ext}`);
    pathReference.getDownloadURL().then(setAssetSrc);
  }, [props.aid, props.mimeType]);
  return (
    <tr>
      <td className={styles.tablects}>
        <p>{props.aid}</p>
      </td>
      <td className={styles.tablebtn}>
        <IconButton onClick={() => router.push(assetSrc)}>
          {assetSrc && props.mimeType.includes("image") && (
            <Image src={assetSrc} layout="fill" />
          )}
        </IconButton>
      </td>
      <td className={styles.tablebtn}>
        <IconButton onClick={deleteAsset}>
          <FiTrash />
        </IconButton>
      </td>
    </tr>
  );
};
interface Asset {
  id: string;
  contentType: string;
}
export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(function Assets() {
  const authUser = useAuthUser();
  const contestId = useContestId();
  const assetUploaderRef = useRef<HTMLInputElement>(null);
  const uploadAsset = () => {
    assetUploaderRef.current?.click();
  };
  const handleUpload = async () => {
    const assetFile = assetUploaderRef.current?.files?.[0];
    if (!assetFile || !contestId) {
      return;
    }
    const base64Data = await toBase64(assetFile);
    if (!base64Data) {
      return;
    }
    const resp = await callCreateAssetApi(authUser, {
      contestId,
      base64Content: base64Data,
    });
    if (resp?.message) {
      toast(`Asset ${resp.assetId} uploaded successfully`, {
        position: "bottom-center",
        icon: "🙌",
      });
    }
  };
  const [assets, setAssets] = useState<Asset[] | null>(null);
  useEffect(() => {
    if (!contestId) {
      return;
    }
    return firebase
      .firestore()
      .collection("contests")
      .doc(contestId)
      .collection("assets")
      .onSnapshot((docs) => {
        const currentAssets: Asset[] = [];
        docs.forEach((doc) => {
          currentAssets.push({
            id: doc.id,
            contentType: doc.data().contentType,
          });
        });
        setAssets(currentAssets);
      });
  }, [contestId]);
  const rows =
    assets &&
    assets.map((asset) => (
      <AssetRow
        cid={contestId ?? ""}
        aid={asset.id}
        key={asset.id}
        mimeType={asset.contentType}
      />
    ));
  return (
    <>
      <Head>
        <title>task-pdf-writer | Assets</title>
        <meta
          name="description"
          content="Tool for writing competitive programming tasks in PDF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Assets</h1>
        </div>
        <div className={styles.panelcontainer}>
          {assets !== null ? (
            <table>
              <tbody>{rows}</tbody>
            </table>
          ) : (
            <div className={styles.spinnercontainer}>
              <Spinner big />
            </div>
          )}
        </div>
      </div>
      <FloatingButton onClick={uploadAsset} theme="dark">
        <input
          type="file"
          style={{ display: "none" }}
          onChange={handleUpload}
          ref={assetUploaderRef}
        />
        <FiUploadCloud />
      </FloatingButton>
      <Toaster />
    </>
  );
});
