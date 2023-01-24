import { FC } from "react";
import { useWallet } from '@solana/wallet-adapter-react';

import { AdminConnected } from '../../components/AdminConnected';
import { AdminDisconnected } from '../../components/AdminDisconnected';

export const AdminView: FC = ({ }) => {
  const {connected} = useWallet();

  return (
<div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Admin Panel
        </h1>
        {/* CONTENT GOES HERE */}
        <div className="text-center">
          {connected ? <AdminConnected/> : <AdminDisconnected/>}
        </div>
      </div>
    </div>
  );
};
