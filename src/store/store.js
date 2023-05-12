import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import {exchange, provider, tokens} from "./reducers";

export const reducer = combineReducers({
    provider,
    tokens,
    exchange
});

const initialState = {};

const middleware = [thunk];

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

export default store;
