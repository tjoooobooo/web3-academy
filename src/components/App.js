import { useEffect } from "react";
// import EXCHANGE_ABI from "../abis/Exchange.json";
import config from "../config.json";
import {useDispatch} from "react-redux";
import {loadAccount, loadNetwork, loadProvider, loadTokens} from "../store/interactions";

function App() {

  const dispatch = useDispatch();
  const loadBlockchainData = async () => {
    await loadAccount(dispatch);

    const provider = loadProvider(dispatch);

    const chainId = await loadNetwork(provider, dispatch);

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

  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div className="App">
      <div>
        {/* Navbar */}
          <p>Test</p>

        <main className="exchange grid">
          <section className="exchange__section--left grid">
            {/* Markets */}

            {/* Balance */}

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
