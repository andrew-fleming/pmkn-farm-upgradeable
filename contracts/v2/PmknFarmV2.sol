// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../NFTFactory.sol";
import "./NFTFactoryV2.sol";
import "../PmknToken.sol";
import "./PmknTokenV2.sol";
import "../Lottery.sol";

contract PmknFarmV2 is Initializable {

    address private admin;
    ERC20 private daiToken;
    PmknTokenV2 private pmknToken;
    NFTFactoryV2 private nftFactory;
    Lottery private lottery;

    mapping(bytes32 => mapping(address => bool)) private addressBoolStorage;
    mapping(bytes32 => mapping(address => uint256)) private addressUintStorage;

    event Stake(address indexed user, uint256 indexed amount);
    event Unstake(address indexed user, uint256 indexed amount);
    event YieldWithdraw(address indexed user, uint256 indexed amount);
    event MintNFT(address indexed user, uint256 indexed tokenId);

    function initialize(
        address _admin,
        ERC20 _daiToken,
        PmknTokenV2 _pmknToken,
        NFTFactoryV2 _nftFactory,
        Lottery _lottery
        ) public initializer {
            admin = _admin;
            daiToken = _daiToken;
            pmknToken = _pmknToken;
            nftFactory = _nftFactory;
            lottery = _lottery;
    }

    /// HELPER FUNCTIONS ///

    function setAddressBool(address user, string memory record, bool value) private {
        bytes32 _thing = keccak256(abi.encode(record));
        addressBoolStorage[_thing][user] = value;
    }

    function setAddressUint(address user, string memory record, uint256 value) private {
        bytes32 _bytes = keccak256(abi.encode(record));
        addressUintStorage[_bytes][user] = value;
    }

    /// CORE FUNCTIONS /// 

    function stake(uint256 amount) public {
        require(
            daiToken.balanceOf(msg.sender) >= amount &&
            amount > 0,
            "Either amount or balance is 0"
        );

        if(getIsStaking(msg.sender)){
            uint256 toTransfer = calculateYieldTotal(msg.sender);
            uint256 oldPmkn = getPmknBalance(msg.sender);
            setAddressUint(msg.sender, "pmknBalance", oldPmkn += toTransfer);
        }

        daiToken.transferFrom(msg.sender, address(this), amount);
        setAddressBool(msg.sender, "isStaking", true);
        uint256 oldBalance = getStakingBalance(msg.sender);
        setAddressUint(msg.sender, "stakingBalance", oldBalance += amount);
        setAddressUint(msg.sender, "timeStart", block.timestamp);
        emit Stake(msg.sender, amount);
    }

    function unstake(uint256 amount) public {
        require(
            getIsStaking(msg.sender) == true &&
            getStakingBalance(msg.sender) >= amount,
            "Nothing to unstake"
        );
        uint256 yieldTransfer = calculateYieldTotal(msg.sender);
        uint256 balTransfer = amount;
        amount = 0;
        uint256 oldStake = getStakingBalance(msg.sender);
        setAddressUint(msg.sender, "stakingBalance", oldStake -= balTransfer);
        daiToken.transfer(msg.sender, balTransfer);
        uint256 oldPmkn = getPmknBalance(msg.sender);
        setAddressUint(msg.sender, "pmknBalance", oldPmkn += yieldTransfer);
        if(oldStake == 0){
            setAddressBool(msg.sender, "isStaking", false);
        }
        emit Unstake(msg.sender, balTransfer);
    }

    function withdrawYield() public {
        uint256 toTransfer = calculateYieldTotal(msg.sender);
        uint256 pmknBalance = getPmknBalance(msg.sender);

        require(
            toTransfer > 0 ||
            pmknBalance > 0,
            "Nothing to withdraw"
            );
            
        if(pmknBalance != 0){
            setAddressUint(msg.sender, "pmknBalance", 0);
            toTransfer += pmknBalance;
        }

        setAddressUint(msg.sender, "timeStart", block.timestamp);
        pmknToken.mint(msg.sender, toTransfer);
        emit YieldWithdraw(msg.sender, toTransfer);
    }

    function calculateYieldTime(address user) public view returns(uint256) {
        uint256 end = block.timestamp;
        uint256 totalTime = end - getTimeStart(user);
        return totalTime;
    }

    function calculateYieldTotal(address user) public view returns(uint256) {
        uint256 time = calculateYieldTime(user) * 10**18;
        uint256 rate = 86400;
        uint256 timeRate = time / rate;
        uint256 rawYield = (getStakingBalance(user) * timeRate) / 10**18;
        return rawYield;
    }

    function mintNFT(address user) public {
        uint256 nftPrice = nftFactory.nftPrice();
        require(
            pmknToken.balanceOf(user) >= nftPrice, 
            "Not enough PMKN"
        );
        lottery.addToLotteryPool(user, nftPrice);
        nftFactory.mint(user);
        uint256 tokenId = nftFactory.totalSupply();
        emit MintNFT(user, tokenId);
    } 

 
    ////////////////
    /// GETTERS ////
    ////////////////

    function getIsStaking(address user) public view returns(bool) {
        return addressBoolStorage[keccak256(abi.encode("isStaking"))][user];
    }

    function getStakingBalance(address user) public view returns(uint256) {
        return addressUintStorage[keccak256(abi.encode("stakingBalance"))][user];
    }

    function getTimeStart(address user) public view returns(uint256) {
        return addressUintStorage[keccak256(abi.encode("timeStart"))][user];
    }

    function getPmknBalance(address user) public view returns(uint256) {
        return addressUintStorage[keccak256(abi.encode("pmknBalance"))][user];
    }
}