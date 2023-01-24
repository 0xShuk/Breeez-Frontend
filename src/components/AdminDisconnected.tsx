import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback, MouseEventHandler } from 'react';
import {useWalletModal} from '@solana/wallet-adapter-react-ui';

export const AdminDisconnected: FC = () => {
    const {wallet, connect} = useWallet();
    const modalState = useWalletModal();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(event => {
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

    return (
        <div>
            <h4 className="md:w-full text-center text-slate-300 my-2">
                <p>Connect your wallet to manage your collection</p>
            </h4>
            <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={handleClick}
            >
                <div className="hidden group-disabled:block">
                    Wallet not connected
                </div>
                <span className="block group-disabled:hidden" > 
                    Select Wallet 
                </span>
            </button>
        </div>
    );
};
