import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect';

const RPC_URL = process.env.REACT_APP_PUBLIC_RPC_URL || '';
export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: {
          5: RPC_URL
        },
      },
    })
)