// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../../contracts/Token.sol";

contract TokenTest is Test {
    Token public token;

    function setUp() public {
        token = new Token("Test Eth", "tETH", 1000);
    }

    function testIncrement() public {
        assertEq(token.symbol(), "tETH");
    }
}
