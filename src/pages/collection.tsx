import type { NextPage } from "next";
import Head from "next/head";
import { CollectionView } from "../views";
import { PublicKey } from "@solana/web3.js";

const Collection: NextPage<CollectionProps> = ({mint}) => {
    return (
        <div>
        <Head>
            <title>Breeez - Utility Suite for NFT Communities - Admin Panel</title>
            <meta
            name="description"
            content="Basic Functionality"
            />
        </Head>
        <CollectionView mint={mint}/>
        </div>
    );
};

interface CollectionProps {
    mint: PublicKey
}

Collection.getInitialProps = async ({query}) => {
    const {mint} = query;

    if (!mint) throw {error: "No Metadata"};

    try {
        const mintPubKey = new PublicKey(mint);
        return {mint: mintPubKey};
    } catch {
        throw {error: "invalid metadata"};
    }
}

export default Collection;
