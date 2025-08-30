import cac from 'cac'
import { version } from '../package.json'

const cli = cac('ai-lackey')

cli.command('init', 'Init repom cli config').action(() => {
  console.log('init')
})

cli.help()

cli.version(version)

cli.parse()