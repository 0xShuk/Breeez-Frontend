import { FC } from "react";
import { useEffect, useMemo } from "react";
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import idl from "../../utils/breeez.json";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js"

//Store
import useUsernameStore from 'stores/useUsernameStore';
import { useRouter } from "next/router";
import { HandleTrade } from "components/HandleTrade";

export const HandleTradeView: FC<HandleTradeViewProps> = ({username, mint, type}) => {
    const {connection} = useConnection();
    const router = useRouter();

    const wallet = useAnchorWallet();
    const provider = new anchor.AnchorProvider(connection,wallet,{});
    anchor.setProvider(provider);

    const program = new anchor.Program(idl as anchor.Idl,idl.metadata.address);

    const usernameData = useUsernameStore((s) => s.data)
    const { getUsername } = useUsernameStore()
  
    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const metadata = metaplex.nfts().pdas().metadata({ mint});

    const [collection,_0] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('collection'),
            metadata.toBytes()
        ],
        new PublicKey(idl.metadata.address)
    )

    const [address,_1] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('username'),
            anchor.utils.bytes.utf8.encode(username),
            new PublicKey(collection).toBytes()
        ],
        new PublicKey(idl.metadata.address)
    )

    useEffect(() => {
        getUsername(address, program);
    }, [connection, getUsername]);

    const onClick = () => {
        router.push(`/community/${mint.toBase58()}`);
    }

    return (
        <div className="md:w-full text-center my-10">
            {
                usernameData.key ?
                <HandleTrade type={type} party={usernameData.key} collection={collection} program={program}
                mint={mint} username={username}/> :
                <div className="justify-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Username: "{username}" doesn't exist in this community!
                    <br /><br />
                </h1>
                <h4 className="md:w-full text-center text-slate-200 mt-2">
                    <p>Go to the community dashboard:
                    </p>
                </h4>
                <button
                    className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                    onClick={onClick}
                >
                    <span className="block group-disabled:hidden text-white" > 
                        Dashboard
                    </span>
                </button>
                </div>
            }                
        </div>
    );
};


interface HandleTradeViewProps {
    mint: PublicKey,
    username: string,
    type: string
}
