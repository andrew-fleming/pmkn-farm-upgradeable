// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PmknToken.sol";
import "./NFTFactory.sol";
import "./Lottery.sol";

contract PmknFarm is Initializable {

    address private admin;
    IERC20 private daiToken;
    PmknToken private pmknToken;
    NFTFactory private nftFactory;
    Lottery private lottery;

    mapping(bytes32 => mapping(address => bool)) private addressBoolStorage;
    mapping(bytes32 => mapping(address => uint256)) private addressUintStorage;

    function initialize(
        address _admin,
        IERC20 _daiToken,
        PmknToken _pmknToken,
        NFTFactory _nftFactory,
        Lottery _lottery
        ) public initializer {
        admin = _admin;
        daiToken = _daiToken;
        pmknToken = _pmknToken;
        nftFactory = _nftFactory;
        lottery = _lottery;
    }

}