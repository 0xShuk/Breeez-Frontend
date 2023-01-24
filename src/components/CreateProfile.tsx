import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Metaplex } from "@metaplex-foundation/js"
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import useUserNftStore from '../stores/useUserNftStore';
import { PublicKey, TransactionSignature } from "@solana/web3.js";
import { notify } from "utils/notifications";
import { derivePda } from "contexts/getPda";
import * as anchor from "@project-serum/anchor";
import Router from "next/router";

export const CreateProfile: FC<CreateProfileProps> = ({mint, collection, identityDetails, program}) => {
    const [collectionNfts, setCollectionNfts] = useState([]);
    const [name, setName] = useState("");

    const {connection} = useConnection();
    const wallet = useWallet();

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const nfts = useUserNftStore((s) => s.nfts)
    const { getUserNft } = useUserNftStore()
  
    useEffect(() => {
        getUserNft(wallet.publicKey, metaplex)
    }, [connection, getUserNft]);

    useEffect(() => {
        let collectionNfts = nfts.filter(nft => nft.collection.address.toBase58() === mint.toBase58());
        setCollectionNfts(collectionNfts);
    },[nfts]);

    const onChange = e => {
        setName(e.target.value);
    }

    const usernameDetails = derivePda(
        [
            anchor.utils.bytes.utf8.encode('username'),
            anchor.utils.bytes.utf8.encode(name),
            collection.toBytes()
        ]
    )

    const onClick = useCallback(async () => {
        if (collectionNfts.length === 0) {
            notify({ type: 'error', message: `You don't have any NFT from this collection!` });
            return;
        }

        let signature: TransactionSignature = '';
        try {
            let nftMint = collectionNfts[0].mintAddress 
            signature = await program.methods.createIdentity(name)
            .accounts({
                identityDetails,
                collection,
                usernameDetails,
                mint:nftMint,
                token: getAssociatedTokenAddressSync(nftMint,wallet.publicKey),
                metadata: metaplex.nfts().pdas().metadata({ mint: nftMint })
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
    }, [wallet.publicKey, notify, program, connection, name]);

    return (
        <div className="">
            <h1 className="mb-8 flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                You don't have profile in this community!
            </h1>
            <div className="flex items-center max-w-md mx-auto p-3 mb-6">
                <label htmlFor="treasury-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username: </label>
                <input 
                    onChange={onChange} 
                    type="text" id="name-input" placeholder="select a username...." className="ml-3 justify-center w-96 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
            </div>
            <button
                className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={onClick}
            >
                <span className="block group-disabled:hidden" > 
                    Create Profile
                </span>
            </button>
            {console.log(collectionNfts)}
        </div>
    )
}

interface CreateProfileProps {
    mint: PublicKey,
    collection: PublicKey,
    identityDetails: PublicKey,
    program: anchor.Program
}