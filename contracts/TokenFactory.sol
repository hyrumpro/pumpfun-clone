// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Token.sol";
import "hardhat/console.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract TokenFactory {
    struct MemeToken {
        string name;
        string symbol;
        string description;
        string tokenImageUrl;
        uint256 fundingRaised;
        address tokenAddress;
        address creatorAddress;
    }

    address[] public memeTokenAddresses;
    mapping(address => MemeToken) public addressToMemeTokenMapping;
    
    uint256 private constant DECIMALS = 10 ** 18;
    uint256 private constant MAX_SUPPLY = 1000000 * DECIMALS;
    uint256 private constant INIT_SUPPLY = 20 * MAX_SUPPLY / 100;
    uint256 private constant MEMETOKEN_CREATION_FEE = 0.0001 ether;
    uint256 private constant MEMECOIN_FUNDING_GOAL = 24 ether;
    uint256 private constant INITIAL_PRICE = 30000000000000;
    uint256 private constant K = 8 * 10**15;

    address private immutable UNISWAP_FACTORY_ADDRESS;
    address private immutable UNISWAP_ROUTER_ADDRESS;
    address private immutable owner;

    event TokenCreated(address indexed tokenAddress, string name);
    event LiquidityAdded(address indexed tokenAddress, uint256 liquidity);

    constructor() {
        UNISWAP_FACTORY_ADDRESS = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
        UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createMemeToken(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata imageUrl
    ) external payable returns (address) {
        require(msg.value >= MEMETOKEN_CREATION_FEE, "Invalid fee");
        
        Token memeTokenCt = new Token(name, symbol, INIT_SUPPLY);
        address memeTokenAddress = address(memeTokenCt);
        
        memeTokenAddresses.push(memeTokenAddress);
        addressToMemeTokenMapping[memeTokenAddress] = MemeToken(
            name, symbol, description, imageUrl, 0, memeTokenAddress, msg.sender
        );

        emit TokenCreated(memeTokenAddress, name);
        return memeTokenAddress;
    }

    function buyMemeToken(address memeTokenAddress, uint256 amount) external payable returns (uint256) {
        MemeToken storage listedToken = addressToMemeTokenMapping[memeTokenAddress];
        require(listedToken.tokenAddress != address(0), "Token not listed");
        require(listedToken.fundingRaised < MEMECOIN_FUNDING_GOAL, "Funding complete");

        Token tokenCt = Token(memeTokenAddress);
        uint256 currentSupply = tokenCt.totalSupply();
        uint256 availableSupply = (MAX_SUPPLY - currentSupply) / DECIMALS;
        require(amount <= availableSupply, "Not enough supply");

        uint256 currentSupplyScaled = (currentSupply - INIT_SUPPLY) / DECIMALS;
        uint256 requiredETH = calculateCost(currentSupplyScaled, amount);
        require(msg.value >= requiredETH, "Insufficient ETH");

        uint256 amountScaled = amount * DECIMALS;
        listedToken.fundingRaised += msg.value;
        tokenCt.mint(amountScaled, msg.sender);

        if(listedToken.fundingRaised >= MEMECOIN_FUNDING_GOAL) {
            _setupLiquidity(memeTokenAddress, amountScaled, listedToken.fundingRaised);
        }

        return requiredETH;
    }

    function _setupLiquidity(address tokenAddress, uint256 tokenAmount, uint256 ethAmount) private {
        Token(tokenAddress).mint(tokenAmount, address(this));
        Token(tokenAddress).approve(UNISWAP_ROUTER_ADDRESS, tokenAmount);
        
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        
        (,, uint256 liquidity) = router.addLiquidityETH{value: ethAmount}(
            tokenAddress,
            tokenAmount,
            tokenAmount * 95 / 100,
            ethAmount * 95 / 100,
            address(0),  // Burn address for LP tokens
            block.timestamp + 15 minutes
        );

        emit LiquidityAdded(tokenAddress, liquidity);
    }

    function calculateCost(uint256 currentSupply, uint256 tokensToBuy) public pure returns(uint256) {
        uint256 exponent1 = (K * (currentSupply + tokensToBuy)) / 10**18;
        uint256 exponent2 = (K * currentSupply) / 10**18;
        return (INITIAL_PRICE * 10**18 * (exp(exponent1) - exp(exponent2))) / K;
    }

    function exp(uint256 x) internal pure returns (uint256) {
        uint256 sum = 10**18;
        uint256 term = 10**18;
        uint256 xPower = x;
        
        for (uint256 i = 1; i <= 20; i++) {
            term = (term * xPower) / (i * 10**18);
            if (term < 1) break;
            sum += term;
        }
        return sum;
    }

    function withdrawFees() external onlyOwner {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}





