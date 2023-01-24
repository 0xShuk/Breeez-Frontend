// Next, React
import { FC, useCallback, MouseEventHandler } from 'react';
import {Footer} from "../components/Footer";
import {useRouter} from "next/router";

// Wallet
import { useWallet } from '@solana/wallet-adapter-react';
import {useWalletModal} from '@solana/wallet-adapter-react-ui';

export const UserDisconnected: FC = ({ }) => {
  const router = useRouter();
  const {wallet, connect} = useWallet();
  const modalState = useWalletModal();

  const handleUserClick: MouseEventHandler<HTMLButtonElement> = useCallback(event => {
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
  );

  const handleAdminClick = () => {
    router.push('/admin');
  }

  return (
    <div>
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <img src="logo-s.png" className='w-16 mt-4' alt="" />
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
            BREEEZ
            <br />
        </h1>
        <h4 className="md:full text-lg text-center text-slate-200 my-2">
          <p>Take your NFT community on-chain in a few seconds. </p>
          Turn on Breeez and add a flavor of blockchain in your NFT collection.
        </h4>
        <div className="flex">
          <div title="Add Profiles"><img src="hp-1.png" className="w-8 inline mx-4 hover:w-12" alt=""/></div>
          <div title="Add Staking"><img src="hp-2.png" className="w-8 inline mx-4 hover:w-12" alt=""/></div>
          <div title="Add P2P Trade"><img src="hp-3.png" className="w-8 inline mx-4 hover:w-12" alt=""/></div>
          <div title="Add Voting"><img src="hp-4.png" className="w-8 inline mx-4 hover:w-12" alt=""/></div>
        </div>
        <div className="inline-block">
          <button
            onClick={handleUserClick}
            className="m-6 btn h-14 w-60 animate-pulse disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
          >
            <div className="text-base pt-2" > 
                Enter Breeez &nbsp;
            </div>
            <span className="text-xs pb-2 capitalize" > 
                (for NFT holders) &nbsp;
            </span>
          </button>
          <button
            onClick={handleAdminClick}
            className="m-6 mb-16 btn h-14 w-60 animate-pulse disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
          >
            <span className="text-base pt-2" > 
                Activate Breeez 
            </span>
            <span className="text-xs pb-2 capitalize" > 
              (for NFT owners) 
            </span>
          </button>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};
