export const provider = (state = {}, action) => {
    switch (action.type) {
        case "PROVIDER_LOADED":
            return {
                ...state,
                connection: action.connection,
            };
        case "NETWORK_LOADED":
            return {
                ...state,
                chainId: action.chainId,
            };
        case "ACCOUNT_LOADED":
            return {
                ...state,
                account: action.account,
            };
        case "ETHER_BALANCE_LOADED":
            return {
                ...state,
                balance: action.balance,
            };
        default:
            return state;
    }
};

const DEFAULT_TOKEN_STATE = {
    loaded: false,
    contracts: [],
    symbols: [],
};

export const tokens = (state = DEFAULT_TOKEN_STATE, action) => {
    switch (action.type) {
        case "TOKEN_1_LOADED":
            return {
                ...state,
                contracts: [action.token],
                symbols: [action.symbol],
                loaded: true,
            };
        case "TOKEN_1_BALANCE_LOADED":
            return {
                ...state,
                balances: [action.balance],
            };
        case "TOKEN_2_LOADED":
            return {
                ...state,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol],
                loaded: true,
            };
        case "TOKEN_2_BALANCE_LOADED":
            return {
                ...state,
                balances: [...state.balances, action.balance],
            };
        default:
            return state;
    }
};

const DEFAULT_EXCHANGE_STATE = {
    loaded: false,
    contract: undefined,
    transactions: {
        isSuccessful: false,
    },
    cancelledOrders: {
        loaded: false,
        data: [],
    },
    filledOrders: {
        loaded: false,
        data: [],
    },
    allOrders: {
        loaded: false,
        data: [],
    },
    events: [],
};

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
    let index, data;

    switch (action.type) {
        case "EXCHANGE_LOADED":
            return {
                ...state,
                loaded: true,
                contract: action.exchange,
            };
        case "CANCELLED_ORDERS_LOADED":
            return {
                ...state,
                cancelledOrders: {
                    loaded: true,
                    data: action.cancelledOrders,
                },
            };
        case "FILLED_ORDERS_LOADED":
            return {
                ...state,
                filledOrders: {
                    loaded: true,
                    data: action.filledOrders,
                },
            };
        case "ALL_ORDERS_LOADED":
            return {
                ...state,
                allOrders: {
                    loaded: true,
                    data: action.allOrders,
                },
            };
        case "EXCHANGE_TOKEN_1_BALANCE_LOADED":
            return {
                ...state,
                balances: [action.balance],
            };
        case "EXCHANGE_TOKEN_2_BALANCE_LOADED":
            return {
                ...state,
                balances: [...state.balances, action.balance],
            };
        case "TRANSFER_REQUEST":
            return {
                ...state,
                transactions: {
                    transactionType: "Transfer",
                    isPending: true,
                    isSuccessful: false,
                },
                transferInProgress: true,
            };
        case "TRANSFER_SUCCESS":
            return {
                ...state,
                transactions: {
                    transactionType: "Transfer",
                    isPending: false,
                    isSuccessful: true,
                },
                transferInProgress: false,
                events: [action.events, ...state.events],
            };
        case "TRANSFER_FAIL":
            return {
                ...state,
                transactions: {
                    transactionType: "Transfer",
                    isPending: false,
                    isSuccessful: false,
                    isError: true,
                },
                transferInProgress: false,
            };
        case "NEW_ORDER_REQUEST":
            return {
                ...state,
                transactions: {
                    transactionType: "New Order",
                    isPending: true,
                    isSuccessful: false,
                },
            };
        case "NEW_ORDER_FAIL":
            return {
                ...state,
                transactions: {
                    transactionType: "New Order",
                    isPending: false,
                    isSuccessful: false,
                    isError: true,
                },
            };
        case "NEW_ORDER_SUCCESS":
            index = state.allOrders.data.findIndex(
                (order) => order._id.toString === action.order._id.toString()
            );

            if (index === -1) {
                data = [...state.allOrders.data, action.order];
            } else {
                data = state.allOrders.data;
            }

            return {
                ...state,
                allOrders: {
                    ...state.allOrders,
                    data: data,
                },
                transactions: {
                    transactionType: "New Order",
                    isPending: false,
                    isSuccessful: true,
                },
                events: [action.events, ...state.events],
            };
        default:
            return state;
    }
};
