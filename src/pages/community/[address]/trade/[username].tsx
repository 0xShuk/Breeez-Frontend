import type { NextPage } from "next";
import { TradeView } from "../../../../views";
import { useRouter } from "next/router";
import { PublicKey } from "@metaplex-foundation/js";

const Trade: NextPage = () => {
    const router = useRouter();
    const {username, address} = router.query;

    return (
        <div>
            <TradeView mint={new PublicKey(address)} username={username.toString()}/>
        </div>
    );
};

Trade.getInitialProps = async ({query}) => {
    const {address} = query;

    if (!address) throw {error: "No Mint"};

    try {
        const mintPubKey = new PublicKey(address);
        return {mint: mintPubKey};
    } catch {
        throw {error: "Invalid Mint Address"};
    }
}


export default Trade;
