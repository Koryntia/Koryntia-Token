// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Detailed is IERC20 {
    function decimals() external view returns (uint8);
}

contract Presale is Ownable {
    // The token being sold
    IERC20Detailed public token;
    // The token used for payment
    IERC20Detailed public paymentToken;
    // Price per token in terms of paymentToken
    uint256 public price;

    // Event emitted when tokens are bought
    event TokensBought(address indexed buyer, uint256 amount);

    /**
     * @dev Constructor sets the token, payment token, and price.
     * @param _token Address of the token being sold
     * @param _paymentToken Address of the token used for payment
     * @param _price Price per token in terms of paymentToken
     */
    constructor(IERC20Detailed _token, IERC20Detailed _paymentToken, uint256 _price, address owner) Ownable(owner) {
        token = _token;
        paymentToken = _paymentToken;
        price = _price;
    }

    /**
     * @dev Function to buy tokens.
     * @param amount Number of tokens to buy
     */
    function buy(uint256 amount) external {
        uint256 cost = (amount * price) / (10 ** 18); // Assuming price is in wei and amount is in token units

        require(token.balanceOf(address(this)) >= amount, "Not enough tokens available");
        require(paymentToken.transferFrom(msg.sender, address(this), cost), "Payment failed");
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        emit TokensBought(msg.sender, amount);
    }

    /**
     * @dev Function to withdraw collected payments. Only callable by the owner.
     */
    function withdrawPayments() external onlyOwner {
        uint256 paymentTokenBalance = paymentToken.balanceOf(address(this));
        if (paymentTokenBalance > 0) {
            // Transfer the collected payments to the owner
            require(paymentToken.transfer(owner(), paymentTokenBalance), "Withdraw failed");
        }
    }

    /**
     * @dev Function to withdraw unsold tokens. Only callable by the owner.
     */
    function withdrawTokens() external onlyOwner {
        uint256 unsoldTokens = token.balanceOf(address(this));
        require(token.transfer(owner(), unsoldTokens), "Withdraw failed");
    }
}
