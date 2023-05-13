import logo from "../assets/logo.png";
import {useSelector} from "react-redux";

const Navbar = () => {

    const account = useSelector(state => state.provider.account);
    const balance = useSelector(state => state.provider.balance);

    const accountString = account ? account.slice(0,5) + "..." + account.slice(38, 42) : "No account loaded";
    const balanceString = balance ? Number(balance).toFixed(4) : "";

    return(
        <div className="exchange__header grid">
            <div className="exchange__header--brand flex">
                <img src={logo} alt="" className="logo"/>
                <h1>My amazing Token Exchange</h1>
            </div>

            <div className="exchange__header--networks flex">

            </div>

            <div className="exchange__header--account flex">
                <p><small>My Balance </small> {balanceString}</p>
                <a href="">{accountString}</a>
            </div>
        </div>
    )
}

export default Navbar
