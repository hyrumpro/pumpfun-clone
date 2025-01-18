// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    
    address admin;

    constructor(string memory name, string memory symbol, uint initialMintValue) ERC20(name,symbol) {
        _mint(msg.sender, initialMintValue);
        admin = msg.sender;
    }

    function mint(uint qty,address receiver) external returns(uint) {
        require(msg.sender == admin, "Caller its not admin");
        _mint(receiver, qty);
        return 1;
    }
}

