//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0; 

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint8 public feePercent;
    uint public orderCount;

    struct _Order {
        uint id;
        address user;
        address tokenGet;
        uint amountGet;
        address tokenGive;
        uint amountGive;
        uint timestamp;
    }

    // tokenAddr => userAddr => tokens
    mapping(address => mapping(address => uint)) public tokens;

    mapping(uint => _Order) public orders;

    mapping(uint => bool) public orderCancelled;

    mapping(uint => bool) public orderFilled;

    event Deposit(
        address _token,
        address _user,
        uint _amount,
        uint _balance
    );

    event Withdraw(
        address _token,
        address _user,
        uint _amount,
        uint _balance
    );

    event Order(
        uint _id,
        address _user,
        address _tokenGet,
        uint _amountGet,
        address _tokenGive,
        uint _amountGive,
        uint _timestamp
    );

    event Cancel(
        uint _id,
        address _user,
        address _tokenGet,
        uint _amountGet,
        address _tokenGive,
        uint _amountGive,
        uint _timestamp
    );

    event Trade(
        uint _id,
        address _user,
        address _tokenGet,
        uint _amountGet,
        address _tokenGive,
        uint _amountGive,
        address _creator,
        uint _timestamp
    );

    constructor(address _feeAccount, uint8 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }


    function depositToken(address _tokenAddress, uint _amount) public {
        Token(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        tokens[_tokenAddress][msg.sender] += _amount;

        emit Deposit(_tokenAddress, msg.sender, _amount, balanceOf(_tokenAddress, msg.sender));
    }

    function withdrawToken(address _tokenAddress, uint _amount) public {
        //require(tokens[_tokenAddress][msg.sender] >= _amount, "Insufficient balance");

        Token(_tokenAddress).transfer(msg.sender, _amount);
        tokens[_tokenAddress][msg.sender] -= _amount;

        emit Withdraw(_tokenAddress, msg.sender, _amount, balanceOf(_tokenAddress, msg.sender));
    }


    function balanceOf(address _token, address _user) public view returns (uint) {
        return tokens[_token][_user];
    }

    function makeOrder(address tokenGet, uint getAmount, address tokenGive, uint giveAmount) public returns (bool) {
        
        require(
            balanceOf(tokenGive, msg.sender) >= giveAmount,
            "Insufficient balance"
        );

        require(
            getAmount % 100 == 0,
            "Invalid value for _amountGet.  Must be multiple of 100"
        );
        
        orderCount = orderCount + 1;

        orders[orderCount] = _Order(
            orderCount,
            msg.sender, 
            tokenGet, 
            getAmount, 
            tokenGive, 
            giveAmount, 
            block.timestamp
        );

        emit Order(
            orderCount, 
            msg.sender, 
            tokenGet, 
            getAmount, 
            tokenGive, 
            giveAmount, 
            block.timestamp
        );

        return true;
    }

    function cancelOrder(uint _id) public {
        _Order memory order = orders[_id];

        require(
            order.id == _id,
            "Invalid order id"
        );

        require(
            order.user == msg.sender,
            "Unauthorized"
        );

        orderCancelled[_id] = true;

        emit Cancel(
            _id, 
            order.user, 
            order.tokenGet, 
            order.amountGet, 
            order.tokenGive, 
            order.amountGive, 
            block.timestamp
        );
    }

    function fillOrder(uint _id) public {
        _Order memory order = orders[_id];

        require(
            _id > 0 && _id <= orderCount,
            "Invalid order id"
        );

        require(
            orderCancelled[_id] == false,
            "Order was cancelled"
        );

        require(
            orderFilled[_id] == false,
            "Order was already filled"
        );

        _trade(
            order.id,
            order.user,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive
        );

        orderFilled[order.id] = true;
    }

    function _trade(
        uint _orderId, 
        address _user,
        address _tokenGet,
        uint _amountGet,
        address _tokenGive,
        uint _amountGive
    ) internal {
        uint feeAmount = _amountGet * feePercent / 100;

        require(
            balanceOf(_tokenGet, msg.sender) >= _amountGet + feeAmount,
            "Insufficient balance"
        );

        tokens[_tokenGive][_user] -= _amountGive;
        tokens[_tokenGive][msg.sender] += _amountGive;

        tokens[_tokenGet][_user] += _amountGet;
        tokens[_tokenGet][msg.sender] -= _amountGet + feeAmount;

        tokens[_tokenGet][feeAccount] += feeAmount;

        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }
}
