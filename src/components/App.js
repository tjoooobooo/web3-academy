import { useEffect } from "react";
// import EXCHANGE_ABI from "../abis/Exchange.json";
import config from "../config.json";
import {useDispatch} from "react-redux";
import {
    loadAccount,
    loadExchange,
    loadNetwork,
    loadProvider,
    loadTokens,
    subscribeToEvents
} from "../store/interactions";

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";

function App() {

    const dispatch = useDispatch();
    const loadBlockchainData = async () => {
        const provider = loadProvider(dispatch);
        const chainId = await loadNetwork(provider, dispatch);

        window.ethereum.on('chainChanged', async () => {
            window.location.reload();
        });

        window.ethereum.on('accountsChanges', async() => {
            await loadAccount(provider, dispatch);
        });

        await loadAccount(provider, dispatch);

        // Token smart contract
        await loadTokens(
            provider,
            [
                config[chainId].MT.address,
                config[chainId].mETH.address,
                config[chainId].mDAI.address,
            ],
            dispatch
        );

        const exchangeAddr = config[chainId].exchange.address;
        const exchange = await loadExchange(provider, exchangeAddr, dispatch);
        await subscribeToEvents(exchange, dispatch);
    };

    useEffect(() => {
        loadBlockchainData();
    });

    return (
        <div className="App">
            <div>
                <Navbar/>
                <main className="exchange grid">
                    <section className="exchange__section--left grid">

                        <Markets/>

                        <Balance/>

                        {/* Order */}
                    </section>
                    <section className="exchange__section--right grid">
                        {/* PriceChart */}

                        {/* Transactions */}

                        {/* Trades */}

                        {/* OrderBook */}
                    </section>
                </main>

                {/* Alert */}
            </div>
        </div>
    );
}

export default App;
