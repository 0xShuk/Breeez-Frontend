import { FC } from "react";
import { useEffect, useCallback, useMemo } from "react";
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import idl from "../../utils/breeez.json";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js"
import {CreateCollection} from "../../components/CreateCollection";

//Store
import useCollectionStore from 'stores/useCollectionStore';
import { AdminPanel } from "components/AdminPanel";

export const CollectionView: FC<CollectionProps> = ({mint}) => {
    const {connection} = useConnection();
    const wallet = useAnchorWallet();
    const provider = new anchor.AnchorProvider(connection,wallet,{});
    anchor.setProvider(provider);

    const program = new anchor.Program(idl as anchor.Idl,idl.metadata.address);

    const collectionData = useCollectionStore((s) => s.data)
    const { getCollection } = useCollectionStore()
  
    const metaplex = useMemo(() => {
        return Metaplex.make(connection)
    },[wallet, connection]);

    const metadata = metaplex.nfts().pdas().metadata({ mint: new PublicKey(mint)});

    const [address,_0] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('collection'),
            metadata.toBytes()
        ],
        new PublicKey(idl.metadata.address)
    )

    useEffect(() => {
        getCollection(address, program)
    }, [connection, getCollection]);

    return (
        <div className="md:w-full text-center my-10">
            {
                collectionData.verifiedCollectionKey ?
                    <AdminPanel collectionData={collectionData} address={address} metadata={metadata} program={program}/> :
                    <CreateCollection mint={mint} metadata={metadata} collection={address} program={program}/>
            }                
        </div>
    );
};


interface CollectionProps {
    mint: PublicKey
}
