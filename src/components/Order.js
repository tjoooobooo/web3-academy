import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeBuyOrder, makeSellOrder } from "../store/interactions";

const Order = () => {
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [isBuy, setIsBuy] = useState(true);

  const provider = useSelector((state) => state.provider.connection);
  const exchange = useSelector((state) => state.exchange.contract);
  const tokenContracts = useSelector((state) => state.tokens.contracts);

  const dispatch = useDispatch();

  const buyHandler = (e) => {
    e.preventDefault();
    resetInput();
    makeBuyOrder(
      provider,
      exchange,
      tokenContracts,
      { amount, price },
      dispatch
    );
  };

  const sellHandler = (e) => {
    e.preventDefault();
    resetInput();
    makeSellOrder(
      provider,
      exchange,
      tokenContracts,
      { amount, price },
      dispatch
    );
  };

  const resetInput = () => {
    setAmount(0);
    setPrice(0);
  };

  const buyRef = useRef(null);
  const sellRef = useRef(null);

  const tabHandler = (e) => {
    if (e.target.className !== buyRef.current.className) {
      e.target.className = "tab tab--active";
      buyRef.current.className = "tab";
      setIsBuy(false);
    } else {
      e.target.className = "tab tab--active";
      sellRef.current.className = "tab";
      setIsBuy(true);
    }
  };

  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button onClick={tabHandler} ref={buyRef} className="tab tab--active">
            Buy
          </button>
          <button onClick={tabHandler} ref={sellRef} className="tab">
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        <label htmlFor="amount">{isBuy ? "Buy Amount" : "Sell Amount"}</label>
        <input
          type="number"
          id="amount"
          placeholder="0.0000"
          value={amount === 0 ? "" : amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label htmlFor="price">{isBuy ? "Buy Price" : "Sell Price"}</label>
        <input
          type="number"
          id="price"
          placeholder="0.0000"
          value={price === 0 ? "" : price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button className="button button--filled" type="submit">
          <span>{isBuy ? "Place buy order" : "Place sell order"}</span>
        </button>
      </form>
    </div>
  );
};

export default Order;
