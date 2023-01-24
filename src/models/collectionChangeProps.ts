import { PublicKey } from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";

export interface CollectionChangeProps {
    collectionDetails: PublicKey,
    verifiedCollection: PublicKey,
    program: Program
}