// TODO: SignMessage
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {useRouter} from "next/router"

//Store
import useUserNftStore from '../stores/useUserNftStore';

export const UserConnected: FC = () => {
    const [collections,setCollections] = useState([]);

    const wallet = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const nfts = useUserNftStore((s) => s.nfts)
    const { getUserNft } = useUserNftStore()
  
    useEffect(() => {
      if (wallet.publicKey) {
        getUserNft(wallet.publicKey, metaplex)
      }
    }, [wallet.publicKey, connection, getUserNft]);

    useEffect(() => {
        let collections = nfts.map(nft => {
            if (nft.collection) {
                return {
                    name: nft.name,
                    address: nft.collection.address.toBase58()
                };
            }
        });
        
        collections = collections.filter(item => item);

        collections = collections.filter(
            (el,i,col) => col.findIndex( e => (e.address === el.address) ) === i
        );

        setCollections(collections);
    },[nfts]);

    const handleClick = (address: PublicKey) => {
        router.push(`/community/${address}`);
    }

    return (
        <div className="md:hero mx-auto p-4">
            <div className="md:hero-content flex flex-col">
                <h1 className="text-4xl my-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Your Wallet
                    <br />
                </h1>
                <h4 className="md:full text-base tracking-wide text-center text-slate-200">
                    <p>Your wallet has {nfts.length} NFT belonging to {collections.length} unique 
                    collections:</p>
                </h4>
                {
                    collections.length ?
                    <ul className="list-style-type-none">
                        {
                            collections.map((nft,i) => 
                                <li key={nft.address} >
                                    <div className="bg-primary p-6 my-4">
                                        <span className="text-sm pr-2">{i+1}.</span> {nft.address}
                                        <button onClick={() => handleClick(nft.address)} className="relative inline-flex p-0.5 mb-2 ml-4 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                            <span className="text-xs text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                Enter Community
                                            </span>
                                        </button>
                                        <br/>
                                        <span className="text-sm pl-6">
                                            NFT Name: {nft.name} 
                                        </span>
                                    </div>
                                </li>
                            )
                        }
                    </ul> :
                    <div className="">Please add NFT in your wallet to see communities.</div>
                }
            </div>
        </div>
    );
};
