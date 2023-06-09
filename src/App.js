import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState, useRef } from 'react';
import Nav from './components/Nav';
// import Block from '../src/mocks/block.json';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [currentBlockTransactions, setCurrentBlockTransactions] = useState()
  const [estimateGas, setEstimateGas] = useState()
  const [feeData, setFeeData] = useState()
  const [dateTransact, setDateTransact] = useState("")
  const [dateEstGas, setDateEstGas] = useState("")
  const [address, setAddress] = useState("")
  const [tokenBalances, setTokenBalances] = useState()
  const [finalBalance, setFinalBalance] = useState()
  const inputAddressRef = useRef(null)
  const gasCalc = (((parseInt(currentBlockTransactions?.gasUsed._hex) / 15000000) - 1) * 100).toFixed(0);

  const handleClick = async () => {
    const block = await alchemy.core.getBlockNumber()
    setCurrentBlockTransactions(await alchemy.core.getBlockWithTransactions(block))
    setDateTransact(new Date())
  }

  const runEstimateGas = async () => {
    const response = await alchemy.core.getGasPrice()
    setEstimateGas(response);
    const feeData = await alchemy.core.getFeeData()
    setFeeData(feeData)
    setDateEstGas(new Date())
  }

  const getTokenBalances = async () => {
    const balances = await alchemy.core.getTokenBalances(address);
    setTokenBalances(balances)
    // logic to filter balances
    if (tokenBalances) {
      const arrayOfBalances = []
      const nonZeroBalances = tokenBalances.tokenBalances.filter((token) => {
          return token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
      }) 
      for (let token of nonZeroBalances) {
        let balance = token.tokenBalance;
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        balance = balance / Math.pow(10, metadata.decimals)
        balance = balance.toFixed(2);
        console.log(`${metadata.name} : ${balance} ${metadata.symbol}`)
        arrayOfBalances.push(
          `${metadata.name} : ${balance} ${metadata.symbol}`
        )
      }
      setFinalBalance(arrayOfBalances)
      console.log(finalBalance)
    }
  }

  return (
    <>
      <Nav />
      <div className="grid grid-cols-2">
        <div className="flex flex-col mx-10 space-y-2">
          <button className='bg-black text-white' type='submit' onClick={handleClick}>New Block</button>
          {
            currentBlockTransactions && dateTransact
            ?
            <>
                <h2>Block Info</h2>
                <p>Block Number: {currentBlockTransactions.number}</p>
                <p>Hash: {currentBlockTransactions.hash}</p>
                <p>Timestamp: {currentBlockTransactions.timestamp}</p>
                <p>Gas limit: {parseInt(currentBlockTransactions.gasLimit._hex)}</p>
                <p>Gas used: {parseInt(currentBlockTransactions.gasUsed._hex)}</p>
                <p>Gas target: 15000000</p>
                <p>Gas tendency: {`${gasCalc}%`}</p>
                {
                  gasCalc > 0 
                  ? <p className="text-bold">Gas price will increase next block</p>
                  : <p className="text-bold">Gas price will decrease next block</p>
                }
                <p>Number of transactions: {currentBlockTransactions.transactions.length}</p>
                <p>Data from: {dateTransact.toString()}</p>
              </>
              : null
          }
        </div>
        <div className="flex flex-col mx-10 space-y-2">
          <button className='bg-black text-white' type='submit' onClick={runEstimateGas}>Estimate Gas</button>
          {
            estimateGas && feeData && dateEstGas
            ? 
              <>
               <p>Estimate gas for a transaction:</p>
                <p>Gas Price:</p>
                <p>Wei: {(parseInt(estimateGas._hex))}</p>
                <p>Gwei: {Utils.formatUnits((parseInt(estimateGas._hex)), 'gwei')}</p>
                <p>Ether: {Utils.formatUnits((parseInt(estimateGas._hex)), 'ether')}</p>
                <p>Fee data:</p>
                <p>Max fee per gas in gwei: {Utils.formatUnits((parseInt(feeData.maxFeePerGas._hex)), 'gwei')}</p>
                <p>Max priority fee in gwei: {Utils.formatUnits((parseInt(feeData.maxPriorityFeePerGas._hex)), 'gwei')}</p>
                <p>Data from: {dateEstGas.toString()}</p>
              </>

            : null
          }
        </div>
      </div>
      <div className="flex flex-col m-10 space-y-2">
        <p>Token balances by address</p>
        <label>Enter your Eth address</label>
        <input ref={inputAddressRef} className="border-2 border-black" type="text" value={address} onChange={((e) => setAddress(e.target.value))} />
        <button className='bg-black text-white w-25' type="submit" onClick={getTokenBalances}>Get token balances</button>
        {
          finalBalance
          ? 
            <div className="flex flex-col justify-center text-center">
              {
                finalBalance.map(item => {
                  return (
                    <p>{item.toString()}</p>
                  )
                })
              }
            </div>
          : null
        }
      </div>
    </>
  )
}

export default App;

          