import {FC, useEffect, useState} from "react";
import { PublicKey, } from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";

import {Collection} from "../models/Collection";

import { AdminTrade } from "./AdminTrade";
import { AdminStake } from "./AdminStake";
import { AdminVoting } from "./AdminVoting";
import { EditTrade } from "./EditTrade";
import { EditStake } from "./EditStake";
import { EditVoting } from "./EditVoting";
import { SearchMember } from "./SearchMember";
import { useRouter } from "next/router";

export const Dashboard: FC<DashboardProps> = ({collectionData, metadata, uri}) => {
    const [activeModules, setActiveModules] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const activeModules = [];

        collectionData.isStaking ? activeModules.push("Staking") : "";
        collectionData.isTrade ? activeModules.push("Trade") : "";
        collectionData.isVoting ? activeModules.push("Voting") : "";

        setActiveModules(activeModules);
    }, [collectionData]);

    const handleClick = e => {
        let module = e.target.closest("[data-module]").dataset.module;

        if (module === "trade") {
            document.querySelector(".module-wrapper").classList.add('hidden');
            document.querySelector(".button-wrapper").classList.add('hidden');
            document.querySelector(`.${module}-module`).classList.remove('hidden');
        } else if (module === "voting") {
            router.push(`/community/${collectionData.verifiedCollectionKey.toBase58()}/proposal`)
        } else if (module === "staking") {
            alert("The staking frontend will be completed shortly.");
        }
    }

    const profileClick = () => {
        router.push(`${collectionData.verifiedCollectionKey.toBase58()}/me`)
    }

    return (
        <div className="mx-auto">
                {
                    uri.name ?
                    <div className="flex flex-col">
                        <h1 className="mb-4 flex-initial text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                            {uri.name}
                        </h1>
                        <div className=""><img src={uri.image} className="w-32 mb-4 mx-auto" /></div>
                        <h3>{uri.description ? uri.description : ""}</h3>
                        <div className="mt-10 button-wrapper">
                            <button data-module="search" onClick={handleClick} className="mx-auto inline-flex p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                <span className="w-40 text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    Search Member
                                </span>
                            </button>

                            <button onClick={profileClick} className="mx-auto inline-flex p-0.5 mb-4 ml-6 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                <span className="w-40 text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    My Profile
                                </span>
                            </button>
                        </div>
                        <div className="module-wrapper">
                            <div className="active-modules mt-8">
                                {
                                    activeModules.length ? 
                                    activeModules.map(module => <div className="shadow-[0_4px_16px_rgba(349,_85,_83,_0.6)] p-10 my-4 w-60 inline-block mx-8">

                                    <div className="text-lg font-semibold mb-1">{module}</div>
                                        <button data-module={module.toLowerCase()} onClick={handleClick} className="mt-4 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                            <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                Enter module
                                            </span>
                                        </button>
                                    </div>)
                                    : <div>No module is active in this community</div>
                                }
                            
                            </div>
                        </div>
                        <div className="search-module w-96 mx-auto hidden">
                            <SearchMember collection={metadata.address} type="search"/>
                        </div>
                        <div className="trade-module w-96 mx-auto hidden">
                            <SearchMember collection={metadata.address} type="trade"/>
                        </div>
                    </div>  
                    :
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        Loading...
                    </h1>
                }
        </div>
    )
}

interface DashboardProps {
    collectionData: Collection,
    metadata: any,
    uri: any
}
