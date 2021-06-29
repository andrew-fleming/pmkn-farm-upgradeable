// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PmknFarmV2 is Initializable {

    address private admin;
    IERC20 private daiToken;

    mapping(bytes32 => mapping(address => bool)) private addressBoolStorage;
    mapping(bytes32 => mapping(address => uint256)) private addressUintStorage;

    event Stake(address indexed user, uint256 indexed amount);
    event Unstake(address indexed user, uint256 indexed amount);

    function initialize(
        address _admin,
        IERC20 _daiToken
        ) public initializer {
        admin = _admin;
        daiToken = _daiToken;
    }

    /// HELPER FUNCTIONS ///

    function setAddressBool(address user, string memory record, bool value) internal {
        bytes32 _thing = keccak256(abi.encode(record));
        addressBoolStorage[_thing][user] = value;
    }

    function setAddressUint(address user, string memory record, uint256 value) internal {
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
        //uint256 yieldTransfer = calculateYieldTotal(msg.sender);
        uint256 balTransfer = amount;
        amount = 0;
        uint256 oldBalance = getStakingBalance(msg.sender);
        setAddressUint(msg.sender, "stakingBalance", oldBalance -= balTransfer);
        daiToken.transfer(msg.sender, balTransfer);
        //pmknBalance[msg.sender] += yieldTransfer;
        if(oldBalance == 0){
            setAddressBool(msg.sender, "isStaking", false);
        }
        emit Unstake(msg.sender, balTransfer);
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

}