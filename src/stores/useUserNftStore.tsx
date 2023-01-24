import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import {Metaplex, Metadata} from '@metaplex-foundation/js'

interface UserNftStore extends State {
  nfts: Array<Metadata>;
  getUserNft: (publicKey: PublicKey, metaplex: Metaplex) => void
}

const useUserNftStore = create<UserNftStore>((set, _get) => ({
  nfts: [],
  getUserNft: async (publicKey, metaplex) => {
    let nfts = [];
    try {
      nfts = await metaplex.nfts().findAllByOwner({
        owner: publicKey
      });
    } catch (e) {
      console.log(`error fetching nfts: `, e);
    }
    set((s) => {
      s.nfts = nfts;
      console.log(`user nfts updated, `);
    })
  },
}));

export default useUserNftStore;