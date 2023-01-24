import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";

interface IdentityStore extends State {
  data;
  getIdentity: (publicKey: PublicKey, program: anchor.Program) => void
}

const useIdentityStore = create<IdentityStore>((set, _get) => ({
  data: {},
  getIdentity: async (publicKey, program) => {
    let data = {};
    try {
        data = await program.account.identity.fetch(publicKey);
    } catch (e) {
      console.log(`error fetching data: `, e);
    }
    set((s) => {
      s.data = data;
      console.log(`identity data updated, `, data);
    })
  },
}));

export default useIdentityStore;