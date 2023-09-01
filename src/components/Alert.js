import {useSelector} from "react-redux";
import {useEffect, useRef} from "react";
import {myEventsSelector} from "../store/selectors";
import config from "./../config.json";

const Alert = () => {
    const alertRef = useRef(null);
    const network = useSelector(state => state.provider.chainId);
    const isPending = useSelector(state => state.exchange.transaction.isPending);
    const isError = useSelector(state => state.exchange.transaction.isError);
    const account = useSelector(state => state.provider.account);
    const events = useSelector(myEventsSelector);

    const removeHandler = async (e) => {
        alertRef.current.className = "alert--remove";
    }

    useEffect(() => {
        if ((events[0] || isPending || isError) && account) {
            alertRef.current.className = "alert";
        }
    }, [isPending, isError, account, events]);

    return (
        <div>
            {isPending ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction pending...</h1>
                </div>
            ) : isError ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction failed</h1>
                </div>
            ) : events[0] ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction successful</h1>
                    <a
                        href={config[network] ? `${config[network].explorerUrl}/tx/${events[0].transactionHash}` : "#"}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {events[0].transactionHash.slice(0, 6) + "..." + events[0].transactionHash.slice(60, 66)}
                    </a>
                </div>
            ) : (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
            )}
        </div>
    )
}

export default Alert
