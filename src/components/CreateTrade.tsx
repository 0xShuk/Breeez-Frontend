// TODO: SignMessage
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useEffect, useMemo, useState, useCallback } from 'react';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {useRouter} from "next/router"
import * as anchor from "@project-serum/anchor";
import { notify } from 'utils/notifications';
import { LAMPORTS_PER_SOL, TransactionSignature } from '@solana/web3.js';
import useUserNftStore from '../stores/useUserNftStore';
import usePartyNftStore from 'stores/usePartyNftStore';
import useIdentityStore from 'stores/useIdentityStore';
import useTokenStore from 'stores/useTokenStore';
import { derivePda } from 'contexts/getPda';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

export const CreateTrade: FC<CreateTradeProps> = ({program, collectionDetails, mint, username, otherParty, tradeDetails}) => {
    const [collections,setCollections] = useState([]);
    const [noNameTokens,setNoNameTokens] = useState([]);
    const [selectedSpl, setSelectedSpl] = useState("");
    const [splAmount, setSplAmount] = useState(0);
    const [splDecimal, setSplDecimal] = useState(0);
    const [solAmount, setSolAmount] = useState(0);
    const [nftType, setNftType] = useState(false);

    const wallet = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const identityData = useIdentityStore((s) => s.data)
    const { getIdentity } = useIdentityStore(); 

    const identityDetails = derivePda([
        anchor.utils.bytes.utf8.encode("identity"),
        wallet.publicKey.toBytes(),
        collectionDetails.toBytes()
    ]);

    useEffect(() => {
        if (wallet.publicKey) {
            getIdentity(identityDetails, program);
        }
    }, [connection, getIdentity]);

    const userNfts = useUserNftStore((s) => s.nfts)
    const { getUserNft } = useUserNftStore()

    const partyNfts = usePartyNftStore((s) => s.nfts)
    const { getPartyNfts } = usePartyNftStore()

    const tokens = useTokenStore(s => s.tokens);
    const {getTokens} = useTokenStore();

    useEffect(() => {
      if (wallet.publicKey) {
        getUserNft(wallet.publicKey, metaplex);
      }
    }, [wallet.publicKey, connection, getUserNft]);

    useEffect(() => {
        let collections = userNfts.filter(nft => {
            if (nft.collection) {
                return nft.collection.address.toBase58() === mint.toBase58()
            }
        });
        setCollections(collections);
    }, [userNfts]);

    useEffect(() => {
        if (wallet.publicKey) {
          getTokens(wallet.publicKey, connection);
        }
      }, [wallet.publicKey, connection, getTokens]);

    useEffect(() => {
        if (wallet.publicKey) {
          getPartyNfts(otherParty, metaplex, mint);
        }
      }, 
    [wallet.publicKey, connection, getPartyNfts]);

    useEffect(() => {
        let nonNamed = tokens.filter(token => {
            let parsed = token["account"]["data"]["parsed"]["info"];
            let mint = obj => obj.mintAddress.toBase58() === parsed["mint"];

            return parsed["tokenAmount"]["uiAmount"] !== 0 && !userNfts.some(mint);

        });
        setNoNameTokens(nonNamed)
    }, [tokens, userNfts]);

    const handleIdentityClick = () => {
        router.push(`/community/${mint.toBase58()}/me`);
    }

    const HandleDashboardClick = () => {
        router.push(`/community/${mint.toBase58()}`);
    }

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

        const escrowPartyOne = splAmount ? derivePda([
            anchor.utils.bytes.utf8.encode("escrow-one"),
            wallet.publicKey.toBytes(),
            otherParty.toBytes(),
            collectionDetails.toBytes()
        ]) : null;

        let oneSendAddress = splAmount ? getAssociatedTokenAddressSync(new PublicKey(selectedSpl),wallet.publicKey) : null;
        let splMint = splAmount ? selectedSpl : null;

        try {
            let twoTokenValidation = getAssociatedTokenAddressSync(partyNfts[0].mintAddress, otherParty);
            let oneTokenValidation = getAssociatedTokenAddressSync(collections[0].mintAddress,wallet.publicKey);
            let oneMetadataValidation = collections[0].address;
            let twoMetadataValidation = partyNfts[0].address;

            console.log(partyNfts)

            signature = await program.methods.createTrade(
                new anchor.BN(solAmount * LAMPORTS_PER_SOL),
                new anchor.BN(splAmount * Math.pow(10,splDecimal)),
                tradeType
            )
            .accounts({
                collectionDetails,
                tradeDetails: new PublicKey(tradeDetails),
                partyOne: wallet.publicKey,
                partyTwo: otherParty,
                oneTokenValidation,
                twoTokenValidation,
                oneMetadataValidation,
                twoMetadataValidation,
                mint: splMint,
                escrowPartyOne,
                oneSendAddress,
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

    return (
        <div className="md:hero mx-auto p-4">
            {
                identityData.username ?
                    identityData.username === username ?
                        <div className="md:hero-content flex flex-col">
                            <h1 className="text-3xl my-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                                You can't trade with yourself!
                                <br /><br />
                            </h1>
                            <button
                                className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                                onClick={HandleDashboardClick}
                            >
                                <span className="block group-disabled:hidden" > 
                                    Back to Dashboard
                                </span>
                            </button>
                        </div> 
                    
                    : 
                        partyNfts.length ?
                            collections.length ?
                            <div className="">
                                <h1 className="text-3xl my-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                                    Create Trade
                                    <br />
                                </h1>
                                <div className="">
                                    Add NFT:
                                    <button onClick={handleNftDropdown} id="dropdownUsersButton" data-dropdown-toggle="dropdownUsers" data-dropdown-placement="bottom" className="ml-4 mt-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Select NFT<svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                                        <div id="dropdownNfts" className="z-10 hidden bg-white rounded-lg shadow w-92 dark:bg-gray-700">
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
                                    <button onClick={handleTokenDropdown} id="dropdownUsersButton" data-dropdown-toggle="dropdownUsers" data-dropdown-placement="bottom" className="ml-4 mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Select Token<svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                                    <div id="dropdownTokens" className="z-10 hidden bg-white rounded-lg shadow w-92 dark:bg-gray-700">
                                        <ul className="h-60 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton">
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
                                <div className="mb-6">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">SPL Token/NFT Amount: </label>
                                    <input value={splAmount} disabled={nftType} onChange={splNumChange} type="number" min={0.00001} className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="enter amount.." required />
                                </div>
                                <div className="mb-6">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">SOL Amount: </label>
                                    <input value={solAmount} onChange={solNumChange} type="number" min={0.00001} className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="enter amount.." required />
                                </div>
                                <button onClick={onTradeClick} type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    Create Trade
                                </span>
                                </button>
                                <div className="text-sm">Note: Leave the field empty if you don't want to add SOL or SPL in the trade.</div>
                            </div>
                            :
                            <div className="md:hero-content flex flex-col">
                                <h1 className="text-3xl my-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                                    Your account is Inactive!
                                    <br /><br />
                                </h1>
                                <div className="">You don't have any NFT from this community.</div>
                                <button
                                    className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                                    onClick={HandleDashboardClick}
                                >
                                    <span className="block group-disabled:hidden" > 
                                        Back to Dashboard
                                    </span>
                                </button>
                            </div>
                        :
                        <div className="md:hero-content flex flex-col">
                            <h1 className="text-3xl my-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                                The account of {username} is Inactive!
                                <br /><br />
                            </h1>
                            <div className="">{username} doesn't have any NFT from this community.</div>
                            <button
                                className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                                onClick={HandleDashboardClick}
                            >
                                <span className="block group-disabled:hidden" > 
                                    Back to Dashboard
                                </span>
                            </button>
                        </div> 
                :
                <div className="md:hero-content flex flex-col">
                    <h1 className="text-3xl my-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        You need to have profile in this community to do trade!
                        <br />
                    </h1>
                    <button
                        className="group w-60 m-2 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                        onClick={handleIdentityClick}
                    >
                        <span className="block group-disabled:hidden" > 
                            Create Profile 
                        </span>
                    </button>
                </div>
            }
        </div>
    );
};

interface CreateTradeProps {
    program: anchor.Program,
    collectionDetails: PublicKey,
    mint: PublicKey,
    username: string,
    otherParty: PublicKey,
    tradeDetails: string
}