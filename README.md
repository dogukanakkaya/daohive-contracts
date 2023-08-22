# daohive-contracts

## Project Setup
- Run `cp .env.example .env` and fill the necessary environment variables in `.env` file
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` is only needed to upload artifacts to storage.
- Run `npm i` at the root of the repository

---

## Upload Artifacts
```shell
npm run compile # compile contracts so the latest artifacts can be generated
npm run upload
```

---

## Verify Contract
```shell
npm run verify ${CONTRACT_ADDRESS}
```

---

## Test
```shell
npm run test
```