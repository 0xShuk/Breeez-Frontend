import { FC, useState } from "react";
import { useEffect, useCallback, useMemo } from "react";
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import idl from "../../utils/breeez.json";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js"

//Store
import useCollectionStore from 'stores/useCollectionStore';
import { Dashboard } from "components/Dashboard";
import { HandleDashboard } from "components/HandleDashboard";
import axios from "axios";

export const CommunityView: FC<CollectionProps> = ({mint}) => {
    const [collectionMetadata, setCollectionMetadata] = useState({});
    const [uriData, setUriData] = useState({});

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

    const metadata = metaplex.nfts().pdas().metadata({ mint});

    const [address,_0] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('collection'),
            metadata.toBytes()
        ],
        new PublicKey(idl.metadata.address)
    )

    useEffect(() => {
        getCollection(address, program);
    }, [connection, getCollection]);

    const getCollectionMetadata = async(mint: PublicKey,metaplex: Metaplex) => {
        const data = await metaplex.nfts().findByMint({mintAddress: mint});
        const uri = await axios.get(data.uri);
        setCollectionMetadata(data);
        setUriData(uri.data);
    }

    useEffect(() => {
        getCollectionMetadata(mint,metaplex);
    },[collectionData, connection]);

    return (
        <div className="md:w-full text-center my-10">
            {
                collectionData.verifiedCollectionKey ?
                <Dashboard collectionData={collectionData} metadata={collectionMetadata} uri={uriData}/> :
                <HandleDashboard />
            }                
        </div>
    );
};


interface CollectionProps {
    mint: PublicKey
}
