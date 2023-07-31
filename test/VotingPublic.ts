import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('VotingPublic', async () => {
  const CONTRACT_NAME = 'My Contract';
  const CONTRACT_DESCRIPTION = 'My Contract Description';

  async function deployTokenFixture() {
    const [owner, signer1, signer2] = await ethers.getSigners();

    const contract = await ethers.deployContract("VotingPublic", [CONTRACT_NAME, CONTRACT_DESCRIPTION]);
    await contract.waitForDeployment();

    return { contract, owner, signer1, signer2 };
  }

  describe("constructor", () => {
    it("should deploy correctly", async () => {
      const { contract } = await loadFixture(deployTokenFixture);

      expect(await contract.name()).to.equal(CONTRACT_NAME);
      expect(await contract.description()).to.equal(CONTRACT_DESCRIPTION);
    });
  });
});