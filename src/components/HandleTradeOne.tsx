import {FC, useEffect, useState, useMemo, useCallback} from "react";
import {TradeModel} from "models/TradeModel";
import { LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex } from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
import useCollectionStore from 'stores/useCollectionStore';
import { derivePda } from "contexts/getPda";
import { notify } from "utils/notifications";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const HandleTradeOne: FC<HandleTradeOneProps> = ({username, tradeData, type, program,tradeKey}) => {
    const [splAsset, setSplAsset] = useState("");
    const [splValue, setSplValue] = useState(0);
    const [splAddress, setSplAddress] = useState("");

    const [splAssetTwo, setSplAssetTwo] = useState("");
    const [splValueTwo, setSplValueTwo] = useState(0);
    const [splAddressTwo, setSplAddressTwo] = useState("");

    const {connection} = useConnection();
    const wallet = useWallet();

    const collectionData = useCollectionStore((s) => s.data)
    const { getCollection } = useCollectionStore();

    useEffect(() => {
        getCollection(tradeData.collection, program)
    }, [connection, getCollection]);

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    useEffect(() => {
        if (tradeData.isConfirmed) {
            document.querySelector(".cancel-time") ?
            document.querySelector(".cancel-time").classList.add("hidden") :
            "";
        } 
    });

    const getData = async() => {
        if (type === "one") {
            if (tradeData.splAmount[0].toNumber()) {
                try {
                    const metadata = await metaplex.nfts().findByMint({mintAddress: tradeData.oneMint});
                    setSplAsset(metadata.name);
                    setSplAddress(metadata.mint.address.toBase58());
                    setSplValue(1);
                } catch {
                    const info = await connection.getParsedAccountInfo(tradeData.oneMint);
                    setSplAsset(tradeData.oneMint.toBase58());
                    setSplAddress(tradeData.oneMint.toBase58())
                    let decimals = info.value.data["parsed"]["info"]["decimals"];
                    setSplValue(tradeData.splAmount[0].toNumber() / Math.pow(10,decimals));
                }
            }
            if (tradeData.splAmount[1].toNumber()) {
                try {
                    const metadata = await metaplex.nfts().findByMint({mintAddress: tradeData.twoMint});
                    setSplAssetTwo(metadata.name);
                    setSplAddressTwo(metadata.mint.address.toBase58());
                    setSplValueTwo(1);
                } catch {
                    const info = await connection.getParsedAccountInfo(tradeData.twoMint);
                    setSplAssetTwo(tradeData.twoMint.toBase58());
                    setSplAddressTwo(tradeData.twoMint.toBase58())
                    let decimals = info.value.data["parsed"]["info"]["decimals"];
                    setSplValueTwo(tradeData.splAmount[1].toNumber() / Math.pow(10,decimals));
                }
            }
        }
    }

    const escrowPartyTwo = tradeData.splAmount[1].toNumber() ? derivePda([
        anchor.utils.bytes.utf8.encode("escrow-two"),
        tradeData.partyOne.toBytes(),
        tradeData.partyTwo.toBytes(),
        tradeData.collection.toBytes()
    ]) : null;

    const escrowPartyOne = tradeData.splAmount[0].toNumber() ? derivePda([
        anchor.utils.bytes.utf8.encode("escrow-one"),
        tradeData.partyOne.toBytes(),
        tradeData.partyTwo.toBytes(),
        tradeData.collection.toBytes()
    ]) : null;

    const escrowAuthority = derivePda([
        anchor.utils.bytes.utf8.encode("escrow")
    ]);

    useEffect(() => {
        getData()
    }, [type, connection, metaplex, wallet]);

    const onCancelTrade = useCallback(async () => {
        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        

        let twoSendAddress = tradeData.splAmount[1].toNumber() ? 
            getAssociatedTokenAddressSync(tradeData.twoMint,tradeData.partyTwo) : null;

        let oneSendAddress = tradeData.splAmount[0].toNumber() ? 
            getAssociatedTokenAddressSync(tradeData.oneMint,tradeData.partyOne) : null;

        let oneMint = tradeData.oneMint;
        let twoMint = tradeData.twoMint;

        try {
            signature = await program.methods.cancelTrade()
            .accounts({
                collection: tradeData.collection,
                tradeDetails: new PublicKey(tradeKey),
                partyOne: tradeData.partyOne,
                partyTwo: tradeData.partyTwo,
                twoSendAddress,
                oneSendAddress,
                oneMint,
                twoMint,
                escrowPartyOne,
                escrowPartyTwo,
                escrowAuthority
            })
            .rpc();

            console.log(signature);
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });

        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet.publicKey, notify, program, connection]);


    const onExecuteTrade = useCallback(async () => {
        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        

        let twoReceiveAddress = tradeData.splAmount[0].toNumber() ? 
            getAssociatedTokenAddressSync(new PublicKey(tradeData.oneMint),tradeData.partyTwo) : null;

        let oneReceiveAddress = tradeData.splAmount[1].toNumber() ? 
            getAssociatedTokenAddressSync(new PublicKey(tradeData.twoMint),tradeData.partyOne) : null;

        let oneMint = tradeData.oneMint;
        let twoMint = tradeData.twoMint;

        try {
            signature = await program.methods.executeTrade()
            .accounts({
                collection: tradeData.collection,
                tradeDetails: new PublicKey(tradeKey),
                partyOne: tradeData.partyOne,
                partyTwo: tradeData.partyTwo,
                oneReceiveAddress,
                twoReceiveAddress,
                treasuryAddress: collectionData.treasuryAddress,
                oneMint,
                twoMint,
                escrowPartyOne,
                escrowPartyTwo,
                escrowAuthority
            })
            .rpc();

            console.log(signature);
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });

        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet.publicKey, notify, program, connection]);

    return (
        <div className="">
            {console.log(tradeData)}
            <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                Trade with {username} <br/>
            </h1>
            <h1 className="mt-6 mb-2 flex-initial text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                Your offered:
            </h1>

            <div className="">{tradeData.splAmount[0].toNumber() ? 
                <div className="">
                    {splValue}  <span className=" text-pink-400">{splAsset}</span> Token
                    <div className="">Verify Token: <a 
                        href={`https://solscan.io/account/${splAddress}?cluster=devnet`} 
                        rel="noreferrer"
                        className="link-accent"
                        target="_blank">Token Link</a></div>
                </div>
                : "No SPL Token"}
            </div>
            <div className="mt-2">&</div>
            <div className="mt-2">{tradeData.solAmount[0].toNumber() / LAMPORTS_PER_SOL} SOL</div>
            {
                tradeData.isConfirmed ?
                <div className="">
                    <h1 className="mt-6 mb-2 flex-initial text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        {username} offered:
                    </h1>
                    <div className="">{tradeData.splAmount[1].toNumber() ? 
                        <div className="">
                            {splValueTwo}  <span className="text-sm text-pink-400">{splAssetTwo}</span> Token
                            <div className="mb-2">Verify Token: <a 
                                href={`https://solscan.io/account/${splAddressTwo}?cluster=devnet`} 
                                rel="noreferrer"
                                className="link-accent"
                                target="_blank">Token Link</a></div>
                            </div>
                        : "No SPL Token"}
                    </div>
                    <div className="mt-2">&</div>
                    <div className="mt-2">{tradeData.solAmount[1].toNumber() / LAMPORTS_PER_SOL} SOL</div> 
                </div>:
                <div className="mt-8 mb-4">Other Party hasn't confirmed the trade yet</div>
            }
            <div className="mt-6"><button onClick={onCancelTrade} data-module="search" className="mx-auto inline-flex p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                <span className="w-40 text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Cancel Trade
                </span>
            </button></div>
            { 
                collectionData.tradeDuration ?
                <div className="cancel-time text-xs">You can cancel in {Math.round((Math.max(0,(tradeData.time.toNumber() + collectionData.tradeDuration.toNumber())/60 - Date.now() / 60000)))} minutes</div>
                : ""
            }
            <div className="mt-2">OR</div>
            <div className="mt-4"><button onClick={onExecuteTrade} data-module="search" className="mx-auto inline-flex p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                <span className="w-40 text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Execute Trade
                </span>
            </button></div>
        </div>
    )
}

interface HandleTradeOneProps {
    username: string,
    tradeData: TradeModel,
    type: string,
    program: anchor.Program,
    tradeKey: string
}