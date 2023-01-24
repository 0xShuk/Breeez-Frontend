import type { NextPage } from "next";
import Head from "next/head";

const Roadmap: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Breeez - Utility Suite for NFT Communities</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <div className="md:hero p-4 mx-auto text-center	">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Roadmap
        </h1>
        <div className="mt-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
            Achieved
          </h2>
          <ol className="mx-auto">
            <li>Profile: Add profiles for the holders.</li>
            <li>Trade: Two-way P2P trade among holders.</li>
            <li>NFT-focued voting and proposal system.</li>
            <li>Staking with Token creation and reward setup</li>
          </ol>
        </div>
        <div className="mt-2">
          <h2 className="mb-4 text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
            In Progress
          </h2>
          <ol className="mx-auto">
            <li>Communities - Let holders create sub-DAOs/sub-communities/factions.</li>
            <li>Derivates - Let holders sell derivatives or fan art within communities for SOL/Tokens.</li>
            <li>Auction House - Let holders auction any SPL asset.</li>
            <li>Increasing the number of assets in trade from 4 to 16.</li>
            <li>Attaching metadata to the collection token.</li>
          </ol>
        </div>
        <div className="mt-2">
          <h2 className="mb-4 text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
            Future
          </h2>
          <ol className="mx-auto">
            <li>Add council either by manual selection or host elections.</li>
            <li>Host giveaways and on-chain airdrops.</li>
            <li>Cross-Communities Social Media platform.</li>
          </ol>
        </div>        
      </div>
      </div>
    </div>
  );
};

export default Roadmap;
