import {ethers} from "ethers";
import TOKEN_ABI from "../abis/Token.json";

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({ type: "PROVIDER_LOADED", connection });
    return connection;
}

export const loadNetwork = async (provider, dispatch) => {
    const {chainId} = await provider.getNetwork();
    dispatch({type: "NETWORK_LOADED", chainId});
    return chainId;
}

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = ethers.utils.getAddress(accounts[0]);
    dispatch({ type: "ACCOUNT_LOADED", account });
    return account;
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol;

    for (let i = 0; i < addresses.length; i++) {
        token = new ethers.Contract(addresses[i], TOKEN_ABI, provider);
        symbol = await token.symbol();
        dispatch({type: "TOKEN_" + (i+1) + "_LOADED", token, symbol});
    }

    return token;
}
