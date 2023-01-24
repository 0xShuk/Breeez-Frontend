import create, { State } from 'zustand'
import { PublicKey, Connection, GetProgramAccountsFilter } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface TokenStore extends State {
  tokens: any;
  getTokens: (publicKey: PublicKey, connection: Connection) => void
}

const useTokenStore = create<TokenStore>((set, _get) => ({
  tokens : [],
  getTokens: async (publicKey, connection) => {
    let tokens = [];
    try {
        const filters:GetProgramAccountsFilter[] = [
            {
              dataSize: 165,    //size of account (bytes)
            },
            {
              memcmp: {
                offset: 32,     
                bytes: publicKey.toBase58(),
              }            
            }
        ];

        tokens = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters
        }
      )

    } catch (e) {
      console.log(`error fetching nfts: `, e);
    }
    set((s) => {
      s.tokens = tokens;
      console.log(`tokens updated, `);
    })
  },
}));

export default useTokenStore;