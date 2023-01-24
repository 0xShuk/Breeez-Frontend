import { PublicKey } from "@metaplex-foundation/js";
import {BN} from "@project-serum/anchor";

export interface Proposal {
    collection: PublicKey,
    proposal: string
    options: Array<string>,
    votes: Array<BN>,
    voters: Array<number>,
    isActive: boolean,
    isPassed: boolean,
    time: BN,
    creator: PublicKey
}