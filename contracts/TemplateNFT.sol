// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./NFTFactory.sol";

contract TemplateNFT is Initializable, AccessControlUpgradeable {

    Template[] template;
    mapping(uint256 => Template) public newNFT;
    uint256 public nftCount;
    NFTFactory nftFactory;

    struct Template {
        string name;
        bytes data;
        uint256 price;
        uint256 tokenId;
    }

    function initialize(NFTFactory _nftFactory) public initializer {
        nftFactory = _nftFactory;
        __AccessControl_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

}
