import { supabase } from '@/utils/supabase'
import path from 'node:path'
import fs from 'node:fs/promises'

const ARTIFACTS_PATH = path.join(process.cwd(), 'artifacts/contracts')

async function main() {
  const contracts = await fs.readdir(ARTIFACTS_PATH)

  await Promise.all(contracts.map(async contract => {
    const contractName = contract.split('.')[0]
    const artifact = await fs.readFile(`${ARTIFACTS_PATH}/${contract}/${contractName}.json`)

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(`artifacts/${contractName}.json`, artifact.toString(), {
        contentType: 'application/json',
        upsert: true
      })

    if (!error) {
      console.log('Artifacts uploaded to Supabase Storage', data)
    } else {
      console.error(error.message)
    }
  }))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
