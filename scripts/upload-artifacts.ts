import { supabase } from '@/utils/supabase';
import path from 'node:path';
import fs from 'node:fs/promises';
import { SUPABASE_BUCKET_ARTIFACTS } from '@/config';

const CONTRACT_ARTIFACTS_PATH = path.join(process.cwd(), 'artifacts/contracts');

async function main() {
  const contracts = await fs.readdir(CONTRACT_ARTIFACTS_PATH);

  const data = await Promise.all(contracts.map(async contract => {
    const contractName = contract.split('.')[0];
    const artifact = await fs.readFile(`${CONTRACT_ARTIFACTS_PATH}/${contract}/${contractName}.json`);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_ARTIFACTS)
      .upload(`${contractName}.json`, artifact.toString(), {
        contentType: 'application/json',
        upsert: true
      })

    if (!error) {
      return data;
    } else {
      console.log(error.message);
    }
  }));

  console.log('Artifacts uploaded to Supabase Storage', data);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
