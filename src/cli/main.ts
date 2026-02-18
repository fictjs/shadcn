import { Command } from 'commander'

export async function main(argv: string[]): Promise<void> {
  const program = new Command()

  program
    .name('fictcn')
    .description('Fict shadcn-style code distribution CLI')
    .version('0.1.0')

  program
    .command('init')
    .description('Initialize the current project for fictcn')
    .action(() => {
      console.log('fictcn init (coming next commit)')
    })

  await program.parseAsync(argv)
}
