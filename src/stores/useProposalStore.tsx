import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";

interface ProposalStore extends State {
  proposals: Array<any>;
  getProposal: (collection: PublicKey, program: anchor.Program) => void
}

const useCollectionStore = create<ProposalStore>((set, _get) => ({
  proposals: [],
  getProposal: async (collection, program) => {
    let proposals;
    try {
        proposals = await program.account.proposal.all();
        proposals = proposals.filter(proposal => proposal.account.collection.toBase58() === collection.toBase58());
    } catch (e) {
      console.log(`error fetching data: `, e);
    }
    set((s) => {
      s.proposals = proposals;
      console.log(`proposals updated, `);
    })
  },
}));

export default useCollectionStore;