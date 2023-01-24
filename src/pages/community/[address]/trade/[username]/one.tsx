import type { NextPage } from "next";
import { HandleTradeView } from "../../../../../views";
import { useRouter } from "next/router";
import { PublicKey } from "@metaplex-foundation/js";

const One: NextPage = () => {
    const router = useRouter();
    const {username, address} = router.query;

    return (
        <div>
            <HandleTradeView mint={new PublicKey(address)} username={username.toString()} type={"one"}/>
        </div>
    );
};

One.getInitialProps = async ({query}) => {
    const {address} = query;

    if (!address) throw {error: "No Mint"};

    try {
        const mintPubKey = new PublicKey(address);
        return {mint: mintPubKey};
    } catch {
        throw {error: "Invalid Mint Address"};
    }
}


export default One;
