import { FC } from "react";
import { useEffect, useCallback, useMemo } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import idl from "../utils/breeez.json";
import { PublicKey } from "@solana/web3.js";

//Store
import useIdentityStore from 'stores/useIdentityStore';
import { useRouter } from "next/router";
import { derivePda } from "contexts/getPda";
import { CreateProfile } from "./CreateProfile";

export const MyProfile: FC<MyProfileProps> = ({collection,mint}) => {
    const {connection} = useConnection();
    const wallet = useWallet();
    const router = useRouter();

    const provider = new anchor.AnchorProvider(connection,wallet,{});
    anchor.setProvider(provider);

    const program = new anchor.Program(idl as anchor.Idl,idl.metadata.address);

    const identityData = useIdentityStore((s) => s.data)
    const { getIdentity } = useIdentityStore(); 

    const identityDetails = derivePda([
        anchor.utils.bytes.utf8.encode("identity"),
        wallet.publicKey.toBytes(),
        collection.toBytes()
    ]);

    useEffect(() => {
        if (wallet.publicKey) {
            getIdentity(identityDetails, program);
        }
    }, [connection, getIdentity]);

    const onClick = () => {
        router.push(`/community/${mint.toBase58()}/user/${identityData.username}`);
    }

    return (
        <div className="">
            { 
                identityData.username ?
                    <div className="">
                        <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                            Profile Exists! <br/><br/>
                        </h1>
                        <button
                            className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                            onClick={onClick}
                        >
                            <span className="block group-disabled:hidden" > 
                                Visit my Profile 
                            </span>
                        </button>
                    </div>
                :
                <CreateProfile mint={mint} collection={collection} identityDetails={identityDetails}
                program={program}
                />
            }
        </div>
    )
}

interface MyProfileProps {
    collection: PublicKey,
    mint: PublicKey
}