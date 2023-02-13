//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0; 

contract Token {
    string public name;
    string public symbol;
    uint public decimals = 18;
    uint public totalSupply;

    // account balances
    mapping(address => uint) public balanceOf;
    // owner => spender => amount<
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed _from, 
        address indexed _to, 
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(
        string memory _name,
        string memory _symbol, 
        uint _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);

        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        // was only a test, approve can exceed the current balance
        //require(balanceOf[msg.sender] >= _value, "Insufficient funds");
        require(_spender != address(0), "Approval of zero address is not permitted");
        allowance[msg.sender][_spender] += _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
       
        _transfer(_from, _to, _value);
        allowance[_from][msg.sender] -= _value;

        return true;
    }


    function _transfer(address _from, address _to, uint256 _value) internal returns (bool success) {
        require(_to != address(0), "Transfering to zero address is not permitted");
        require(balanceOf[_from] >= _value, "Insufficient funds");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}