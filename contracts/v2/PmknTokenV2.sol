// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract PmknTokenV2 is Initializable, ContextUpgradeable, AccessControlUpgradeable, ERC20Upgradeable {
    ERC20Upgradeable public pmknToken;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    function initialize(
        ERC20Upgradeable _pmknToken,
        string memory name,
        string memory symbol
        ) public initializer {
        pmknToken = _pmknToken;
        __ERC20_init(name, symbol);
        __AccessControl_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function mint(address to, uint256 amount) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "Must have minter role to mint");
        _mint(to, amount);
    }

 
}