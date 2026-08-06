#!/usr/bin/env node

import * as readline from 'node:readline'
import { execSync } from 'node:child_process'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const args = process.argv.slice(2)
let migrationName = args.join(' ')

function runMigration(name) {
  try {
    console.log(`\nRunning Prisma migration: "${name}"...\n`)

    execSync(`pnpm prisma migrate dev --name ${name}`, { stdio: 'inherit' })

    console.log('\nMigration completed!\n')
  }
  catch {
    console.error('\nMigration failed. Check the logs above for details.\n')
    process.exit(1)
  }
}

function formatName(name) {
  return name.trim().replace(/\s+/g, '_')
}

if (!migrationName) {
  rl.question('Enter a name for this migration: ', (answer) => {
    rl.close()
    const sanitized = formatName(answer)
    if (!sanitized) {
      console.error('Migration name cannot be empty.')
      process.exit(1)
    }
    runMigration(sanitized)
  })
}
else {
  rl.close()
  runMigration(formatName(migrationName))
}
