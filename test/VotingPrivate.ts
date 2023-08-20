import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('VotingPrivate', async () => {
  const CONTRACT_NAME = 'My Contract'
  const CONTRACT_DESCRIPTION = 'My Contract Description'

  async function deployTokenFixture() {
    const [owner, signer1, signer2] = await ethers.getSigners()

    const contract = await ethers.deployContract('VotingPrivate', [CONTRACT_NAME, CONTRACT_DESCRIPTION, [signer2]])
    await contract.waitForDeployment()

    return { contract, owner, signer1, signer2 }
  }

  describe('constructor', () => {
    it('should deploy correctly', async () => {
      const { contract, signer2 } = await loadFixture(deployTokenFixture)

      expect(await contract.name()).to.equal(CONTRACT_NAME)
      expect(await contract.description()).to.equal(CONTRACT_DESCRIPTION)
      expect(await contract.whitelist(signer2.address)).to.equal(true)
    })
  })

  describe('whitelist', () => {
    it('should add to whitelist', async () => {
      const { contract, signer1, signer2 } = await loadFixture(deployTokenFixture)

      expect(await contract.whitelist(signer1.address)).to.equal(false)
      expect(await contract.whitelist(signer2.address)).to.equal(true)
      expect(await contract.getWhitelistCount()).to.equal(1)

      await (await contract.addToWhitelist([signer1.address])).wait()

      expect(await contract.whitelist(signer1.address)).to.equal(true)
      expect(await contract.getWhitelistCount()).to.equal(2)
    })

    it('should remove from whitelist', async () => {
      const { contract, signer2 } = await loadFixture(deployTokenFixture)

      expect(await contract.whitelist(signer2.address)).to.equal(true)
      expect(await contract.getWhitelistCount()).to.equal(1)

      await (await contract.removeFromWhitelist([signer2.address])).wait()

      expect(await contract.whitelist(signer2.address)).to.equal(false)
      expect(await contract.getWhitelistCount()).to.equal(0)
    })

    it('should not allow non-owner to change whitelist', async () => {
      const { contract, signer1, signer2 } = await loadFixture(deployTokenFixture)

      expect(await contract.whitelist(signer1.address)).to.equal(false)
      expect(await contract.whitelist(signer2.address)).to.equal(true)
      expect(await contract.getWhitelistCount()).to.equal(1)

      await expect(contract.connect(signer1).addToWhitelist([signer1.address])).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(contract.connect(signer1).removeFromWhitelist([signer2.address])).to.be.revertedWith('Ownable: caller is not the owner')

      expect(await contract.whitelist(signer1.address)).to.equal(false)
      expect(await contract.whitelist(signer2.address)).to.equal(true)
      expect(await contract.getWhitelistCount()).to.equal(1)
    })
  })

  describe('vote', () => {
    it('should not allow non-whitelisted to vote', async () => {
      const { contract, signer1, signer2 } = await loadFixture(deployTokenFixture)

      const endAt = Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000)
      await (await contract.addProposal('id', 'uri', 0, endAt)).wait()

      await contract.connect(signer2).vote('id', 1)

      await expect(contract.connect(signer1).vote('id', 0)).to.be.revertedWith('Only whitelisted addresses allowed.')

      const [approvalCount, disapprovalCount, neutralCount] = await contract.getVoteCount('id')

      expect(approvalCount).to.equal(0)
      expect(disapprovalCount).to.equal(1)
      expect(neutralCount).to.equal(0)
    })
  })
})