// TODO: SignMessage
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useEffect, useMemo } from 'react';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {useRouter} from "next/router"

//Store
import useAdminNftStore from '../stores/useAdminNftStore';

export const AdminConnected: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const nfts = useAdminNftStore((s) => s.nfts)
    const { getAdminNft } = useAdminNftStore()
  
    useEffect(() => {
      if (wallet.publicKey) {
        console.log(wallet.publicKey.toBase58())
        getAdminNft(wallet.publicKey, metaplex)
      }
    }, [wallet.publicKey, connection, getAdminNft]);

    const handleClick = (address: PublicKey) => {
        router.push(`/collection?mint=${address.toBase58()}`);
    }

    return (
        <div className=".w-20">
            <h4 className="md:w-full text-center text-slate-200 my-2">
                <p>Select the mint of the verified collection NFT</p>
            </h4>
            <div className="bg-primary p-10 my-2">
                <button id="dropdownUsersButton" data-dropdown-toggle="dropdownUsers" data-dropdown-placement="bottom" 
                onClick={() => {
                    document.getElementById('dropdownUsers').classList.toggle("hidden");
                }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
                    Select Verified Collection Key &darr;
                </button>
                {
                    nfts.length > 0 ?
                    <div id="dropdownUsers" className="z-10 hidden bg-white rounded shadow w-104 dark:bg-gray-700">
                        <ul className="w-104 h-48 py-1 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton">
                            {
                                nfts.map(nft => 
                                    <li key={nft.mintAddress.toBase58()} onClick={() => handleClick(nft.mintAddress)}>
                                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            {nft.name} - {nft.mintAddress.toBase58()}
                                        </a>
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                    :
                    <div id="dropdownUsers" className="z-10 hidden rounded shadow w-104 my-4">
                        You don't have any collection NFT
                    </div>
                }
        </div>
        </div>
    );
};
