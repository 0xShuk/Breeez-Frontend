import { FC, useCallback, useState} from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { TransactionSignature } from "@solana/web3.js";
import Router from "next/router";

import { notify } from "../utils/notifications";
import { CollectionChangeProps } from "../models/collectionChangeProps";

export const AdminVoting: FC<CollectionChangeProps> = ({collectionDetails,verifiedCollection, program}) => {
    const [count, setCount] = useState(0);
    const [duration, setDuration] = useState(0);
    const [quorum, setQuorum] = useState(0);

    const {connection} = useConnection();
    const wallet = useWallet();

    const countChange = e => {
        setCount(e.target.value);
    }

    const durationChange = e => {
        setDuration(e.target.value * 3600);
    }

    const quorumChange = e => {
        setQuorum(e.target.value);
    }

    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        try {
            console.log(count,duration,quorum);

            signature = await program.methods.addVoting(
                new anchor.BN(count),
                new anchor.BN(duration),
                new anchor.BN(quorum)
            )
            .accounts({
              collectionDetails,
              verifiedCollection,
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
    }, [wallet.publicKey, notify, connection, program, quorum, duration, count]);

    const backClick = () => {
        document.querySelector(".module-wrapper").classList.remove('hidden');
        document.querySelector(`.voting-module`).classList.add('hidden');
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="back mt-8 cursor-pointer" onClick={backClick}>&#129068; Back to Admin Panel</div>
            <h1 className="mt-6 mb-6 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Add Voting
            </h1>
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Number of NFTs in the collection</label>
                <input onChange={countChange} type="number" min={1} className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="the exact number of the nfts" required />
            </div>
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Vote Duration (in hours)</label>
                <input onChange={durationChange} type="number" min={1} className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="the duration till the voting is allowed" required />
            </div>
            <div className="mb-10">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quorum</label>
                <input onChange={quorumChange} type="number" min={1} className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="minimum votes required to pass a proposal" required />
            </div>
            <button type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Add Voting
                </span>
            </button>
            <h4 className="md:w-full text-center text-slate-500 my-2">
                <p>Note: Only add Voting module if your NFT names contain ID, e.g "My NFT #999" else if won't work <a href="#" className="link-accent">Learn More</a>
                </p>
            </h4>
        </form>
    )
}