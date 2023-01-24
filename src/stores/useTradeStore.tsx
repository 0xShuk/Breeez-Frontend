import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";

interface TradeStore extends State {
  data;
  getTrade: (publicKey: PublicKey, program: anchor.Program) => void
}

const useTradeStore = create<TradeStore>((set, _get) => ({
  data: {},
  getTrade: async (publicKey, program) => {
    let data = {};
    try {
        data = await program.account.trade.fetch(publicKey);
    } catch (e) {
      console.log(`error fetching data: `, e);
    }
    set((s) => {
      s.data = data;
      console.log(`trade data updated, `, data);
    })
  },
}));

export default useTradeStore;