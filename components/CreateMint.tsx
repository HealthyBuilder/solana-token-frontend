import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { FC, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
} from "@solana/spl-token";

export const CreateMintForm: FC = () => {
  const [txSig, setTxSig] = useState("");
  const [mint, setMint] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const createMint = async (event) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    // BUILD AND SEND CREATE MINT TRANSACTION HERE
    const mint = web3.Keypair.generate();

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

     // 3. 获取最新 blockhash（手动指定，避免旧方法）
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // 4. 构建交易
    const transaction = new web3.Transaction({
      feePayer: publicKey,
      recentBlockhash: blockhash,
    });

    // const transaction = new web3.Transaction();

    transaction.add(
      web3.SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        0,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      )
    );
      
    // // 5. 发送交易（注意传 signers，否则会找不到 mint 的私钥）
    // const signature = await sendTransaction(transaction, connection, {
    //   signers: [mint],
    // });

    // // 6. 等待确认（推荐显式确认）
    // await connection.confirmTransaction(signature, "finalized");

    // setTxSig(signature);
    // setMint(mint.publicKey.toString());

    sendTransaction(transaction, connection, {
      signers: [mint],
    }).then((sig) => {
      setTxSig(sig);
      setMint(mint.publicKey.toString());
    });
  };

  return (
    <div>
      {publicKey ? (
        <form onSubmit={createMint} className={styles.form}>
          <button type="submit" className={styles.formButton}>
            Create Mint
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div>
          <p>Token Mint Address: {mint}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
