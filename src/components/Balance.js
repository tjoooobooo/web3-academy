import eth from "../assets/eth.svg";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useRef, useState} from "react";
import {loadBalances, transferTokens} from "../store/interactions";

const Balance = () => {
    const [isDeposit, setIsDeposit] = useState(true);
    const [token1TransferAmount, setToken1TransferAmount] = useState(0);
    const [token2TransferAmount, setToken2TransferAmount] = useState(0);

    const provider = useSelector(state => state.provider.connection);
    const symbols = useSelector(state => state.tokens.symbols);
    const exchange = useSelector(state => state.exchange.contract);
    const account = useSelector(state => state.provider.account);
    const tokenContracts = useSelector(state => state.tokens.contracts);
    const walletBalances = useSelector(state => state.tokens.balances);
    const exchangeBalances = useSelector(state => state.exchange.balances);

    const transferInProgress = useSelector(state => state.exchange.transactions);

    const dispatch = useDispatch();
    const depositRef = useRef(null);
    const withdrawRef = useRef(null);

    const tabHandler = (e) => {
        if (e.target.className !== depositRef.current.className) {
            e.target.className = "tab tab--active";
            depositRef.current.className = "tab";
            setIsDeposit(false);
        } else {
            e.target.className = "tab tab--active";
            withdrawRef.current.className = "tab";
            setIsDeposit(true);
        }
    }

    const amountHandler = (e, token) => {
        if (token.address === tokenContracts[0].address) {
            setToken1TransferAmount(e.target.value);
            // console.log("Token 1 transfer amount: " + e.target.value);
        } else if (token.address === tokenContracts[1].address) {
            // console.log("Token 2 transfer amount: " + e.target.value);
            setToken2TransferAmount(e.target.value);
        }
    }

    const depositHandler = (e, token) => {
        e.preventDefault();

        if (token.address === tokenContracts[0].address) {
            // transfer tokens
            transferTokens(
                provider,
                exchange,
                isDeposit ? "deposit" : "withdraw",
                token,
                token1TransferAmount,
                dispatch
            );
            setToken1TransferAmount(0);
        } else if (token.address === tokenContracts[1].address) {
            // transfer tokens
            transferTokens(
                provider,
                exchange,
                isDeposit ? "deposit" : "withdraw",
                token,
                token2TransferAmount,
                dispatch
            );
            setToken2TransferAmount(0);
        }
    }


    useEffect( () => {
        console.log("useEffect triggered");

        if (exchange && tokenContracts.length > 1 && !!account) {
            // console.log("loadBalance: ");
            // console.log(exchange);
            // console.log(tokenContracts);
            // console.log(account);
            // console.log("------------");
            loadBalances(exchange, tokenContracts, account, dispatch)
        }
    }, [exchange, account, tokenContracts, transferInProgress, dispatch]);

    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
                    <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
                </div>
            </div>

            {/* Deposit/Withdraw Component 1 (MT) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br/><img src={eth} alt="token1 logo"/>{symbols && symbols[0]}</p>
                    <p><small>Wallet</small><br/>{walletBalances && walletBalances[0]}</p>
                    <p><small>Exchange</small><br/>{exchangeBalances && exchangeBalances[0]}</p>
                </div>

                <form onSubmit={(e) => depositHandler(e, tokenContracts[0])}>
                    <label htmlFor='token0'>{symbols[0]} Amount</label>
                    <input
                        type='number'
                        id='token0'
                        placeholder='0.0000'
                        onChange={((e) => amountHandler(e, tokenContracts[0]))}
                        value={token1TransferAmount === 0 ? "" : token1TransferAmount}
                    />

                    <button className='button' type='submit'>
                        <span>{isDeposit ? "Deposit" : "Withdraw"}</span>
                    </button>
                </form>
            </div>

            <hr />

            {/* Deposit/Withdraw Component 2 (mETH) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br/><img src={eth} alt="token2 logo"/>{symbols && symbols[1]}</p>
                    <p><small>Wallet</small><br/>{walletBalances && walletBalances[1]}</p>
                    <p><small>Exchange</small><br/>{exchangeBalances && exchangeBalances[1]}</p>
                </div>

                <form onSubmit={(e) => depositHandler(e, tokenContracts[1])}>
                    <label htmlFor='token1'>{symbols[1]} Amount</label>
                    <input
                        type='number'
                        id='token1'
                        placeholder='0.0000'
                        onChange={((e) => amountHandler(e, tokenContracts[1]))}
                        value={token2TransferAmount === 0 ? "" : token2TransferAmount}
                    />

                    <button className='button' type='submit'>
                        <span>{isDeposit ? "Deposit" : "Withdraw"}</span>
                    </button>
                </form>
            </div>

            <hr />
        </div>
    )
}

export default Balance;
