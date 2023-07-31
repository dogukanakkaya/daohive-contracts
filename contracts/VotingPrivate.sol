// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VotingBase.sol";

contract VotingPrivate is VotingBase {
  mapping(address => bool) public whitelist;
  mapping(address => uint256) private whitelistIndex; // for more efficient removal
  address[] public whitelistAddresses;

  constructor(string memory _name, string memory _description, address[] memory _whitelist) VotingBase(_name, _description) {
    for (uint256 i = 0; i < _whitelist.length; i++) {
      _addToWhitelist(_whitelist[i]);
    }
  }

  function vote(string memory _proposalId, VotingBase.VoteType _voteType) public override onlyWhitelisted {
    super.vote(_proposalId, _voteType);
  }

  function _addToWhitelist(address _address) private {
    whitelist[_address] = true;
    whitelistAddresses.push(_address);
    whitelistIndex[_address] = whitelistAddresses.length - 1;
  }

  function addToWhitelist(address[] memory _addresses) public onlyOwner {
    for(uint i = 0; i < _addresses.length; i++) {
      // @todo(5): change this with an if because it should not return if one of the addresses is already whitelisted
      // but maybe instead of doing if checks just adding the address is more gas efficient check it
      require(!whitelist[_addresses[i]], "Address already whitelisted");

      _addToWhitelist(_addresses[i]);
    }
  }

  function removeFromWhitelist(address[] memory _addresses) public onlyOwner {
    for(uint i = 0; i < _addresses.length; i++) {
      // @todo(5)
      require(whitelist[_addresses[i]], "Address not whitelisted");

      whitelist[_addresses[i]] = false;

      // find the index of the address, swap it with the last address in the array, update the swapped addresses index, and remove the last address
      uint256 index = whitelistIndex[_addresses[i]];
      whitelistAddresses[index] = whitelistAddresses[whitelistAddresses.length - 1];
      whitelistIndex[whitelistAddresses[index]] = index;
      whitelistAddresses.pop();
    }
  }

  function getWhitelist() public view returns (address[] memory) {
    return whitelistAddresses;
  }

  function getWhitelistCount() public view returns (uint256) {
    return whitelistAddresses.length;
  }

  modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "Only whitelisted addresses allowed.");
    _;
  }
}
