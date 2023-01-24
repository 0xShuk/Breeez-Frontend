import type { NextPage } from "next";
import { ProfileView } from "../../../../views";
import { useRouter } from "next/router";
import { PublicKey } from "@metaplex-foundation/js";

const Profile: NextPage = () => {
    const router = useRouter();
    const {username, address} = router.query;

    return (
        <div>
            <ProfileView mint={new PublicKey(address)} username={username.toString()}/>
        </div>
    );
};

Profile.getInitialProps = async ({query}) => {
    const {address} = query;

    if (!address) throw {error: "No Metadata"};

    try {
        const mintPubKey = new PublicKey(address);
        return {mint: mintPubKey};
    } catch {
        throw {error: "invalid metadata"};
    }
}


export default Profile;
