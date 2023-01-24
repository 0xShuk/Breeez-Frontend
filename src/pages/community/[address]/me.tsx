import type { NextPage } from "next";
import { MyProfileView } from "../../../views";
import { useRouter } from "next/router";
import { PublicKey } from "@metaplex-foundation/js";

const MyProfile: NextPage = () => {
    const router = useRouter();
    const {address} = router.query;

    return (
        <div>
            <MyProfileView mint={new PublicKey(address)}/>
        </div>
    );
};

MyProfile.getInitialProps = async ({query}) => {
    const {address} = query;

    if (!address) throw {error: "No Mint"};

    try {
        const mintPubKey = new PublicKey(address);
        return {mint: mintPubKey};
    } catch {
        throw {error: "invalid Mint"};
    }
}


export default MyProfile;
