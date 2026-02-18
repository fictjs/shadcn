import { Command } from 'commander'

import { runAdd } from '../commands/add'
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

  program
    .command('add')
    .description('Add one or more registry components to the current project')
    .argument('<components...>', 'Component names, e.g. button dialog')
    .option('--overwrite', 'Overwrite existing conflicting files')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (components: string[], options) => {
      await runAdd({
        components,
        overwrite: Boolean(options.overwrite),
        skipInstall: Boolean(options.skipInstall),
      })
    })

  await program.parseAsync(argv)
}
