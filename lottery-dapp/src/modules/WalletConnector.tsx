import WalletConnect from '../assets/WalletConnect.svg';
import {MetamaskButton} from './components/MetamaskButton';

export const WalletConnector = () => {
  const onClickWalletConnect = () => {
    alert('Under Development');
  }

  return (
    <div className='py-5 min-height-70 flex justify-center items-center flex-col'>
      <div className='text-xl font-medium text-center py-2'>Sign in to your wallet.</div>
      <div className='flex justify-center mt-5 flex-col md:flex-row'>
        <div className='w-80 border rounded-md m-2 flex items-center justify-center py-4 flex-col cursor-pointer' onClick={onClickWalletConnect}>
          <img src={WalletConnect} className="w-28" />
          <div className='text-md mt-2'>Connect With WalletConnect</div>
        </div>
        <MetamaskButton />
      </div>
    </div>
  )
}