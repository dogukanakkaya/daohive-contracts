import { supabase } from '@/utils/supabase';
import path from 'node:path';
import fs from 'node:fs/promises';

async function main() {
  const contracts = await fs.readdir(path.join(process.cwd(), 'artifacts/contracts'));

  const data = await Promise.all(contracts.map(async contract => {
    const contractName = contract.split('.')[0];
    const artifact = await fs.readFile(path.join(process.cwd(), `artifacts/contracts/${contract}/${contractName}.json`));

    const { data, error } = await supabase.storage
      .from('artifacts')
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
