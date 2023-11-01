/* eslint-disable no-await-in-loop */
import {Command, Interfaces, ux} from '@oclif/core'
import chalk from 'chalk'
import {exec as cpExec} from 'node:child_process'
import {cp, readFile, readdir, rename, rm, writeFile} from 'node:fs/promises'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const exec = async (command: string): Promise<{code: number; stderr: string; stdout: string}> =>
  new Promise((resolve, reject) => {
    cpExec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('Error!', error)
        reject(error)
      } else {
        resolve({code: 0, stderr, stdout})
      }
    })
  })

async function readJSON<T>(path: string): Promise<T> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T
  } catch (error) {
    console.error(error)
    return {} as T
  }
}

async function writeJSON(path: string, json: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(json, null, 2))
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)]
}

function log(scope: string, action: 'added' | 'removed' | 'updated', ...args: string[]) {
  const whitespace = ' '.repeat(13 - scope.length)
  switch (action) {
    case 'added': {
      ux.log(chalk.dim(`[${scope}]${whitespace}`), chalk.green(action), ...args)
      break
    }

    case 'removed': {
      ux.log(chalk.dim(`[${scope}]${whitespace}`), chalk.red(action), ...args)
      break
    }

    case 'updated': {
      ux.log(chalk.dim(`[${scope}]${whitespace}`), chalk.cyan(action), ...args)
      break
    }

    default: {
      ux.log(chalk.dim(`[${scope}]${whitespace}`), ...args)
    }
  }
}

export default class Migrate extends Command {
  private templateDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'files')
  public async run(): Promise<void> {
    const tsConfig = await this.updateTsConfig()
    await this.updatePackageJson(tsConfig)
    await this.updateGitIgnore()
    await this.updateTestStuff()
    await this.updateBinScripts()
    await this.addEslintIgnore()

    try {
      await exec('yarn')
    } catch {
      await exec('yarn install')
    }

    await rename('.lintstagedrc.js', '.lintstagedrc.cjs')
    await rename('commitlint.config.js', 'commitlint.config.cjs')

    log('config', 'updated', 'lintstagedrc.js to lintstagedrc.cjs')
    log('config', 'updated', 'commitlint.config.js to commitlint.config.cjs')

    this.log(`${chalk.green.bold('SUCCESS')}\n`)
    this.log(`${chalk.bold('TODO')}:`)
    this.log('• Update imports to include .js extension')
    this.log('• Remove uses of __dirname')
    this.log('• Remove uses of require()')
    this.log('• Update references to bin/dev to bin/dev.js')
    this.log('• Run yarn lint --fix')
    this.log('• Add oclif.lock to clean up related scripts')
  }

  private async addEslintIgnore() {
    let contents: string | undefined
    let action: 'added' | 'updated'
    try {
      contents = await readFile('.eslintignore', 'utf8')
      action = 'updated'
    } catch {
      contents = ''
      action = 'added'
    }

    await writeFile('.eslintignore', (contents += '*.cjs/\n'))
    log('.eslintignore', action, '*.cjs/')
  }

  private async updateBinScripts() {
    const toRemove = [join('bin', 'run'), join('bin', 'dev')]

    for (const script of toRemove) {
      log('bin', 'removed', script)
      await rm(script, {force: true})
    }

    const toAdd = ['run.template.js', 'dev.template.js', 'dev.template.cmd']

    for (const script of toAdd) {
      const newScript = join('bin', script.replace('.template', ''))
      log('bin', 'added', newScript)
      await cp(join(this.templateDir, script), newScript)
      await exec(`chmod +x ${newScript}`)
    }
  }

  private async updateGitIgnore() {
    let gitIgnore = await readFile('.gitignore', 'utf8')
    await writeFile('.gitignore', (gitIgnore += '\noclif.lock\n'))
  }

  private async updatePackageJson(tsConfig: Interfaces.TSConfig): Promise<Interfaces.PJSON.Plugin> {
    const scope = 'package.json'
    const pjson = await readJSON<Interfaces.PJSON.Plugin>('package.json')

    const {stdout: version} = await exec(`npm show ${pjson.name} version --json`)
    const currentMajor = version.split('.')[0]

    pjson.version = `${currentMajor + 1}.0.0`
    log(scope, 'updated', `version: ${pjson.version}`)

    delete pjson.main
    log(scope, 'removed', 'main')
    pjson.exports = `./${tsConfig.compilerOptions.outDir?.replace('./', '') ?? 'lib'}/index.js`
    log(scope, 'added', 'exports')
    pjson.type = 'module'
    log(scope, 'added', 'type: module')

    if (pjson.bin && typeof pjson.bin === 'string') {
      pjson.bin = pjson.bin.replace('run', 'run.js')
    } else if (pjson.bin) {
      pjson.bin = Object.fromEntries(
        Object.entries(pjson.bin).map(([key, value]) => [key, (value as string).replace('run', 'run.js')]),
      )
    }

    log(scope, 'updated', 'bin')

    const devLibs = [
      '@oclif/plugin-command-snapshot',
      '@salesforce/dev-config',
      '@salesforce/dev-scripts',
      'eslint-config-salesforce-typescript',
      'oclif',
      'ts-node',
      'typescript',
    ]

    const optionalDevLibs = ['@oclif/plugin-help', '@oclif/test']

    const prodLibs = ['@oclif/core', 'chalk', 'inquirer', 'got', '@salesforce/sf-plugins-core']

    const removeLibs = ['tslib', 'swc', '@swc/core']

    for (const lib of devLibs) {
      const distTags = await exec(`npm view ${lib} dist-tags --json`)
      const version = `^${JSON.parse(distTags.stdout).latest}`
      pjson.devDependencies![lib] = version
      log(scope, 'added', `${lib}@${version}`)
    }

    for (const lib of optionalDevLibs) {
      if (pjson.devDependencies![lib]) {
        if (lib === '@types/node') {
          log(scope, 'added', `${lib}@^18`)
          pjson.devDependencies![lib] = '^18'
          continue
        }

        const distTags = await exec(`npm view ${lib} dist-tags --json`)
        const version = `^${JSON.parse(distTags.stdout).latest}`
        log(scope, 'added', `${lib}@${version}`)
        pjson.devDependencies![lib] = version
      }
    }

    for (const lib of prodLibs) {
      if (pjson.dependencies![lib]) {
        const distTags = await exec(`npm view ${lib} dist-tags --json`)
        const version = `^${JSON.parse(distTags.stdout).latest}`
        log(scope, 'added', `${lib}@${version}`)
        pjson.dependencies![lib] = version
      }
    }

    for (const lib of removeLibs) {
      if (!pjson.dependencies![lib] && !pjson.devDependencies![lib]) continue
      delete pjson.dependencies![lib]
      delete pjson.devDependencies![lib]
      log(scope, 'removed', lib)
    }

    pjson.devDependencies!['@salesforce/cli-plugins-testkit'] = '^5.0.0-dev.1'

    if (pjson.oclif.commands) {
      pjson.oclif.flexibleTaxonomy = true
      log(scope, 'added', 'oclif.flexibleTaxonomy')
    }

    pjson.oclif.topicSeparator = ' '
    log(scope, 'added', 'oclif.topicSeparator')

    pjson.files = [...(pjson.files ?? []), '/oclif.lock']
    pjson.engines.node = '>=18.0.0'

    if (pjson.author !== 'Salesforce') {
      pjson.author = 'Salesforce'
      log(scope, 'updated', 'author: Salesforce')
    }

    log(scope, 'updated', 'oclif.lock to files')
    log(scope, 'updated', 'engines.node to >=18.0.0')

    pjson.keywords = [...new Set([...(pjson.keywords ?? []), 'sf', 'sf-plugin'])].sort()
    log(scope, 'updated', 'keywords')

    if (pjson.oclif.bin) {
      pjson.oclif.bin = 'sf'
    }

    log(scope, 'updated', 'oclif.bin')

    await writeJSON('package.json', pjson)
    return pjson
  }

  private async updateTestStuff() {
    const mochaRc = await readJSON<{'node-option': string[]; require: string | string[]}>('.mocharc.json')
    mochaRc.require = ['ts-node/register']
    mochaRc['node-option'] = dedupe([...(mochaRc['node-option'] ?? []), 'loader=ts-node/esm'])
    log('.mocharc.json', 'updated', 'require')
    log('.mocharc.json', 'updated', 'node-option=loader=ts-node/esm')
    await writeJSON('.mocharc.json', mochaRc)

    const tsConfig = await readJSON<Interfaces.TSConfig & {extends: string}>(join('test', 'tsconfig.json'))
    tsConfig.extends = '@salesforce/dev-config/tsconfig-test-strict-esm'

    await writeJSON(join('test', 'tsconfig.json'), tsConfig)

    try {
      await rm(join('test', 'helpers', 'init.js'), {force: true, recursive: true})
      log('test', 'removed', join('helpers', 'init.js'))

      const files = await readdir(join('test', 'helpers'))
      if (files.length === 0) {
        await rm(join('test', 'helpers'), {force: true, recursive: true})
      }
    } catch {}
  }

  private async updateTsConfig(): Promise<Interfaces.TSConfig> {
    const tsConfig = await readJSON<Interfaces.TSConfig & {extends: string}>('tsconfig.json')
    tsConfig.extends = '@salesforce/dev-config/tsconfig-strict-esm'

    await writeJSON('tsconfig.json', tsConfig)
    return tsConfig
  }
}
