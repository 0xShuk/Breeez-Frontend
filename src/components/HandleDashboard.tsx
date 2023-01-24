import { FC } from "react";
import {useRouter} from "next/router";

export const HandleDashboard: FC = () => {
    const router = useRouter();

    const onAdminClick = () => {
        router.push('/admin');
    }

    const onWalletClick = () => {
        router.push('/');
    }

    return (
        <div className="justify-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                Breeez is not activated for this collection yet!
                <br /><br />
            </h1>
            <h4 className="md:w-full text-center text-slate-200 my-1">
                <p>If you are the owner of this collection, visit Admin Panel to activate Breeez:
                </p>
            </h4>
            <button
            className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
            onClick={onAdminClick}
            >
                <span className="block group-disabled:hidden text-white" > 
                    Activate Breeez 
                </span>
            </button>
            <h4 className="md:w-full text-center text-slate-200 mt-8">
                <p>Go to your wallet to see all the communities:
                </p>
            </h4>
            <button
            className="group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
            onClick={onWalletClick}
            >
                <span className="block group-disabled:hidden text-white" > 
                    My Wallet 
                </span>
            </button>
        </div>
    )
}