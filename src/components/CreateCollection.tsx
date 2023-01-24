import { FC, useCallback, useState} from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { PublicKey, TransactionSignature } from "@solana/web3.js";
import Router from "next/router";
import { notify } from "../utils/notifications";

export const CreateCollection: FC<CollectionProps> = ({mint,metadata,collection,program}) => {
    const [treasury, setTreasury] = useState();

    const {connection} = useConnection();
    const wallet = useWallet();

    const onChange = e => {
        setTreasury(e.target.value);
    }

    const onClick = useCallback(async () => {
        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        try {
            signature = await program.methods.createCollection(
                new PublicKey(treasury)
            )
            .accounts({
              collectionDetails: collection,
              verifiedCollection: metadata,
              mint
            })
            .rpc();

            console.log(signature);
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });
            setTimeout(() => {
                Router.reload();
            },3000);

        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet.publicKey, notify, program, connection, treasury]);

    return (
        <div className="justify-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                Breeez is not activated for this collection yet!
                <br /><br />
            </h1>
            <div className="flex items-center max-w-md mx-auto p-3 mb-6">
                <label htmlFor="treasury-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter a treasury address: </label>
                <input onChange={onChange} type="text" id="treasury-input" className=" justify-center w-96 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
            </div>
            <button
            className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
            onClick={onClick}
            >
                <span className="block group-disabled:hidden text-white" > 
                    Activate Breeez 
                </span>
            </button>
            <h4 className="md:w-full text-center text-slate-500 my-2">
                <p>Note: Treasury Address is a wallet address where you want
                    to receive trade fees, etc from your community. 
                </p>
            </h4>
        </div>
    )
}

interface CollectionProps {
    mint: PublicKey,
    metadata: PublicKey,
    collection: PublicKey,
    program: anchor.Program
}