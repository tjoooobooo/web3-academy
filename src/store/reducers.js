export const provider = (state = {}, action) => {
    switch (action.type) {
        case "PROVIDER_LOADED":
            return {
                ...state,
                connection: action.connection
            }
        case "NETWORK_LOADED":
            return {
                ...state,
                chainId: action.chainId
            }
        case "ACCOUNT_LOADED":
            return {
                ...state,
                account: action.account
            }
        default:
            return state;
    }
}

const DEFAULT_TOKEN_STATE = {
    loaded: false,
    contracts: [],
    symbols: []
}

export const tokens = (state = DEFAULT_TOKEN_STATE, action) => {
    switch (action.type) {
        case "TOKEN_1_LOADED":
        case "TOKEN_2_LOADED":
        case "TOKEN_3_LOADED":
            return {
                ...state,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol],
                loaded: true
            }
        default:
            return state;
    }
}