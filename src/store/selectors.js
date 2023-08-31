import {ethers} from "ethers";
import {get, groupBy, maxBy, minBy, reject} from "lodash";
import moment from "moment";
import {createSelector} from "reselect";

const tokens = (state) => get(state, "tokens.contracts");
const allOrders = (state) => get(state, "exchange.allOrders.data", []);
const cancelledOrders = (state) => get(state, "exchange.cancelledOrders.data", []);
const filledOrders = (state) => get(state, "exchange.filledOrders.data", []);

const openOrders = state => {
    const all = allOrders(state);
    const filled = filledOrders(state);
    const cancelled = cancelledOrders(state);

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o._id.toString() === order._id.toString());
        const orderCancelled = cancelled.some((o) => o._id.toString() === order._id.toString());
        return orderFilled || orderCancelled;
    })

    return openOrders;
}

export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) {
            return;
        }

        // Filter orders by selected tokens
        orders = orders.filter(
            (o) =>
                o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address
        );
        orders = orders.filter(
            (o) =>
                o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address
        );

        // Decorate orders
        orders = decorateOrderBookOrders(orders, tokens);

        // Group orders by order type
        orders = groupBy(orders, "_orderType");

        const buyOrders = get(orders, "buy", []);

        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b._tokenPrice - a._tokenPrice)
        }

        const sellOrders = get(orders, "sell", []);

        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a, b) => b._tokenPrice - a._tokenPrice)
        }

        return orders;
    }
);

const GREEN = "#25CE8F";
const RED = "#F45353";

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount;

    if (order._tokenGive === tokens[0].address) {
        token0Amount = order._amountGive;
        token1Amount = order._amountGet;
    } else {
        token0Amount = order._amountGet;
        token1Amount = order._amountGive;
    }

    const precision = 100000;
    let tokenPrice = token1Amount / token0Amount;
    tokenPrice = Math.round(tokenPrice * precision) / precision;

    return {
        ...order,
        _token0Amount: ethers.utils.formatUnits(token0Amount, 18),
        _token1Amount: ethers.utils.formatUnits(token1Amount, 18),
        _tokenPrice: tokenPrice,
        _formattedTimestamp: moment.unix(order._timestamp).format(),
    };
};

const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return order
        })
    )
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order._tokenGive === tokens[1].address ? "buy" : "sell";

    return ({
        ...order,
        _orderType: orderType,
        _orderTypeClass: orderType === "buy" ? GREEN : RED,
        _orderFillAction: orderType === "buy" ? "sell" : "buy"
    });
}

export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) {
            return;
        }

        // Filter orders by selected tokens
        // Filter orders by selected tokens
        orders = orders.filter(
            (o) =>
                o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address
        );
        orders = orders.filter(
            (o) =>
                o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address
        );

        // Sort orders by date ascending
        orders = orders.sort((a, b) => a._timestamp - b._timestamp);

        // Decorate orders
        orders = orders.map((o) => decorateOrder(o, tokens));

        if (orders.length < 2) {
            return ({
                series: [{
                    data: []
                }],
            });
        }

        // Get last two orders for final price & price change
        let secondLastOrder, lastOrder;
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);

        const lastPrice = lastOrder._tokenPrice;
        const secondLastPrice = secondLastOrder._tokenPrice;

        return ({
            lastPrice,
            lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
            series: [{
                data: buildGraphData(orders)
            }],
        });
    });

const buildGraphData = (orders) => {
    // Group by timestamp
    orders = groupBy(orders, (o) => moment.unix(o._timestamp).startOf("hour"));

    const hours = Object.keys(orders);

    const graphData = hours.map((hour) => {
        // Fetch all orders
        const group = orders[hour];

        // Calculate price values
        const open = group[0];
        const high = maxBy(group, "_tokenPrice");
        const low = minBy(group, "_tokenPrice");
        const close = group[group.length - 1];

        return {
            x: new Date(hour),
            y: [open._tokenPrice, high._tokenPrice, low._tokenPrice, close._tokenPrice]
        }
    });

    return graphData;
}

