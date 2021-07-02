// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./NFTFactory.sol";
import "./NFTFactoryV2.sol";

contract TemplateNFTV2 is Initializable, AccessControlUpgradeable {

    Template[] template;
    mapping(uint256 => Template) public newNFT;
    uint256 public nftCount;
    NFTFactoryV2 nftFactory;

    struct Template {
        string name;
        bytes data;
        uint256 price;
        uint256 tokenId;
    }

    bytes32 public constant NFT_SETTER = keccak256("NFT_SETTER");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    function initialize(NFTFactoryV2 _nftFactory) public initializer {
        nftFactory = _nftFactory;
        __AccessControl_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setNFT(
        string memory _name,
        bytes memory _data,
        uint256 _price
        ) public {
            require(hasRole(NFT_SETTER, _msgSender()), "TemplateNFTV2: must have setter role to set nft");
            Template memory nft = Template(_name, _data, _price, nftCount);
            template.push(nft);
            newNFT[nftCount] = nft;
            nftCount++;
    }

    function mintSetNFT(address user, uint256 amount) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "TemplateNFTV2: must have minter role to mint nft");
        Template memory nft = newNFT[nftCount];
        nftFactory.mint(user, nft.tokenId, amount, nft.data);
    }

    function getNFT(uint256 _tokenId) public view returns(
        string memory, 
        bytes memory, 
        uint256,
        uint256
        ) {
            Template memory nft = newNFT[_tokenId];
            return (nft.name, nft.data, nft.price, nft.tokenId);
    }
}
