import React from 'react';
import { useWeb3React } from '@web3-react/core'
import {truncateMiddle} from '../../utils';

export const WalletHeader = () => {
  const {account, connector} = useWeb3React();
  const onClickDisconnect = () => {
    connector.resetState()
  }

  return (
    <div className='flex items-end justify-end'>
      <div className='border rounded-full overflow-hidden flex'>
        <div className='border-r py-1 px-3 bg-red-400 text-white cursor-pointer' onClick={onClickDisconnect}>
          Disconnect
        </div>
        <div className='py-1 px-3'>
          {truncateMiddle(account, 18)}
        </div>
      </div>
    </div>
  )
}