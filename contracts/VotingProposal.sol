// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingProposal is Ownable {
    struct Proposal {
        string id;
        string uri;
        uint256 approvalCount;
        uint256 disapprovalCount;
        uint256 neutralCount;
        uint256 startAt;
        uint256 endAt;
    }

    enum VoteType { Approval, Disapproval, Neutral }

    string public name;
    string public description;
    mapping(address => bool) public whitelist;
    mapping(address => uint256) private whitelistIndex; // for more efficient removal
    address[] public whitelistAddresses;
    mapping(string => Proposal) public proposals;
    mapping(address => mapping(string => bool)) public hasVotedForProposal;

    event ProposalAdded(string indexed proposalId, string uri);
    event VoteCasted(address indexed voter, string indexed proposalId, VoteType voteType);

    constructor(string memory _name, string memory _description, address[] memory _whitelist) {
        name = _name;
        description = _description;
        for (uint256 i = 0; i < _whitelist.length; i++) {
            _addToWhitelist(_whitelist[i]);
        }
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Only whitelisted addresses allowed.");
        _;
    }

    function addProposal(string memory _proposalId, string memory _uri, uint256 _startAt, uint256 _endAt) public onlyOwner {
        Proposal memory newProposal = Proposal(_proposalId, _uri, 0, 0, 0, _startAt, _endAt);
        proposals[_proposalId] = newProposal;

        emit ProposalAdded(_proposalId, _uri);
    }

    function vote(string memory _proposalId, VoteType _voteType) public onlyWhitelisted {
        require(block.timestamp >= proposals[_proposalId].startAt, "Voting has not started for this proposal.");
        require(block.timestamp <= proposals[_proposalId].endAt, "Voting has ended for this proposal.");
        require(!hasVotedForProposal[msg.sender][_proposalId], "You have already voted for this proposal.");

        hasVotedForProposal[msg.sender][_proposalId] = true;

        if (_voteType == VoteType.Approval) {
            proposals[_proposalId].approvalCount++;
        } else if (_voteType == VoteType.Disapproval) {
            proposals[_proposalId].disapprovalCount++;
        } else if (_voteType == VoteType.Neutral) {
            proposals[_proposalId].neutralCount++;
        }

        emit VoteCasted(msg.sender, _proposalId, _voteType);
    }

    function getVoteCount(string memory _proposalId) public view returns (uint256[3] memory) {
        Proposal memory proposal = proposals[_proposalId];
        uint256[3] memory voteCounts;

        voteCounts[uint8(VoteType.Approval)] = proposal.approvalCount;
        voteCounts[uint8(VoteType.Disapproval)] = proposal.disapprovalCount;
        voteCounts[uint8(VoteType.Neutral)] = proposal.neutralCount;

        return voteCounts;
    }


    function _addToWhitelist(address _address) private {
        whitelist[_address] = true;
        whitelistAddresses.push(_address);
        whitelistIndex[_address] = whitelistAddresses.length - 1;
    }

    function addToWhitelist(address[] memory _addresses) public onlyOwner {
        for(uint i = 0; i < _addresses.length; i++) {
            require(!whitelist[_addresses[i]], "Address already whitelisted");

            _addToWhitelist(_addresses[i]);
        }
    }

    function removeFromWhitelist(address[] memory _addresses) public onlyOwner {
        for(uint i = 0; i < _addresses.length; i++) {
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
}
