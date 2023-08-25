// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingBase is Ownable {
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
    mapping(string => Proposal) public proposals;
    mapping(address => mapping(string => bool)) public hasVotedForProposal;

    event ProposalAdded(string indexed proposalId, string uri, uint256 startAt, uint256 endAt);
    event VoteCasted(address indexed voter, string indexed proposalId, VoteType voteType);

    constructor(string memory _name, string memory _description) {
        name = _name;
        description = _description;
    }

    function addProposal(string memory _proposalId, string memory _uri, uint256 _startAt, uint256 _endAt) public onlyOwner {
        Proposal memory proposal = Proposal(_proposalId, _uri, 0, 0, 0, _startAt, _endAt);
        proposals[_proposalId] = proposal;

        emit ProposalAdded(_proposalId, _uri,_startAt, _endAt);
    }

    function vote(string memory _proposalId, VoteType _voteType) public virtual {
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
}
