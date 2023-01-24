// TODO: SignMessage
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {useRouter} from "next/router"

//Store
import useUserNftStore from '../stores/useUserNftStore';
import axios from 'axios';

export const Profile: FC<ProfileProps> = ({address,mint,username}) => {
    const [collectionNfts, setCollectionNfts] = useState([]);
    const [otherNfts, setOtherNfts] = useState([]);

    const wallet = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const nfts = useUserNftStore((s) => s.nfts)
    const { getUserNft } = useUserNftStore()
  
    useEffect(() => {
        getUserNft(address, metaplex)
    }, [connection, getUserNft]);

    const getImages = async() => {
        let nftData = await Promise.all(nfts.map(async nft => {
            if (nft.collection) {
                let {data} = await axios.get(nft.uri);

                return {
                    name: data.name,
                    image: data.image,
                    address: nft.collection.address.toBase58(),
                    mint: nft.mintAddress.toBase58()
                }
            }
        }));

        nftData = nftData.filter(nft => nft);

        let collectionNftData = nftData.filter(nft => nft.address === mint.toBase58());
        let otherNftData = nftData.filter(nft => nft.address !== mint.toBase58());

        collectionNftData = collectionNftData.length > 10 ? collectionNftData.slice(0,9): collectionNftData;
        otherNftData = otherNftData.length > 10 ? otherNftData.slice(0,9) : otherNftData;

        setCollectionNfts(collectionNftData);
        setOtherNfts(otherNftData);
    }

    useEffect(() => {
        getImages();
    },[nfts]);

    const handleTradeClick = () => {
        document.querySelector(".col-nft-wrapper").classList.add("hidden");
        document.querySelector(".oth-nft-wrapper").classList.add("hidden");
        document.querySelector(`.trade-with-wrapper`).classList.remove('hidden');
    }

    const backClick = () => {
        document.querySelector(".col-nft-wrapper").classList.remove('hidden');
        document.querySelector(".oth-nft-wrapper").classList.remove('hidden');
        document.querySelector(`.trade-with-wrapper`).classList.add('hidden');
    }

    const selfTradeClick = () => {
        router.push(`/community/${mint}/trade/${username}/one`);
    }

    const userTradeClick = () => {
        router.push(`/community/${mint}/trade/${username}/two`);
    }

    return (
        <div className="flex flex-col mx-auto">
            <div className="flex justify-center">
                <div className="flex flex-col">
                    {
                        collectionNfts.length ? 
                        <img src={collectionNfts[0].image} className="shadow-[0_4px_16px_rgba(349,_85,_83,_0.6)] w-36 h-48" alt="" />
                        : <img src="../../../inactive.png" className='w-36 h-48' alt="" />
                    }
                </div>
                <div className="flex flex-col ml-16">
                    <h1 className="mb-6 flex-initial text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        {username}
                    </h1>
                    <a 
                        href={`https://solscan.io/account/${address}?cluster=devnet`} 
                        rel="noreferrer"
                        target="_blank"
                    >
                        <button data-module="search" className="mx-auto inline-flex p-0.5 mb-4 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                            <span className="w-40 text-slate-300 relative px-3 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                User Wallet
                        </span>
                        </button>
                    </a>
                    <div className="">
                        <button data-module="search" className="mx-auto inline-flex p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                            <span onClick={handleTradeClick} className="w-40 text-slate-300 relative px-3 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                Trade with Member
                        </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="mx-auto col-nft-wrapper">
                <h1 className="mt-8 mb-6 flex-initial text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    NFT belonging to this community:  
                </h1>
                {
                    collectionNfts.length ?
                    <div className="flex flex-row flex-wrap justify-center">
                        {collectionNfts.map(nft => 
                            <a href={`https://solscan.io/account/${nft.mint}?cluster=devnet`} 
                            rel="noreferrer"
                            target="_blank"><div className="mx-auto mx-2 hover:shadow-[0_4px_16px_rgba(349,_85,_83,_0.6)]">
                                <ul className='list-style-type-none'>
                                <li key={nft.address} className="">
                                    <img src={nft.image} className="w-32" />
                                    <span className='text-xs'>{nft.name}</span>
                                </li>
                            </ul>
                            </div></a>
                        )}
                    </div> :
                    <div className="">Inactive Account</div>
                }
            </div>
            <div className="mx-auto oth-nft-wrapper">
                <h1 className="mb-6 mt-8 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Other NFT: 
                </h1>
                {
                    otherNfts.length ?
                    <div className="flex flex-row flex-wrap">
                        {otherNfts.map(nft => 
                            <a href={`https://solscan.io/account/${nft.mint}?cluster=devnet`} 
                            rel="noreferrer"
                            target="_blank">
                                <div className="mx-auto mx-2">
                                <ul className='list-style-type-none hover:shadow-[0_4px_16px_rgba(349,_85,_83,_0.6)]'>
                                <li key={nft.address} className="">
                                    <img src={nft.image} className="w-32" />
                                    <span className='text-xs'>{nft.name}</span>
                                </li>
                            </ul>
                            </div></a>
                        )}
                    </div> :
                    <div className="">No Other NFT</div>
                }
            </div>
            <div className="trade-with-wrapper hidden">
                <div className="back mt-12 mb-6 cursor-pointer" onClick={backClick}>&#129068; Back to NFT</div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Trade created by you with {username}
                    <br />
                </h2>
                <button
                    className="group mb-8 w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                    onClick={selfTradeClick}
                >
                    <span className="block group-disabled:hidden text-white" > 
                        Check 
                    </span>
                </button>

                <h2 className="text-2xl mt-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Trade created by {username} with you
                    <br />
                </h2>
                <button
                    className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
                    onClick={userTradeClick}
                >
                    <span className="block group-disabled:hidden text-white" > 
                        Check 
                    </span>
                </button>
            </div>
        </div>
    );
};

interface ProfileProps {
    username: string,
    mint: PublicKey,
    address: PublicKey
}