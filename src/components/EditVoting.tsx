import { FC, useCallback, useState} from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { TransactionSignature } from "@solana/web3.js";
import Router from "next/router";

import { notify } from "../utils/notifications";
import { CollectionChangeProps } from "../models/collectionChangeProps";

export const EditVoting: FC<CollectionChangeProps> = ({collectionDetails,verifiedCollection, program}) => {
    const [num, setNum] = useState(0);
    const [editType, setEditType] = useState({});

    const {connection} = useConnection();
    const wallet = useWallet();

    const changeNum = e => {
        setNum(e.target.value);
    }

    const handleClick = e => {
        let value = e.target.value;

        if (value === "count") {
            setEditType({count: {}});
        } else if (value === "duration") {
            setEditType({duration: {}});
        } else if (value === "quorum") {
            setEditType({quorum: {}});
        }
    }

    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let newNum = num;

        if (editType["duration"]) {
            newNum = num * 3600;
        }

        let signature: TransactionSignature = '';
        try {
            signature = await program.methods.editVoting(
                new anchor.BN(newNum),
                editType
            )
            .accounts({
              collectionDetails,
              verifiedCollection,
            })
            .rpc();

            console.log(signature);
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });
        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature, num, editType);
            return;
        }
    }, [wallet.publicKey, notify, connection, program, num, editType]);

    const backClick = () => {
        document.querySelector(".module-wrapper").classList.remove('hidden');
        document.querySelector(`.edit-voting-module`).classList.add('hidden');
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="back mt-8 cursor-pointer" onClick={backClick}>&#129068; Back to Admin Panel</div>
            <h1 className="mt-6 mb-6 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Edit Voting
            </h1>
            <div className="mb-6">
                <div className="mr-4 inline">
                    <input onClick={handleClick} id="orange-radio" type="radio" value="count" name="edit-type" className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="orange-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Count</label>
                </div>
                <div className="mr-4 inline">
                    <input onClick={handleClick} id="orange-radio" type="radio" value="duration" name="edit-type" className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="orange-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Duration</label>
                </div>
                <div className="mr-4 inline">
                    <input onClick={handleClick} id="orange-radio" type="radio" value="quorum" name="edit-type" className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="orange-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Quorum</label>
                </div>
            </div>
            <div className="mb-10">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Value</label>
                <input onChange={changeNum} type="number" min={1} className="inline-block w-80 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required />
            </div>
            <button type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Edit Voting
                </span>
            </button>
        </form>
    )
}