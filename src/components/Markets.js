import config from "../config.json";
import {useDispatch, useSelector} from "react-redux";
import {loadTokens} from "../store/interactions";

const Markets = () => {

    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const dispatch = useDispatch();

    const mtAddr = config[chainId] ? config[chainId]["MT"]["address"] : '';
    const mETHAddr = config[chainId] ? config[chainId]["mETH"]["address"] : '';
    const mDAI = config[chainId] ? config[chainId]["mDAI"]["address"] : '';

    const marketHandler = async (event) => {
        const val = event.target.value;
        loadTokens(provider, val.split(","), dispatch);
    }

    return(
        <div className="component exchange__markets">
            <div className="component__header">
                <h2>Select Markets</h2>
            </div>
            { chainId && config[chainId] ? (
                <select name="markets" id="markets" onChange={marketHandler}>
                    <option value={`${mtAddr},${mETHAddr}`}>MT / mETH</option>
                    <option value={`${mtAddr},${mDAI}`}>MT / mDAI</option>
                    <option value={`${mETHAddr},${mDAI}`}>mETH / mDAI</option>
                </select>
            ) : (
                <p>Not deployed to network</p>
            )}
            <hr />
        </div>
    )
}

export default Markets
