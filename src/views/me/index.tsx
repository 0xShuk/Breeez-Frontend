import { FC } from "react";
import { useMemo } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import idl from "../../utils/breeez.json";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js"

import { MyProfile } from "components/MyProfile";

export const MyProfileView: FC<ProfileProps> = ({ mint}) => {
    const wallet = useWallet();
    const {connection} = useConnection();

    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const metadata = metaplex.nfts().pdas().metadata({ mint});

    const [collection,_0] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('collection'),
            metadata.toBytes()
        ],
        new PublicKey(idl.metadata.address)
    )

    return (
        <div className="md:w-full text-center my-10">
            {
                wallet.publicKey ?
                <MyProfile collection={collection} mint={mint}/> :
                <div className="">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#D51F3E] to-[#96544E] ">
                        Your wallet is not connected!
                        <br /><br />
                    </h1>
                    <div className="">Connect your wallet first</div>
                </div>
            }
        </div>
    );
};


interface ProfileProps {
    mint: PublicKey,
}
