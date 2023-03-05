//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0; 

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint8 public feePercent;

    mapping(address => mapping(address => uint)) public tokens;

    event Deposit(
        address _token,
        address _user,
        uint _amount,
        uint _balance
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


    function balanceOf(address _token, address _user) public view returns (uint) {
        return tokens[_token][_user];
    }
}