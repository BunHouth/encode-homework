import { useWeb3React } from '@web3-react/core'
import { Layout } from './layouts/Layout';
import { WalletConnector } from './modules/WalletConnector';
import { LotterySystem } from './modules/LotterySystem';

export const LotteryDapp = () => {
  const { connector, isActive } = useWeb3React()

  return (
    <Layout>
      {isActive ? <LotterySystem /> : <WalletConnector />}
    </Layout>
  );
}
