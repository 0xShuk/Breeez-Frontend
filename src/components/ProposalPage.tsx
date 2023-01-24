import {FC, useEffect, useState, useCallback} from "react";
import { Proposal } from "models/Proposal";
import { PublicKey, TransactionSignature } from "@solana/web3.js";
import { notify } from "utils/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program } from "@project-serum/anchor"; 
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";

export const ProposalPage: FC<ProposalPageProps> = ({proposal, backClick, nfts, program, metaplex, collectionDetails, proposalDetails}) => {
    const [chosen, setChosen] = useState();
    const [voteCount, setVoteCount] = useState(0);

    // let votes = nfts.filter(nft => {
    //     const num = parseInt(nft.name.substring(nft.name.indexOf('#')+1,nft.name.length));
    //     const index = num / 8;
    //     const pos = num % 8;


    // });

    const wallet = useWallet();

    const optionClick = (value) => {
        setChosen(value);
    }

    const updateCount = (e) => {
        setVoteCount(e.target.value);
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        console.log(chosen,voteCount);
        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        if (nfts.length === 0) {
            notify({ type: 'error', message: `You don't have any NFT to vote.` });
            return;
        }

        if (voteCount > nfts.length) {
            notify({ type: 'error', message: `Your don't have ${voteCount} nfts` });
            return;
        }

        if (voteCount === 0) {
            notify({ type: 'error', message: `Add at least 1 vote` });
            return;
        }

        let signature: TransactionSignature = '';

        const remainingAccounts = [];

        for (let i=0;i<voteCount;i++) {
            let mint = nfts[i].mintAddress;
            let token = getAssociatedTokenAddressSync(mint,wallet.publicKey);
            let metadata = metaplex.nfts().pdas().metadata({mint});

            remainingAccounts.push(
                {pubkey: token, isWritable: false, isSigner: false},
                {pubkey: metadata, isWritable: false, isSigner: false},
            );
        }

        console.log(remainingAccounts)
        try {
            signature = await program.methods.giveVote(chosen)
            .accounts({
                collection: collectionDetails,
                proposalDetails,
            })
            .remainingAccounts(remainingAccounts)
            .rpc();

            console.log(signature);
            // nfts = nfts.slice(voteCount,nfts.length);

            notify({ type: 'success', message: 'Transaction successful!', txid: signature });

        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet, notify, program, chosen, voteCount]);


    return (
    <div className="px-8 text-center">
        <div className="back mt-4 cursor-pointer mx-auto" onClick={backClick}>&#129068; Back to Proposals</div>
        <div className="bg-primary px-8 py-6 my-4">
            {proposal.proposal}
        </div>
        <div className="flex flex-row">
        {
        proposal.options.map((option,i) => 
                <div className="mx-auto justify-center">
                    <button 
                        onClick={() => optionClick(i)} 
                        className=" w-60 relative inline-flex p-0.5 mb-2 ml-8 mt-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                        <span className="w-60 text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            {option}
                        </span>
                    </button>
                    <div className="mx-auto">
                        {proposal.votes[i].toNumber()} votes
                    </div>
                </div>
        )
        }
        </div>
        <div className="">
            Option Chosen: {proposal.options[chosen]}
        </div>
        <div className="mx-auto w-60 mt-8">
            How many nfts? 
            <div className="">Remaining nfts: {nfts.length}</div>
            <div className='create-option'>
                <input type="number" min={1} max={14} value={voteCount} onChange={updateCount} className="option-1 w-96 mx-auto text-sm mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Max 14 nfts in one transaction.." required />
            </div>
        </div>
        <button
            className="mt-8 group w-60 m-5 btn disabled:animate-none bg-gradient-to-r from-[#D51F3E] to-[#96544E] hover:from-pink-500 hover:to-yellow-500 ... "
            onClick={handleSubmit}
        >
            <span className="block group-disabled:hidden text-white" > 
                Vote 
            </span>
        </button>
    </div>
    )
}

interface ProposalPageProps {
    collectionDetails: PublicKey,
    proposalDetails: PublicKey,
    proposal: Proposal,
    backClick: any,
    nfts: any,
    program: Program,
    metaplex: Metaplex
}