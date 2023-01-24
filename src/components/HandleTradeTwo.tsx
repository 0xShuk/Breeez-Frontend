import {FC, useEffect, useState, useMemo, useCallback} from "react";
import {TradeModel} from "models/TradeModel";
import { LAMPORTS_PER_SOL, TransactionSignature, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex } from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import useUserNftStore from '../stores/useUserNftStore';
import useTokenStore from "stores/useTokenStore";
import { notify } from "utils/notifications";
import { derivePda } from "contexts/getPda";

export const HandleTradeTwo: FC<HandleTradeTwoProps> = ({username, tradeData, type, program, tradeKey}) => {
    const [splAsset, setSplAsset] = useState("");
    const [splValue, setSplValue] = useState(0);
    const [splAddress, setSplAddress] = useState("");

    const [noNameTokens,setNoNameTokens] = useState([]);
    const [selectedSpl, setSelectedSpl] = useState("");
    const [splAmount, setSplAmount] = useState(0);
    const [splDecimal, setSplDecimal] = useState(0);
    const [solAmount, setSolAmount] = useState(0);
    const [nftType, setNftType] = useState(false);

    const [splAssetTwo, setSplAssetTwo] = useState("");
    const [splValueTwo, setSplValueTwo] = useState(0);
    const [splAddressTwo, setSplAddressTwo] = useState("");

    const {connection} = useConnection();
    const wallet = useWallet();

    const userNfts = useUserNftStore((s) => s.nfts)
    const { getUserNft } = useUserNftStore()

    useEffect(() => {
        if (wallet.publicKey) {
          getUserNft(wallet.publicKey, metaplex);
        }
      }, [wallet.publicKey, connection, getUserNft]);

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const tokens = useTokenStore(s => s.tokens);
    const {getTokens} = useTokenStore();

    useEffect(() => {
        let nonNamed = tokens.filter(token => {
            let parsed = token["account"]["data"]["parsed"]["info"];
            let mint = obj => obj.mintAddress.toBase58() === parsed["mint"];

            return parsed["tokenAmount"]["uiAmount"] !== 0 && !userNfts.some(mint);

        });
        setNoNameTokens(nonNamed)
    }, [tokens, userNfts]);

    const onTradeClick = useCallback(async () => {
        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';

        let tradeType = {};

        if (solAmount > 0 && splAmount > 0) {
            tradeType = { both: {}}
        } else if (solAmount > 0) {
            tradeType = { sol: {}}
        } else if (splAmount > 0) {
            tradeType = { spl: {}}
        } else {
            notify({ type: 'error', message: `Add at least 1 asset to create trade!` });
            return;
        }

        const escrowPartyTwo = splAmount ? derivePda([
            anchor.utils.bytes.utf8.encode("escrow-two"),
            tradeData.partyOne.toBytes(),
            tradeData.partyTwo.toBytes(),
            tradeData.collection.toBytes()
        ]) : null;

        let twoSendAddress = splAmount ? getAssociatedTokenAddressSync(new PublicKey(selectedSpl),wallet.publicKey) : null;
        let twoReceiveAddress = tradeData.oneMint ? getAssociatedTokenAddressSync(tradeData.oneMint,wallet.publicKey) : null;
        let oneMint = tradeData.oneMint;
        let twoMint = splAmount ? selectedSpl : null;

        try {
            signature = await program.methods.acceptTrade(
                new anchor.BN(solAmount * LAMPORTS_PER_SOL),
                new anchor.BN(splAmount * Math.pow(10,splDecimal)),
                tradeType
            )
            .accounts({
                collection: tradeData.collection,
                tradeDetails: new PublicKey(tradeKey),
                partyOne: tradeData.partyOne,
                partyTwo: tradeData.partyTwo,
                twoReceiveAddress,
                twoSendAddress,
                oneMint,
                twoMint,
                escrowPartyTwo
            })
            .rpc();

            console.log(signature);
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });

        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet.publicKey, notify, program, connection, solAmount, splAmount, splDecimal, selectedSpl]);


    const getData = async() => {
        if (type === "two") {
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

    useEffect(() => {
        getData()
    }, [type, connection, metaplex, wallet]);

    const handleNftDropdown = () => {
        document.getElementById("dropdownNfts").classList.toggle('hidden');
    }

    const handleTokenDropdown = () => {
        document.getElementById("dropdownTokens").classList.toggle('hidden');
    }

    const handleTokenClick = (e) => {
        let mint = e.target.closest("[data-mint]");
        setSelectedSpl(mint.dataset.mint);

        setNftType(mint.dataset.nft === "nft");
        setSplDecimal(mint.dataset.decimal);

        if (mint.dataset.nft) {
            setSplAmount(1)
        }
    }

    const splNumChange = e => {
        setSplAmount(e.target.value);
    }

    const solNumChange = (e) => {
        setSolAmount(e.target.value)
    }

    return (
        <div className="">
            <h1 className="flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                Trade with {username} <br/><br/>
            </h1>
            <h1 className="mt-6 mb-2 flex-initial text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                {username} offered:
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
                        You offered:
                    </h1>
                    <div className="">{tradeData.splAmount[1].toNumber() ? 
                        <div className="">
                            {splValueTwo}  <span className="text-pink-400">{splAssetTwo}</span> Token
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
                    <button 
                    type="submit" className="mt-8 cursor-wait animate-pulse relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                        <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Awaiting Confirmation from {username}
                </span>
                </button>
                </div> :
                <div>
                <div className="">
                    Add NFT:
                    <button 
                        onClick={handleNftDropdown}
                        id="dropdownUsersButton" data-dropdown-toggle="dropdownUsers" data-dropdown-placement="bottom" className="ml-4 mt-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Select NFT<svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                        <div id="dropdownNfts" className="z-10 hidden bg-white rounded-lg shadow w-80 mx-auto dark:bg-gray-700">
                        <ul className="h-60 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton">
                            {
                                userNfts.map(nft =>
                                    <li key={nft.address.toBase58()}>
                                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            <div data-decimal={0} data-nft="nft" onClick={handleTokenClick} data-mint={nft.mintAddress.toBase58()} className="flex flex-col">
                                                <div className="">{nft.name}</div>
                                                <div className="text-xs">{nft.mintAddress.toBase58()}</div>
                                            </div>
                                        </a>
                                    </li>
                                )
                            }
                        </ul>
                        </div>
                </div>
                <div className="my-4">OR</div>
                <div className="">
                    Add Token:
                    <button 
                    onClick={handleTokenDropdown} id="dropdownUsersButton" data-dropdown-toggle="dropdownUsers" data-dropdown-placement="bottom" className="ml-4 mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Select Token<svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div id="dropdownTokens" className="z-10 hidden bg-white rounded-lg shadow w-80 mx-auto dark:bg-gray-700">
                        <ul className="h-40 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton">
                            {
                                noNameTokens.map(token =>
                                    <li key={token["account"]["data"]["parsed"]["info"]["mint"]}>
                                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            <div onClick={handleTokenClick} data-decimal={token["account"]["data"]["parsed"]["info"]["tokenAmount"]["decimals"]} data-mint={token["account"]["data"]["parsed"]["info"]["mint"]} className="flex flex-col">
                                                <div className="">Token Balance: {token["account"]["data"]["parsed"]["info"]["tokenAmount"]["uiAmount"]}</div>
                                                <div className="text-xs">{token["account"]["data"]["parsed"]["info"]["mint"]}</div>
                                            </div>
                                        </a>
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                </div>
                <div className="mt-6">Token Selected: {selectedSpl}</div>
                <div className="mb-6 w-96 mx-auto">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">SPL Token/NFT Amount: </label>
                    <input value={splAmount} disabled={nftType} onChange={splNumChange} type="number" min={0.00001} className="inline-block bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="enter amount.." required />
                </div>
                <div className="mb-6 w-96 mx-auto">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">SOL Amount: </label>
                    <input value={solAmount} onChange={solNumChange} type="number" min={0.00001} className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="enter amount.." required />
                </div>
                <button 
                    onClick={onTradeClick} 
                    type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Create Trade
                </span>
                </button>
                <div className="text-sm">Note: Leave the field empty if you don't want to add SOL or SPL in the trade.</div>
                    </div>
            }
        </div>
    )
}

interface HandleTradeTwoProps {
    username: string,
    tradeData: TradeModel,
    type: string,
    program: anchor.Program,
    tradeKey: string
}