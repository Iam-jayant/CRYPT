// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev Mock ERC-20 token for testing on Amoy testnet
 */
contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    /**
     * @dev Allows anyone to mint tokens for testing
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount * 10**decimals());
    }

    /**
     * @dev Faucet function - gives 1000 tokens to caller
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**decimals());
    }
}
