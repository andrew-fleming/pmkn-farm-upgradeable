// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PmknFarm is Initializable {

    address private admin;
    IERC20 private daiToken;

    mapping(bytes32 => mapping(address => bool)) private addressBoolStorage;
    mapping(bytes32 => mapping(address => uint256)) private addressUintStorage;

    function initialize(
        address _admin,
        IERC20 _daiToken
        ) public initializer {
        admin = _admin;
        daiToken = _daiToken;
    }

}