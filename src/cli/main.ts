import { Command } from 'commander'

import { runAdd } from '../commands/add'
import { runDiff } from '../commands/diff'
import { runDoctor } from '../commands/doctor'
import { runInit } from '../commands/init'
import { runList } from '../commands/list'
import { runSearch } from '../commands/search'
import { runUpdate } from '../commands/update'

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

  program
    .command('diff')
    .description('Show local file differences against the builtin registry')
    .argument('[components...]', 'Optional component names')
    .action(async (components?: string[]) => {
      const result = await runDiff({ components })
      if (result.patches.length === 0) {
        console.log('No registry drift detected.')
        return
      }
      console.log(result.patches.join('\n'))
    })

  program
    .command('update')
    .description('Update installed components from the builtin registry')
    .argument('[components...]', 'Optional component names')
    .option('--force', 'Override local file changes')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (components: string[] | undefined, options) => {
      await runUpdate({
        components,
        force: Boolean(options.force),
        skipInstall: Boolean(options.skipInstall),
      })
    })

  program
    .command('doctor')
    .description('Validate project setup and dependency health')
    .action(async () => {
      const result = await runDoctor()
      if (!result.ok) {
        process.exitCode = 1
      }
    })

  program
    .command('list')
    .description('List builtin components')
    .option('--json', 'Output as JSON')
    .action(options => {
      const output = runList({ json: Boolean(options.json) })
      console.log(output)
    })

  program
    .command('search')
    .description('Search builtin components')
    .argument('<query>', 'Search term')
    .action(query => {
      const output = runSearch(query)
      console.log(output.length === 0 ? 'No components matched the query.' : output)
    })

  await program.parseAsync(argv)
}
