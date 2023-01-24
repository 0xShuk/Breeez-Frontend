import { FC, useCallback, useState} from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { TransactionSignature, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Router from "next/router";

import { notify } from "../utils/notifications";
import { CollectionChangeProps } from "../models/collectionChangeProps";

export const AdminStake: FC<StakeChangeProps> = ({collectionDetails,verifiedCollection,token,program}) => {
    const [emission, setEmission] = useState(0);
    const {connection} = useConnection();
    const wallet = useWallet();

    const emissionChange = e => {
        setEmission(e.target.value * LAMPORTS_PER_SOL);
    }

    const onTokenClick = useCallback(async (e) => {
        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        try {
            const tokenKeypair = Keypair.generate();

            signature = await program.methods.addToken()
            .accounts({
              collectionDetails,
              verifiedCollection,
              token: tokenKeypair.publicKey
            })
            .signers([tokenKeypair])
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
    }, [wallet.publicKey, notify, connection, program]);


    const onSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        try {
            console.log(emission);

            signature = await program.methods.addStake(
                new anchor.BN(emission),
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
    }, [wallet.publicKey, notify, connection, program, emission]);

    const backClick = () => {
        document.querySelector(".module-wrapper").classList.remove('hidden');
        document.querySelector(`.staking-module`).classList.add('hidden');
    }

    return (
        <div>
            <div className="back mt-8 cursor-pointer" onClick={backClick}>&#129068; Back to Admin Panel</div>
            {token ? 
                <div className="text-center mt-8">
                    <p>Token: 
                        <a
                        href={'https://explorer.solana.com/address/' + token.toBase58() + `?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 p-1 link-accent"
                    >{token.toBase58()}</a>
                    </p>
                </div>
                :
                <div className="text-center">
                    <h4 className="md:w-full text-center text-slate-100 mt-8">
                        <p>The collection doesn't have a token. Create token before proceeding</p>
                    </h4>
                    <button onClick={onTokenClick} className="my-4 relative inline-flex items-center justify-center p-0.5 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                        <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            Create Token
                        </span>
                    </button>
                </div>
            }
            <form onSubmit={onSubmit}>
                <h1 className="mt-6 mb-6 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        Add Staking
                </h1>

                <div className="mb-10">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Emission (Token Reward per hour)</label>
                    <input onChange={emissionChange} type="number" min={0.0001} step={0.0001} className="inline-block bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="staking reward per hour of staking" required />
                </div>
                <button disabled={!
                    token} type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                    <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Add Staking
                    </span>
                </button>
            </form>
        </div>
    )
}

interface StakeChangeProps extends CollectionChangeProps {
    token: null | PublicKey
}