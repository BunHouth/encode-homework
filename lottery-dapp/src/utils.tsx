import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'
import type { Connector } from '@web3-react/types';

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  return 'Unknown'
}

export const truncateMiddle = (str: string = '', lenght: number = 0): string => {
  if (str.length <= lenght) return str;
  const separator = '......';
  const sepLength = separator.length;
  const charsToShow = lenght - sepLength;
  const frontChars = Math.ceil(charsToShow/2);
  const backChars = Math.floor(charsToShow/2);

  return str.substr(0, frontChars) + separator + str.substr(str.length - backChars);
}