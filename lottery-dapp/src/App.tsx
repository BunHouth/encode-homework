import { Web3ReactProvider, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'
import { hooks as metaMaskHooks, metaMask } from './connectors/metamask';
import { hooks as walletConnectHooks, walletConnect } from './connectors/walletConnect'
import { LotteryDapp } from './LotteryDapp';

const connectors: [MetaMask | WalletConnect, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
]

const App = () => {
  return (
    <Web3ReactProvider connectors={connectors}>
      <LotteryDapp />
    </Web3ReactProvider>
  );
}

export default App;
