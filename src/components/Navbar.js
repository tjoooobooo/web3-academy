import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";
import {useDispatch, useSelector} from "react-redux";
import {loadAccount} from "../store/interactions";
import Blockies from "react-blockies";
import config from "../config.json";

const Navbar = () => {

    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const account = useSelector(state => state.provider.account);
    const balance = useSelector(state => state.provider.balance);

    const dispatch = useDispatch();

    const connectHandler = async () => {
        await loadAccount(provider, dispatch);
    }

    const networkHandler = async (event) => {
        await window.ethereum.request({
           method: "wallet_switchEthereumChain",
            params: [{
               chainId: event.target.value
            }]
        });
    }

    const accountString = account ? account.slice(0,5) + "..." + account.slice(38, 42) : "No account loaded";
    const balanceString = balance ? Number(balance).toFixed(4) : "0";

    return(
        <div className="exchange__header grid">
            <div className="exchange__header--brand flex">
                <img src={logo} alt="" className="logo"/>
                <h1>My amazing Token Exchange</h1>
            </div>

            <div className="exchange__header--networks flex">
                <img src={eth} alt="eth logo" className="Eth Logo"/>
                { chainId && (
                    <select name="networks" id="networks" value={config[chainId] ? `0x${chainId.toString(16)}` : "0"} onChange={networkHandler}>
                        <option value="0" disabled>Select Network</option>
                        <option value="0x7A69">Hardhat</option>
                        <option value="0xAA36A7">Sepolia</option>
                        <option value="0x5">Goerli</option>
                    </select>
                )}
            </div>

            <div className="exchange__header--account flex">
                <p><small>My Balance </small> {balanceString}</p>
                {
                    account ? (
                        <a href={config[chainId]["explorerUrl"] ? `${config[chainId]["explorerUrl"]}address/${account}` : "#"}
                           target="_blank"
                           rel="noreferrer"
                        >{accountString}
                        <Blockies
                            seed={account}
                            size={13}
                            scale={3}
                            color="#2187D0"
                            bgColor="#F1F2F9"
                            spotColor="#767F92"
                            className="identifier"
                        />
                        </a>
                    ) : (
                        <button className="button" onClick={connectHandler}>Connect</button>
                    )
                }
            </div>
        </div>
    )
}

export default Navbar
