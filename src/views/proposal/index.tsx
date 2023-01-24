import { FC, useState } from "react";
import { useEffect, useCallback, useMemo } from "react";
import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import idl from "../../utils/breeez.json";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js"
import { useRouter } from "next/router";
//Store
import useProposalStore from 'stores/useProposalStore';
import useCollectionStore from 'stores/useCollectionStore';
import usePartyNftStore from "stores/usePartyNftStore";
import { CreateProposal } from "components/CreateProposal";

export const ProposalView: FC<ProposalViewProps> = ({mint}) => {
    let [pageNum, setPageNum] = useState(0);
    let [selectedProposal, setSelectedProposal] = useState();

    const {connection} = useConnection();
    const wallet = useWallet();
    const router = useRouter();
    const provider = new anchor.AnchorProvider(connection,wallet,{});
    anchor.setProvider(provider);

    const program = new anchor.Program(idl as anchor.Idl,idl.metadata.address);

    const proposals = useProposalStore((s) => s.proposals)
    const { getProposal } = useProposalStore();

    const collectionData = useCollectionStore((s) => s.data)
    const { getCollection } = useCollectionStore();
  
    const nfts = usePartyNftStore((s) => s.nfts)
    const { getPartyNfts } = usePartyNftStore()

    useEffect(() => {
        if (wallet.connected) {
          getPartyNfts(wallet.publicKey, metaplex, mint);
        }
      }, 
    [wallet.connected, connection, getPartyNfts]);

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const metadata = metaplex.nfts().pdas().metadata({ mint: new PublicKey(mint)});

    const [collectionAddress,_0] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('collection'),
            metadata.toBytes()
        ],
        new PublicKey(idl.metadata.address)
    )

    useEffect(() => {
        getProposal(collectionAddress, program)
    }, [connection, getProposal]);


    useEffect(() => {
        getCollection(collectionAddress, program)
    }, [connection, getCollection]);


    const getTime = (time) => {
        let now = Date.now() / 1000;
        let dif = Math.abs(time - now);
        
        if (dif < 60) {
            return {time: Math.round(dif), den: "seconds"};
        } else if (dif < 3600) {
            return {time: Math.round(dif/60), den: "minutes"};
        } else if (dif < 86400) {
            return {time: Math.round(dif/3600), den: "hours"};
        } else {
            return {time: Math.round(dif/86400), den: "days"};
        }
    }

    const backClick = () => {
        router.push(`/community/${mint.toBase58()}`)
    }

    const createClick = () => {
        document.querySelector(".create-module").classList.remove("hidden");
        document.querySelector(".proposal-module").classList.add("hidden");
    }

    const handleVoteClick = i => {
        setPageNum(1)
        setSelectedProposal(proposals[i]);
    }

    const backFromProposalPage = () => {
        setPageNum(0);
    }

    return (
        <div className="md:w-full my-10">
            <div className="text-center">
                <h1 className=" text-center mt-6 mb-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Proposals
                </h1>
                <button onClick={backClick} type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                    <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Back to Dashboard
                    </span>
                </button>
                <button type="submit" className="ml-4 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                    <span onClick={createClick} className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Create Proposal
                    </span>
                </button>
                <div className="mt-2">You have {nfts.length} votes</div>
            </div>
            {
            pageNum === 0 ?
            <div className="">
            {
            proposals.length ?
            <ul className="list-style-type-none p-4 proposal-module">
                {
                proposals.map((proposal, index) => 
                    <li key={proposal.publicKey} >
                        <div className="bg-primary px-8 py-6 my-4">
                            <div className="ml-4">{proposal.account.proposal.length > 150 ? proposal.account.proposal.substring(0,150)+" ......" : proposal.account.proposal}</div>
                            <br/>
                            <div className="second-row flex flex-row justify-between">
                                <div className="flex flex-row">
                                    <div className="mt-4 ml-8">  
                                        Created {getTime(proposal.account.time.toNumber()).time} {getTime(proposal.account.time.toNumber()).den} ago
                                    </div>
                                    <div className="mt-4 ml-8">
                                        {collectionData.verifiedCollectionKey ?
                                    `Ending in ${getTime(proposal.account.time.toNumber() + collectionData.voteDuration.toNumber()).time} ${getTime(proposal.account.time.toNumber()).den}`:
                                    ""
                                    }</div>
                                    <div className="mt-4 ml-8">Created by: <a 
                                        href={`https://solscan.io/account/${proposal.account.creator.toBase58()}?cluster=devnet`} 
                                        rel="noreferrer"
                                        className="link-accent"
                                        target="_blank"
                                    >{proposal.account.creator.toBase58().substring(0,15)}..</a></div>
                                    {
                                    collectionData.verifiedCollectionKey ?
                                        Date.now() /1000 >proposal.account.time.toNumber() + collectionData.voteDuration.toNumber() ?
                                            <button 
                                                // onClick={() => handleClick(nft.address)} 
                                                className="relative inline-flex p-0.5 mb-2 ml-4 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                                <span className="text-xs text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                    Execute
                                                </span>
                                            </button> :
                                            <button 
                                                onClick={() => handleVoteClick(index)} 
                                                className="relative inline-flex p-0.5 mb-2 ml-8 mt-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                                                <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                    Vote
                                                </span>
                                            </button> :
                                        <div className="">Loading...</div>    
                                    }
                                </div>
                                
                                <div className="pr-8">{
                                    proposal.account.isActive ? 
                                        <div className="relative inline-flex p-0.5 mb-2 ml-4 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green to-green">
                                            <span className="text-xs text-black relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-100 rounded-md">
                                                Active
                                            </span>
                                        </div> : 
                                    proposal.account.isPassed ?
                                        <div className="relative inline-flex p-0.5 mb-2 ml-4 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green to-green">
                                            <span className="text-xs text-green-700 relative px-5 py-2.5 transition-all ease-in duration-75 bg-green-100 rounded-md">
                                                Passed
                                            </span>
                                        </div> :
                                        <div className="relative inline-flex p-0.5 mb-2 ml-4 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]">
                                            <span className="text-xs text-red-700 relative px-5 py-2.5 transition-all ease-in duration-75 bg-pink-100 rounded-md">
                                                Failed
                                            </span>
                                        </div>
                                }</div>
                            </div>
                        </div>
                    </li>
                )
                }
            </ul> :
            <div className="flex mx-auto">No Proposal in this community.</div>
            }
            <div className="create-module hidden">
                <CreateProposal collectionDetails={collectionAddress} nfts={nfts} metaplex={metaplex} program={program}/>
            </div>
            </div> :
            <div className="">
                {/* <ProposalPage proposal={selectedProposal.account} backClick={backFromProposalPage} nfts={nfts}
                collectionDetails={collectionAddress} proposalDetails={selectedProposal.publicKey} 
                metaplex={metaplex} program={program}/> */}
                <div className="">Trial</div>
            </div>
            }
        </div>
    )
}

interface ProposalViewProps {
    mint: PublicKey,
}
