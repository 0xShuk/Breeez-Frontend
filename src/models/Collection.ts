import { PublicKey } from "@metaplex-foundation/js";
import {BN} from "@project-serum/anchor";

export interface Collection {
    verifiedCollectionKey: PublicKey,
    count: BN,
    emission: BN,
    isCommunity: boolean,
    isStaking: boolean,
    isTrade: boolean,
    isVoting: boolean,
    quorum: BN,
    tokenMint: null | PublicKey,
    tradeDuration: BN,
    tradeFees: BN,
    treasuryAddress: PublicKey,
    voteDuration: BN
}