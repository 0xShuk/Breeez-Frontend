import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";

interface UsernameStore extends State {
  data;
  getUsername: (publicKey: PublicKey, program: anchor.Program) => void
}

const useUsernameStore = create<UsernameStore>((set, _get) => ({
  data: {},
  getUsername: async (publicKey, program) => {
    let data = {};
    try {
        data = await program.account.username.fetch(publicKey);
    } catch (e) {
      console.log(`error fetching data: `, e);
    }
    set((s) => {
      s.data = data;
      console.log(`username data updated, `, data);
    })
  },
}));

export default useUsernameStore;