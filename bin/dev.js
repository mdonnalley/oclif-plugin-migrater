#!/usr/bin/env ts-node

// -S node --loader ts-node/esm --no-warnings=ExperimentalWarning
// eslint-disable-next-line node/shebang
async function main() {
  const {execute} = await import('@oclif/core')
  await execute({development: true, dir: import.meta.url})
}

await main()
