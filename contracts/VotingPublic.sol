// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VotingBase.sol";

contract VotingPublic is VotingBase {
  constructor(string memory _name, string memory _description) VotingBase(_name, _description) { }
}
