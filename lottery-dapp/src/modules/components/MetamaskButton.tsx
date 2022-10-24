  import { hooks, metaMask as connector } from '../../connectors/metamask';
import MetaMask from '../../assets/MetaMask.svg';

export const MetamaskButton = () => {
  const { useIsActivating } = hooks
  const isActivating = useIsActivating()

  const onClickMetamask = () => {
    if(isActivating) return;
    connector.activate(5).catch((error) => {
      if(error.code !== 4001) {
        alert(error.message);
      }
    })
  }
  return (
    <div className='w-80 border rounded-md m-2 flex items-center justify-center py-4 flex-col cursor-pointer' onClick={onClickMetamask}>
      <img src={MetaMask} className="w-32" />
      <div className='text-md mt-2'>Connect With Metamask</div>
    </div>
  )
}