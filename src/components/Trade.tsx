// TODO: SignMessage
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useMemo, useState, useCallback, MouseEventHandler } from 'react';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {useRouter} from "next/router"
import {useWalletModal} from '@solana/wallet-adapter-react-ui';
import * as anchor from "@project-serum/anchor";

import useTradeStore from 'stores/useTradeStore';
import { derivePda } from 'contexts/getPda';
import idl from "../utils/breeez.json";
import { CreateTrade } from './CreateTrade';

export const Trade: FC<ProfileProps> = ({otherParty,mint,username}) => {
    const [trade, setTrade] = useState("");

    const {wallet, connect, connected, publicKey} = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const router = useRouter();
    const modalState = useWalletModal();

    const provider = new anchor.AnchorProvider(connection,anchorWallet,{});
    anchor.setProvider(provider);

    const program = new anchor.Program(idl as anchor.Idl,idl.metadata.address);


    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const handleConnectClick: MouseEventHandler<HTMLButtonElement> = useCallback(event => {
        if (event.defaultPrevented) {
            return
        }

        if (!wallet) {
            modalState.setVisible(true);
        } else {
            connect().catch(() =>{})
        }
    },
        [wallet,connect,modalState]
    )

    const tradeData = useTradeStore((s) => s.data)
    const { getTrade } = useTradeStore()
  
    const metadata = metaplex.nfts().pdas().metadata({ mint});

    const collectionDetails = derivePda([
        anchor.utils.bytes.utf8.encode('collection'),
        metadata.toBytes()
    ]);

    useEffect(() => {
        if (connected) {
            let tradeDetails = derivePda([
                anchor.utils.bytes.utf8.encode('trade'),
                publicKey.toBytes(),
                otherParty.toBytes(),
                collectionDetails.toBytes()
            ]);

            setTrade(tradeDetails.toBase58());
            
            getTrade(tradeDetails, program);
        }
    }, [connection, getTrade]);

    const routeToTrade = (address: PublicKey) => {
        router.push(`/community/${address}/trade/${username}/one`);
    }

    return (
        <div className="flex flex-col mx-auto">
            <div className="flex justify-center">
                {
                    connected ?
                        tradeData.partyOne ?
                        <div className="">
                            Redirecting...
                            {routeToTrade(mint)}
                        </div>
                     :
                        <CreateTrade program={program} collectionDetails={collectionDetails} mint={mint}
                        username={username} otherParty={otherParty} tradeDetails={trade}/>
                    : 
                    <div className="">
                        <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                            Connect your wallet first <br/><br/>
                        </h1>
                        <button
                            className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                            onClick={handleConnectClick}
                        >
                            <span className="block group-disabled:hidden" > 
                                Select Wallet 
                            </span>
                        </button>
                    </div>
                }
            </div>
            
        </div>
    );
};

interface ProfileProps {
    username: string,
    mint: PublicKey,
    otherParty: PublicKey
}