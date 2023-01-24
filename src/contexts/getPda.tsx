import { PublicKey } from "@solana/web3.js";
import idl from "../utils/breeez.json";

export function derivePda(seed:Array<any>) {
    const [pda,bump] = PublicKey.findProgramAddressSync(seed, new PublicKey(idl.metadata.address));
    
    return pda;
}