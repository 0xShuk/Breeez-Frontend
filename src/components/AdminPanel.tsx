import {FC, useEffect, useState} from "react";
import { PublicKey } from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";

import {Collection} from "../models/Collection";

import { AdminTrade } from "./AdminTrade";
import { AdminStake } from "./AdminStake";
import { AdminVoting } from "./AdminVoting";
import { EditTrade } from "./EditTrade";
import { EditStake } from "./EditStake";
import { EditVoting } from "./EditVoting";

export const AdminPanel: FC<AdminPanelProps> = ({collectionData, address, metadata, program}) => {
    const [activeModules, setActiveModules] = useState([]);
    const [inactiveModules, setInactiveModules] = useState([]);

    useEffect(() => {
        const activeModules = [];
        const inactiveModules = [];

        collectionData.isStaking ? activeModules.push("Staking") : inactiveModules.push("Staking");
        collectionData.isTrade ? activeModules.push("Trade") : inactiveModules.push("Trade");
        collectionData.isVoting ? activeModules.push("Voting") : inactiveModules.push("Voting");

        setActiveModules(activeModules);
        setInactiveModules(inactiveModules);
    }, [collectionData]);

    const handleClick = e => {
        let module = e.target.closest("[data-module]").dataset.module;
        document.querySelector(".module-wrapper").classList.add('hidden');
        document.querySelector(`.${module}-module`).classList.remove('hidden');
    }

    const handleEditClick = e => {
        let module = e.target.closest("[data-module]").dataset.module;
        document.querySelector(".module-wrapper").classList.add('hidden');
        document.querySelector(`.edit-${module}-module`).classList.remove('hidden');
    }

    return (
        <div className="text-slate-200">
             <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                Collection Admin Panel
                <br /><br />
            </h1>
            <div className="text-center">
                <p>Collection Address: 
                <a
                  href={'https://explorer.solana.com/address/' + address.toBase58() + `?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 p-1 link-accent"
                >{address.toBase58()}</a>
                </p>
            </div>
            <div className="module-wrapper">
                <h1 className="mt-6 mb-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Active Modules
                </h1>
                <div className="active-modules">
                    {
                        activeModules.length ? 
                        activeModules.map(module => <div className="shadow-[0_4px_16px_rgba(349,_85,_83,_0.6)] p-10 my-4 w-60 inline-block mx-8">

                        <div className="text-lg font-semibold mb-1">{module}</div>
                            <button data-module={module.toLowerCase()} onClick={handleEditClick} className="mt-4 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    Edit Module
                                </span>
                            </button>
                        </div>)
                        : <div>None</div>
                    }
                
                </div>
                <h1 className="mt-6 mb-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Inactive Modules
                </h1>   
                <div className="inactive-modules">
                    {
                        inactiveModules.length ?
                        inactiveModules.map(module => <div className="shadow-[0_4px_16px_rgba(349,_85,_83,_0.6)] p-10 my-4 w-60 inline-block mx-8">

                        <div className="text-lg font-semibold mb-1">{module}</div>
                            <button data-module={module.toLowerCase()} onClick={handleClick} className="mt-4 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    Add Module
                                </span>
                            </button>
                        </div>)
                        : <div>None</div>
                    }
                </div>
            </div>
            <div className="trade-module w-96 inline-block hidden">
                <AdminTrade collectionDetails={address} verifiedCollection={metadata} program={program}/>
            </div>
            <div className="staking-module w-96 inline-block hidden">
                <AdminStake collectionDetails={address} verifiedCollection={metadata} token={collectionData.tokenMint} program={program}/>
            </div>
            <div className="voting-module w-96 inline-block hidden">
                <AdminVoting collectionDetails={address} verifiedCollection={metadata} program={program}/>
            </div>
            <div className="edit-trade-module hidden">
                <EditTrade collectionDetails={address} verifiedCollection={metadata} program={program}/>
            </div>
            <div className="edit-staking-module hidden">
                <EditStake collectionDetails={address} verifiedCollection={metadata} program={program}/>
            </div>
            <div className="edit-voting-module hidden">
                <EditVoting collectionDetails={address} verifiedCollection={metadata} program={program}/>
            </div>
        </div>
    )
}

interface AdminPanelProps {
    collectionData: Collection,
    address: PublicKey,
    metadata: PublicKey,
    program: Program
}
