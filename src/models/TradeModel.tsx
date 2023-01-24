import { PublicKey} from "@solana/web3.js";
import {BN} from "@project-serum/anchor";

export interface TradeModel {
    partyOne: PublicKey,
    partyTwo: PublicKey,
    solAmount: Array<BN>,
    splAmount: Array<BN>,
    oneSendAddress: null | PublicKey,
    oneMint: null | PublicKey,
    twoSendAddress: null | PublicKey,
    twoReceiveAddress: null | PublicKey,
    twoMint: null | PublicKey,
    time: BN,
    isConfirmed: boolean,
    collection: PublicKey
}