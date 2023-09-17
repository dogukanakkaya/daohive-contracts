import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('VotingBase', () => {
  const CONTRACT_NAME = 'My Contract'
  const CONTRACT_DESCRIPTION = 'My Contract Description'

  async function deployTokenFixture() {
    const [owner, signer1, signer2] = await ethers.getSigners()

    const contract = await ethers.deployContract('VotingBase', [CONTRACT_NAME, CONTRACT_DESCRIPTION])
    await contract.waitForDeployment()

    return { contract, owner, signer1, signer2 }
  }

  describe('constructor', () => {
    it('should deploy correctly', async () => {
      const { contract } = await loadFixture(deployTokenFixture)

      expect(await contract.name()).to.equal(CONTRACT_NAME)
      expect(await contract.description()).to.equal(CONTRACT_DESCRIPTION)
    })
  })

  describe('addProposal', () => {
    it('should add proposal successfully', async () => {
      const { contract } = await loadFixture(deployTokenFixture)

      const tx = await contract.addProposal('id', 'uri', 0, 0)
      const r = await tx.wait()

      const log = r?.logs
        .map(log => contract.interface.parseLog({ data: log.data, topics: log.topics as string[] }))
        .find((log) => log?.name === 'ProposalAdded')

      const args = log?.args.toObject()

      expect(args?.proposalId._isIndexed).to.equal(true)
      expect(args?.uri).to.equal('uri')
      expect(args?.startAt).to.equal(0)
      expect(args?.endAt).to.equal(0)
    })

    it('should not allow non-owner to add proposal', async () => {
      const { contract, signer1 } = await loadFixture(deployTokenFixture)

      await expect(contract.connect(signer1).addProposal('id', 'uri', 0, 0)).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('vote', () => {
    it('should vote successfully', async () => {
      const { contract, signer1, signer2 } = await loadFixture(deployTokenFixture)

      const endAt = Math.round((Date.now() + 1000 * 60 * 60 * 24) / 1000)
      await (await contract.addProposal('id', 'uri', 0, endAt)).wait()

      const tx1 = await contract.connect(signer1).vote('id', 0)
      const r1 = await tx1.wait()

      const log1 = r1?.logs
        .map(log => contract.interface.parseLog({ data: log.data, topics: log.topics as string[] }))
        .find((log) => log?.name === 'VoteCasted')

      const args1 = log1?.args.toObject()

      expect(args1?.proposalId._isIndexed).to.equal(true)
      expect(args1?.voter).to.equal(signer1.address)
      expect(args1?.voteType).to.equal(0)

      const tx2 = await contract.connect(signer2).vote('id', 1)
      const r2 = await tx2.wait()

      const log2 = r2?.logs
        .map(log => contract.interface.parseLog({ data: log.data, topics: log.topics as string[] }))
        .find((log) => log?.name === 'VoteCasted')

      const args2 = log2?.args.toObject()

      expect(args2?.proposalId._isIndexed).to.equal(true)
      expect(args2?.voter).to.equal(signer2.address)
      expect(args2?.voteType).to.equal(1)

      const proposal = await contract.proposals('id')

      expect(proposal.id).to.equal('id')
      expect(proposal.startAt).to.equal(0)
      expect(proposal.endAt).to.equal(endAt)
      expect(proposal.uri).to.equal('uri')
      expect(proposal.approvalCount).to.equal(1)
      expect(proposal.disapprovalCount).to.equal(1)
      expect(proposal.neutralCount).to.equal(0)
    })

    it('should not allowed to vote after endAt', async () => {
      const { contract, signer2 } = await loadFixture(deployTokenFixture)

      await (await contract.addProposal('id', 'uri', 0, 0)).wait()

      await expect(contract.connect(signer2).vote('id', 1)).to.be.revertedWith('Voting has ended for this proposal.')
    })

    it('should not allowed to vote before startAt', async () => {
      const { contract, signer2 } = await loadFixture(deployTokenFixture)

      const startAt = Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000)
      const endAt = Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 2) / 1000)
      await (await contract.addProposal('id', 'uri', startAt, endAt)).wait()

      await expect(contract.connect(signer2).vote('id', 1)).to.be.revertedWith('Voting has not started for this proposal.')
    })

    it('should not allowed to vote twice', async () => {
      const { contract, signer2 } = await loadFixture(deployTokenFixture)

      const endAt = Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000)
      await (await contract.addProposal('id', 'uri', 0, endAt)).wait()

      await contract.connect(signer2).vote('id', 1)
      await expect(contract.connect(signer2).vote('id', 1)).to.be.revertedWith('You have already voted for this proposal.')

      const proposal = await contract.proposals('id')

      expect(proposal.approvalCount).to.equal(0)
      expect(proposal.disapprovalCount).to.equal(1)
      expect(proposal.neutralCount).to.equal(0)
    })
  })

  describe('weights', () => {
    it('setWeights', async () => {
      const { contract, signer1 } = await loadFixture(deployTokenFixture)

      expect(await contract.weights(signer1.address)).to.equal(0)

      await (await contract.setWeights([signer1.address], [2])).wait()
      expect(await contract.weights(signer1.address)).to.equal(2)
    })

    it('deleteWeights', async () => {
      const { contract, signer1 } = await loadFixture(deployTokenFixture)

      await (await contract.setWeights([signer1.address], [2])).wait()
      expect(await contract.weights(signer1.address)).to.equal(2)

      await (await contract.deleteWeights([signer1.address])).wait()
      expect(await contract.weights(signer1.address)).to.equal(0)
    })
  })
})