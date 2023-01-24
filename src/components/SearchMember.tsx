import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { FC, useState} from "react";

export const SearchMember: FC<SearchProps> = ({collection, type}) => {
    const [name, setName] = useState("");
    const router = useRouter();

    const nameChange = e => {
        setName(e.target.value);
    }

    const backClick = () => {
        document.querySelector(".module-wrapper").classList.remove('hidden');
        document.querySelector(".button-wrapper").classList.remove('hidden');

        type === "trade" ?
        document.querySelector(`.trade-module`).classList.add('hidden')
        : document.querySelector(`.search-module`).classList.add('hidden');
    }

    const onSubmit = e => {
        e.preventDefault();
        type === "trade" ?
        router.push(`${collection}/trade/${name}`) :
        router.push(`${collection}/user/${name}`);
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="back mt-8 cursor-pointer" onClick={backClick}>&#129068; Back to Dashboard</div>
            <h1 className="mt-6 mb-6 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    {type === "trade" ? "Trade with" : "Search"} a member
            </h1>
            <div className="mb-10">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                <input onChange={nameChange} type="text" className="inline-block w-96 bg-gray-300 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="enter the username.." required />
            </div>
            <button type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Search
                </span>
            </button>
        </form>
    )
}

interface SearchProps {
    collection: PublicKey,
    type: string
}