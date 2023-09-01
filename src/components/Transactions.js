import {useDispatch, useSelector} from "react-redux";
import {myFilledOrdersSelector, myOpenOrdersSelector} from "../store/selectors";
import {useRef, useState} from "react";
import Banner from "./Banner";
import {cancelOrder} from "../store/interactions";

const Transactions = () => {
    const [isOrder, setIsOrder] = useState(true);
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const myFilledOrders = useSelector(myFilledOrdersSelector);
    const symbols = useSelector((state) => state.tokens.symbols);

    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const dispatch = useDispatch();

    const orderRef = useRef(null);
    const tradeRef = useRef(null);

    const tabHandler = (e) => {
        if (e.target.className !== orderRef.current.className) {
            e.target.className = "tab tab--active";
            orderRef.current.className = "tab";
            setIsOrder(false);
        } else {
            e.target.className = "tab tab--active";
            tradeRef.current.className = "tab";
            setIsOrder(true);
        }
    }

    const cancelHandler = (order) => {
        cancelOrder(provider, exchange, order, dispatch);
    }

    return (
        <div className="component exchange__transactions">
            {isOrder ? (
                <div>
                    <div className="component__header flex-between">
                        <h2>My Orders</h2>

                        <div className="tabs">
                            <button onClick={tabHandler} ref={orderRef} className="tab tab--active">Orders</button>
                            <button onClick={tabHandler} ref={tradeRef} className="tab">Trades</button>
                        </div>
                    </div>

                    {!myOpenOrders || myOpenOrders.length === 0 ? (
                        <Banner text="No open orders"/>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>{symbols && symbols[0]}</th>
                                <th>{symbols && symbols[1]}/{symbols && symbols[0]}</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {myOpenOrders && myOpenOrders.map((order, index) => {
                                return (
                                    <tr key={index}>
                                        <td style={{color: `${order._orderTypeClass}`}}>{order._token0Amount}</td>
                                        <td>{order._tokenPrice}</td>
                                        <td><button onClick={() => cancelHandler(order)} className="button--sm">Cancel</button></td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    )}

                </div>
            ) : (
                <div>
                    <div className="component__header flex-between">
                        <h2>My Transactions</h2>

                        <div className="tabs">
                            <button onClick={tabHandler} ref={orderRef} className="tab tab--active">Orders</button>
                            <button onClick={tabHandler} ref={tradeRef} className="tab">Trades</button>
                        </div>
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>Time</th>
                            <th>{symbols && symbols[0]}</th>
                            <th>{symbols && symbols[1]}/{symbols && symbols[0]}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {myFilledOrders && myFilledOrders.map((order, index) => {
                            return (
                                <tr key={index}>
                                    <td>{order._formattedTimestamp}</td>
                                    <td style={{color: `${order._orderTypeClass}`}}>{order._orderSign}{order._token0Amount}</td>
                                    <td>{order._tokenPrice}</td>
                                </tr>
                            )
                        })
                        }
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    )
}


export default Transactions;
