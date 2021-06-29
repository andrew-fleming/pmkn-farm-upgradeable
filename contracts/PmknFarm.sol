// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PmknToken.sol";

contract PmknFarm is Initializable {

    address private admin;
    IERC20 private daiToken;
    PmknToken private pmknToken;

    mapping(bytes32 => mapping(address => bool)) private addressBoolStorage;
    mapping(bytes32 => mapping(address => uint256)) private addressUintStorage;

    function initialize(
        address _admin,
        IERC20 _daiToken,
        PmknToken _pmknToken
        ) public initializer {
        admin = _admin;
        daiToken = _daiToken;
        pmknToken = _pmknToken;
    }

}