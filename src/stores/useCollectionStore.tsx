import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";

interface CollectionStore extends State {
  data;
  getCollection: (publicKey: PublicKey, program: anchor.Program) => void
}

const useCollectionStore = create<CollectionStore>((set, _get) => ({
  data: {},
  getCollection: async (publicKey, program) => {
    let data = {};
    try {
        data = await program.account.collection.fetch(publicKey);
    } catch (e) {
      console.log(`error fetching data: `, e);
    }
    set((s) => {
      s.data = data;
      console.log(`collection data updated, `, data);
    })
  },
}));

export default useCollectionStore;