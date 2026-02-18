import { Command } from 'commander'

import { runInit } from '../commands/init'

export async function main(argv: string[]): Promise<void> {
  const program = new Command()

  program
    .name('fictcn')
    .description('Fict shadcn-style code distribution CLI')
    .version('0.1.0')

  program
    .command('init')
    .description('Initialize the current project for fictcn')
    .option('--skip-install', 'Skip dependency installation')
    .action(async options => {
      await runInit({
        skipInstall: Boolean(options.skipInstall),
      })
    })

  await program.parseAsync(argv)
}
