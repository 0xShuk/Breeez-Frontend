import { FC } from "react";
import { useWallet } from '@solana/wallet-adapter-react';

import { UserConnected } from '../../components/UserConnected';
import { UserDisconnected } from '../../components/UserDisconnected';

export const HomeView: FC = ({ }) => {
  const {connected} = useWallet();

  return (
      <div>
        {connected ? <UserConnected/> : <UserDisconnected/>}
      </div>
  );
};
