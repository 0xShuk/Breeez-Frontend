import create, { State } from 'zustand'
import { PublicKey } from '@solana/web3.js'
import {Metaplex, Metadata} from '@metaplex-foundation/js'

interface PartyNftStore extends State {
  nfts: Array<Metadata>;
  getPartyNfts: (publicKey: PublicKey, metaplex: Metaplex, mint: PublicKey) => void
}

const usePartyNftStore = create<PartyNftStore>((set, _get) => ({
  nfts: [],
  getPartyNfts: async (publicKey, metaplex, mint) => {
    let nfts = [];
    try {
      nfts = await metaplex.nfts().findAllByOwner({
        owner: publicKey
      });

      nfts = nfts.filter(nft => {
        if (nft.collection) {
          return nft.collection.address.toBase58() === mint.toBase58()
        }
    });
    } catch (e) {
      console.log(`error fetching nfts: `, e);
    }
    set((s) => {
      s.nfts = nfts;
      console.log(`party nfts updated, `);
    })
  },
}));

export default usePartyNftStore;