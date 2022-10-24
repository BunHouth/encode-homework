import { useEffect, useRef, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { Contract, utils } from 'ethers';
import { WalletHeader } from './components/WalletHeader';
import ABI from '../abi/Lottery.json';
import ERC20 from '../abi/ERC20.json';

const contractAddress = process.env.REACT_APP_PUBLIC_LOTTERY_SYSTEM;
const tokenContractAddress = process.env.REACT_APP_PUBLIC_LOTTERY_TOKEN;

export const LotterySystem = () => {
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('inactive');
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<string | null>(null);
  const contractRef: any = useRef(null);
  const tokenContractRef: any = useRef(null);
  const { connector } = useWeb3React()

  const contractConnector = async () => {
    if(!contractAddress) return;
    if(!tokenContractAddress) return;
    const web3Provider = new Web3Provider(connector.provider as any);
    contractRef.current = new Contract(contractAddress, ABI, web3Provider.getSigner());
    tokenContractRef.current = new Contract(tokenContractAddress, ERC20, web3Provider.getSigner());
    const isBetOpen = await contractRef.current.isBetOpen();
    setStatus(isBetOpen ? 'active' : 'inactive');
  }

  const onClickOpen = async () => {
    const isBetOpen = await contractRef.current.isBetOpen();
    if(!isBetOpen) {
      const closedAt = Math.floor(Date.now() / 1000) + 60 * 10;
      try {
        setState('opening');
        setIsLoading(true)
        const tx = await contractRef.current.openBets(closedAt);
        await tx.wait()
        setState(null);
      } catch(err: any) {
        setState(null);
        setIsLoading(false)
        if(err.code !== 4001)
          alert(err.reason);
      }
    }
  }

  const onClickClose = async () => {
    const isBetOpen = await contractRef.current.isBetOpen();
    setIsLoading(true)
    if(!isBetOpen) {
      alert('Bet currently is unavailable!');
      setIsLoading(false)
      return;
    };
    try {
      const tx = await contractRef.current.closeLottery();
      await tx.wait();
      setState(null);
    } catch(err: any) {
      setState(null);
      setIsLoading(false)
      if(err.code !== 4001)
        alert(err.reason);
    }
  }

  const onClickBet = async () => {
    if(Number(amount) < 10) {
      alert('Minimum bet amount is 10');
      return;
    }

    try {
      const betAmount = utils.parseUnits(String(amount), 18);
      const fee = await contractRef.current.fee();
      await (await tokenContractRef.current.approve(contractAddress, betAmount.add(fee))).wait()
      const tx = await contractRef.current.bet(betAmount);
      await tx.wait();
      setAmount('');
      alert('Bet success!');
    } catch(err: any) {
      setState(null);
      setIsLoading(false)
      if(err.code !== 4001)
        alert(err.reason);
    }
  }

  const onClickPurchase = async () => {
    try {
      if(Number(purchaseAmount) <= 0) return;
      console.log(purchaseAmount)
      const purchase = utils.parseEther(String(purchaseAmount));
      const tx = await contractRef.current.buyTokens({value: purchase});
      await tx.wait();
    } catch(err: any) {
      if(err.code !== 4001)
        alert(err.reason);
    }
  }

  const onClickClaim = async () => {
    try {
      const tx = await contractRef.current.claimPrize();
      await tx.wait();
    } catch(err: any) {
      if(err.code !== 4001)
        alert(err.reason)
    }
  }

  useEffect(() => {
    contractConnector();
  }, [connector]);

  return (
    <div className='py-4'>
      <WalletHeader />
      <div className='text-xl font-medium text-center'>Lottery Status : <span className='capitalize text-cyan-600'>{status}</span></div>
      <div className='flex flex-col md:flex-row my-5'>
        <div className='w-full md:w-4/12'>
          <div className='m-2 p-2 border rounded-md'>
            <div className='text-center text-xl'>Management</div>
            <div className='py-2 mt-3 flex justify-center flex-col'>
              <div className='my-2'>
                <div className='text-xs mb-1 text-red-700 text-center'>Bet Open Duration Setting is 10 minutes</div>
                <button className='btn w-full' onClick={onClickOpen} disabled={isLoading}>{ state == 'opening' ? 'Opening Bet ...' : 'Open Lottery Betting'}</button>
              </div>
              <div className='my-2'>
                <button className='btn w-full' onClick={onClickClose} disabled={isLoading}>{ state == 'closing' ? 'Closing Bet ...' : 'Close Lottery'}</button>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full md:w-4/12'>
          <div className='m-2 p-2 border rounded-md'>
            <div className='text-center text-xl'>Player</div>
            <div className='py-2 mt-3 flex justify-center flex-col'>
              <div className='flex items-center justify-center flex-col mb-3'>
                <input type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} className='py-2 px-4 border w-full rounded-full' placeholder="Purchase Amount(Ether Value)" />
                <button className='btn mt-1' onClick={onClickPurchase}>Purchase(ETH value)</button>
              </div>
              <div className='flex items-center justify-center'>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className='py-2 px-4 border rounded-full' placeholder="Bet Amount" />
                <button className='btn ml-1' onClick={onClickBet}>Bet</button>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full md:w-4/12'>
          <div className='m-2 p-2 border rounded-md'>
            <div className='text-center text-xl'>Result</div>
            <div className='py-2 mt-3 flex justify-center flex-col'>
              <button className='btn' onClick={onClickClaim}>ClaimPrize</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}