import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import {Metaplex, Metadata} from '@metaplex-foundation/js'

interface AdminNftStore extends State {
  nfts: Array<Metadata>;
  getAdminNft: (publicKey: PublicKey, metaplex: Metaplex) => void
}

const useAdminNftStore = create<AdminNftStore>((set, _get) => ({
  nfts: [],
  getAdminNft: async (publicKey, metaplex) => {
    let nfts = [];
    try {
      let unfilteredNfts = await metaplex.nfts().findAllByOwner({
        owner: publicKey
      })
      nfts = unfilteredNfts.filter(nft => !nft.collection)
    } catch (e) {
      console.log(`error fetching nfts: `, e);
    }
    set((s) => {
      s.nfts = nfts;
      console.log(`admin nfts updated, `, nfts);
    })
  },
}));

export default useAdminNftStore;