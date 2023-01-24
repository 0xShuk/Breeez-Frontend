import type { NextPage } from "next";
import { CommunityView } from "../../views";
import { useRouter } from "next/router";
import { PublicKey } from "@metaplex-foundation/js";

const Community: NextPage = () => {
    const router = useRouter();
    const {address} = router.query;

    return (
        <div>
            <CommunityView mint={new PublicKey(address)}/>
        </div>
    );
};

Community.getInitialProps = async ({query}) => {
    const {address} = query;

    if (!address) throw {error: "No Metadata"};

    try {
        const mintPubKey = new PublicKey(address);
        return {mint: mintPubKey};
    } catch {
        throw {error: "invalid metadata"};
    }
}


export default Community;
