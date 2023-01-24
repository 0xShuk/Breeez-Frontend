// TODO: SignMessage
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import { PublicKey } from '@metaplex-foundation/js';
import {useRouter} from "next/router"
import * as anchor from "@project-serum/anchor";

import useTradeStore from 'stores/useTradeStore';
import { derivePda } from 'contexts/getPda';
import { HandleTradeOne} from "components/HandleTradeOne";
import { HandleTradeTwo } from "components/HandleTradeTwo";

export const HandleTrade: FC<HandleTradeProps> = ({type, collection, party, program, mint, username}) => {
    const [tradeKey, setTradeKey] = useState("");

    const wallet = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    const tradeData = useTradeStore((s) => s.data)
    const { getTrade } = useTradeStore()

    useEffect(() => {
        if (wallet.connected) {
            let tradeDetails = type === "one" ? derivePda([
                anchor.utils.bytes.utf8.encode('trade'),
                wallet.publicKey.toBytes(),
                party.toBytes(),
                collection.toBytes()
            ]) : 
            derivePda([
                anchor.utils.bytes.utf8.encode('trade'),
                party.toBytes(),
                wallet.publicKey.toBytes(),
                collection.toBytes()
            ]);

            getTrade(tradeDetails, program);
            setTradeKey(tradeDetails.toBase58());
        }
    }, [connection, getTrade]);


    const handleCreate = () => {
        router.push(`/community/${mint}/trade/${username}`)
    }

    const handleDashboard = () => {
        router.push(`/community/${mint}`);
    }

    return (
        <div className="">
            {wallet.connected 
            ? 
                tradeData.partyOne 
                ?
                    type === "one"
                    ?
                        <HandleTradeOne username={username} tradeData={tradeData} type={type} program={program}
                        tradeKey={tradeKey}/>
                    :
                        <HandleTradeTwo username={username} tradeData={tradeData} type={type} program={program}
                        tradeKey={tradeKey}/>
                :
                        type === "one"
                        ?
                            <div className="">
                                <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                                    Trade doesn't exist <br/><br/>
                                </h1>
                                <button
                                    className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                                    onClick={handleCreate}
                                    >
                                        <span className="block group-disabled:hidden text-white" > 
                                            Create Trade 
                                        </span>
                                </button>
                            </div>
                        :
                            <div className="">
                                <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                                    Trade doesn't exist <br/><br/>
                                </h1>
                                <button
                                    className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                                    onClick={handleDashboard}
                                    >
                                        <span className="block group-disabled:hidden text-white" > 
                                            Back to Dashboard 
                                        </span>
                                </button>
                            </div>
            :
                <div className="">
                    <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        Connect your wallet first <br/><br/>
                    </h1>
                </div>
            }
        </div>
    )
}

interface HandleTradeProps {
    type: string,
    party: PublicKey,
    collection: PublicKey,
    program: anchor.Program,
    mint: PublicKey,
    username: string
}