import { Command, Option } from 'commander'
import packageJson from '../../package.json'

import { runAdd } from '../commands/add'
import { runBlocksInstall } from '../commands/blocks'
import { runDiff } from '../commands/diff'
import { runDoctor } from '../commands/doctor'
import { runInit } from '../commands/init'
import { runList, runListFromRegistry } from '../commands/list'
import { runRemove } from '../commands/remove'
import { runSearchFromRegistry } from '../commands/search'
import { runThemeApply } from '../commands/theme'
import { runUpdate } from '../commands/update'

export async function main(argv: string[]): Promise<void> {
  const program = new Command()

  program
    .name('fictcn')
    .description('Fict shadcn-style code distribution CLI')
    .version(packageJson.version)

  program
    .command('init')
    .description('Initialize the current project for fictcn')
    .option('--skip-install', 'Skip dependency installation')
    .option('--dry-run', 'Preview changes without writing files')
    .action(async options => {
      await runInit({
        skipInstall: Boolean(options.skipInstall),
        dryRun: Boolean(options.dryRun),
      })
    })

  program
    .command('add')
    .description('Add one or more registry components to the current project')
    .argument('<components...>', 'Component names, e.g. button dialog')
    .option('--overwrite', 'Overwrite existing conflicting files')
    .option('--skip-install', 'Skip dependency installation')
    .option('--dry-run', 'Preview changes without writing files')
    .action(async (components: string[], options) => {
      await runAdd({
        components,
        overwrite: Boolean(options.overwrite),
        skipInstall: Boolean(options.skipInstall),
        dryRun: Boolean(options.dryRun),
      })
    })

  program
    .command('diff')
    .description('Show local file differences against the builtin registry')
    .argument('[entries...]', 'Optional registry entry names (components/blocks/themes)')
    .action(async (entries?: string[]) => {
      const result = await runDiff({ components: entries })
      if (result.patches.length === 0) {
        console.log('No registry drift detected.')
        return
      }
      console.log(result.patches.join('\n'))
    })

  program
    .command('update')
    .description('Update installed registry entries from the builtin registry')
    .argument('[entries...]', 'Optional registry entry names (components/blocks/themes)')
    .option('--force', 'Override local file changes')
    .option('--skip-install', 'Skip dependency installation')
    .option('--dry-run', 'Preview changes without writing files')
    .action(async (entries: string[] | undefined, options) => {
      await runUpdate({
        components: entries,
        force: Boolean(options.force),
        skipInstall: Boolean(options.skipInstall),
        dryRun: Boolean(options.dryRun),
      })
    })

  program
    .command('remove')
    .alias('uninstall')
    .description('Remove installed registry entries and tracked files')
    .argument('<entries...>', 'Installed entry names, e.g. button auth/login-form theme-slate')
    .option('--force', 'Remove files even when local edits are detected')
    .option('--dry-run', 'Preview changes without deleting files')
    .action(async (entries: string[], options) => {
      await runRemove({
        entries,
        force: Boolean(options.force),
        dryRun: Boolean(options.dryRun),
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
    .description('List registry entries')
    .addOption(
      new Option('--type <type>', 'components | blocks | themes | all')
        .choices(['components', 'blocks', 'themes', 'all'])
        .default('all'),
    )
    .option('--registry <registry>', 'Registry source (`builtin` or URL to remote registry)')
    .option('--json', 'Output as JSON')
    .action(async options => {
      const output = await runListFromRegistry({
        json: Boolean(options.json),
        type: options.type,
        registry: options.registry,
      })
      console.log(output)
    })

  program
    .command('search')
    .description('Search registry entries')
    .argument('<query>', 'Search term')
    .option('--registry <registry>', 'Registry source (`builtin` or URL to remote registry)')
    .action(async (query, options) => {
      const output = await runSearchFromRegistry(query, {
        registry: options.registry,
      })
      console.log(output.length === 0 ? 'No registry entries matched the query.' : output)
    })

  const blocks = program.command('blocks').description('Manage built-in blocks')

  blocks
    .command('add')
    .description('Install one or more blocks')
    .argument('<blocks...>', 'Block names, e.g. auth/login-form')
    .option('--overwrite', 'Overwrite conflicting files')
    .option('--skip-install', 'Skip dependency installation')
    .option('--dry-run', 'Preview changes without writing files')
    .action(async (blockNames: string[], options) => {
      await runBlocksInstall({
        blocks: blockNames,
        overwrite: Boolean(options.overwrite),
        skipInstall: Boolean(options.skipInstall),
        dryRun: Boolean(options.dryRun),
      })
    })

  blocks
    .command('list')
    .description('List available blocks')
    .action(() => {
      console.log(runList({ type: 'blocks' }))
    })

  const theme = program.command('theme').description('Manage built-in themes')

  theme
    .command('apply')
    .description('Install and register one or more themes')
    .argument('<themes...>', 'Theme names, e.g. theme-slate')
    .option('--overwrite', 'Overwrite conflicting files')
    .option('--dry-run', 'Preview changes without writing files')
    .action(async (themes: string[], options) => {
      await runThemeApply({
        themes,
        overwrite: Boolean(options.overwrite),
        dryRun: Boolean(options.dryRun),
      })
    })

  theme
    .command('list')
    .description('List available themes')
    .action(() => {
      console.log(runList({ type: 'themes' }))
    })

  await program.parseAsync(argv)
}
