import {FC, useCallback, useState} from "react";
import { notify } from "utils/notifications";
import { Keypair, PublicKey, TransactionSignature } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";

export const CreateProposal: FC<CreateProposalProps> = ({collectionDetails, nfts, metaplex, program}) => {
    const [proposalLength, setProposalLength] = useState(0);
    const [proposalText, setProposalText] = useState("");

    const wallet = useWallet();

    const onProposalChange = e => {
        const proposal = e.target.value;
        setProposalLength(proposal.length);
        setProposalText(proposal);
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!wallet.publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        if (nfts.length === 0) {
            notify({ type: 'error', message: `You don't have any NFT from this collection.` });
            return;
        }

        let mint = nfts[0].mintAddress;
        let token = getAssociatedTokenAddressSync(mint,wallet.publicKey);
        let metadata = metaplex.nfts().pdas().metadata({mint});
        let proposalDetails = Keypair.generate();

        let signature: TransactionSignature = '';

        const options = [];

        for (let i=1; i<6; i++) {
            let value = (document.querySelector(".option-"+i) as HTMLInputElement).value;
            if (value) {
                options.push(value);
            }
        }

        try {
            signature = await program.methods.createProposal(
                proposalText,
                options
            )
            .accounts({
                collectionDetails,
                proposalDetails: proposalDetails.publicKey,
                token,
                mint,
                metadata
            })
            .signers([proposalDetails])
            .rpc();

            console.log(signature);
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });

        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet, notify, program,proposalText]);

    const backClick = () => {
        document.querySelector(".create-module").classList.add("hidden");
        document.querySelector(".proposal-module").classList.remove("hidden");
    }

    return (
        <div>
            <form 
                className="flex flex-col"
                onSubmit={handleSubmit}
            >
                <div className="back mt-4 cursor-pointer mx-auto" onClick={backClick}>&#129068; Back to Proposals</div>
                <h2 className="text-center mt-4 mb-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                    Create Proposal
                </h2>
                <div className="">
                    <textarea onChange={onProposalChange} id="message" required rows={7} maxLength={300} className="w-96 mx-auto block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write proposal here..">{proposalText}</textarea>
                </div>
                <div className="mx-auto"><span className="max-warning-proposal">max: {proposalLength}/300</span></div>
                <div className="create-options w-80 mx-auto">
                    <div className='create-option'>
                        <input type="text" maxLength={25} className="option-1 w-96 mx-auto text-sm mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Option text here...max 25 chars" required />
                    </div>
                    <div className='create-option' >
                        <input type="text" maxLength={25} className="option-2 w-full text-sm mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Option text here...max 25 chars" required />
                    </div>
                    <div className='create-option' >
                        <input type="text" maxLength={25} className="option-3 w-full text-sm mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Option text here...max 25 chars" />
                    </div>
                    <div className='create-option' >
                        <input type="text" maxLength={25} className="option-4 w-full text-sm mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Option text here...max 25 chars" />
                    </div>
                    <div className='create-option' >
                        <input type="text" maxLength={25} className="option-5 w-full text-sm mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Option text here...max 25 chars" />
                    </div>
                </div>
                <div className="mx-auto text-sm mt-2">Add minimum 2 and max 5 options</div>

                <div className="mx-auto mt-6">
                    <button type="submit" className=" relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#96544E] to-[#D51F3E]  group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                        <span className="text-slate-300 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            Create Proposal
                        </span>
                    </button>
                </div>
            </form>
        </div>
    )
}

interface CreateProposalProps {
    collectionDetails: PublicKey,
    nfts: any,
    metaplex: Metaplex,
    program: Program
}