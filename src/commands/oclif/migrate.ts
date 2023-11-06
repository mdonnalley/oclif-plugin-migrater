/* eslint-disable no-await-in-loop */
import {Command, Interfaces, ux} from '@oclif/core'
import chalk from 'chalk'
import {exec as cpExec} from 'node:child_process'
import {existsSync} from 'node:fs'
import {cp, readFile, rm, writeFile} from 'node:fs/promises'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
// @ts-expect-error because no types
import sort from 'sort-pjson'

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
  private templateDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'files')
  public async run(): Promise<void> {
    const tsConfig = await this.updateTsConfig()
    await this.updatePackageJson(tsConfig)

    await exec('yarn')

    await this.updateGit2Gus()
    await this.updateGithub()
    await this.addConfigFiles()
    await this.updateGitIgnore()
    await this.addHuskyHooks()
    await this.updateTestStuff()
    await this.updateBinScripts()

    this.log(`${chalk.green.bold('SUCCESS')}\n`)
    this.log(`${chalk.bold('TODO')}:`)
    this.log('• Update imports to include .js extension')
    this.log('• Update fancy tests to new stubbing style')
    this.log('• Add `oclif lock` to the appropriate script(s) in package.json')
    this.log('• Remove any dead README badges')
    this.log('• Update code to pass updated linting rules')
  }

  private async addConfigFiles() {
    const toAdd = [
      '.commitlintrc.template.json',
      '.lintstagedrc.template.json',
      '.prettierrc.template.json',
      '.eslintrc.template.json',
    ]
    for (const file of toAdd) {
      log('config', 'added', file.replace('.template', ''))
      await cp(join(this.templateDir, file), file.replace('.template', ''))
    }

    const toDelete = ['.editorconfig', '.eslintrc']

    for (const file of toDelete) {
      log('config', 'removed', file)
      await rm(file, {force: true})
    }
  }

  private async addHuskyHooks() {
    const files = ['pre-commit.template', 'commit-msg.template']

    for (const file of files) {
      log('husky', 'added', join('.husky', file.replace('.template', '')))
      await cp(join(this.templateDir, file), join('.husky', file.replace('.template', '')))
    }
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

  private async updateGit2Gus(): Promise<void> {
    if (existsSync('git2gus')) {
      await rm('git2gus', {force: true, recursive: true})
    }

    if (existsSync('.git2gus')) {
      const git2gus = await readJSON<{defaultBuild: string}>(join('.git2gus', 'config.json'))
      log('.git2gus', 'updated', 'defaultBuild: offcore.tooling.59')
      await writeJSON(join('.git2gus', 'config.json'), {
        ...git2gus,
        defaultBuild: 'offcore.tooling.59',
      })
    }
  }

  private async updateGithub() {
    await rm('.github', {force: true, recursive: true})
    log('.github', 'updated', 'workflows')
    await cp(join(this.templateDir, 'github'), '.github', {recursive: true})
  }

  private async updateGitIgnore() {
    const gitIgnore = await readFile('.gitignore', 'utf8')
    const lines = gitIgnore.split('\n')
    lines.push('oclif.lock', 'oclif.manifest.json')
    const deduped = dedupe(lines)
    log('.gitignore', 'added', 'oclif.lock', 'oclif.manifest.json')
    await writeFile('.gitignore', deduped.join('\n'))
  }

  private async updatePackageJson(tsConfig: Interfaces.TSConfig): Promise<Interfaces.PJSON.Plugin> {
    const scope = 'package.json'
    const pjson = await readJSON<Interfaces.PJSON.Plugin>('package.json')

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
      '@commitlint/config-conventional',
      '@oclif/prettier-config',
      '@oclif/test',
      'commitlint',
      'eslint-config-oclif-typescript',
      'eslint-config-oclif',
      'eslint-config-prettier',
      'eslint',
      'husky',
      'lint-staged',
      'mocha',
      'oclif',
      'prettier',
      'ts-node',
      'typescript',
    ]

    const optionalDevLibs = ['sinon', 'fancy-test', '@types/node', '@types/mocha']

    const prodLibs = ['@oclif/core', 'chalk', 'inquirer', 'got']

    const removeLibs = ['tslib', '@oclif/config', '@oclif/command', '@oclif/error', '@oclif/parser', '@oclif/help']

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

    if (pjson.oclif.commands) {
      pjson.oclif.flexibleTaxonomy = true
      log(scope, 'added', 'oclif.flexibleTaxonomy')
    }

    pjson.oclif.topicSeparator = ' '
    log(scope, 'added', 'oclif.topicSeparator')

    pjson.files = [...(pjson.files ?? []), '/oclif.lock']
    pjson.engines.node = '>=18.0.0'
    pjson.scripts.prepare = 'husky install'
    pjson.scripts.lint = 'eslint . --ext .ts'

    if (pjson.author !== 'Salesforce') {
      pjson.author = 'Salesforce'
      log(scope, 'updated', 'author: Salesforce')
    }

    log(scope, 'updated', 'oclif.lock to files')
    log(scope, 'updated', 'engines.node to >=18.0.0')
    log(scope, 'added', 'prepare script')
    log(scope, 'updated', 'lint script')
    await writeJSON('package.json', sort(pjson))
    return pjson
  }

  private async updateTestStuff() {
    const mochaRc = await readJSON<{'node-option': string[]; require: string | string[]}>('.mocharc.json')
    mochaRc.require = ['ts-node/register']
    mochaRc['node-option'] = dedupe([...(mochaRc['node-option'] ?? []), 'loader=ts-node/esm'])
    log('.mocharc.json', 'updated', 'require')
    log('.mocharc.json', 'updated', 'node-option=loader=ts-node/esm')
    await writeJSON('.mocharc.json', mochaRc)

    const tsConfig = {
      extends: '../tsconfig',
      include: ['./**/*', '../src/**/*'],
    }

    await writeJSON(join('test', 'tsconfig.json'), tsConfig)

    try {
      await rm(join('test', 'helpers'), {force: true, recursive: true})
      log('test', 'removed', join('helpers', 'init.js'))
    } catch {}
  }

  private async updateTsConfig(): Promise<Interfaces.TSConfig> {
    const tsConfig = await readJSON<Interfaces.TSConfig>('tsconfig.json')

    tsConfig.compilerOptions.module = 'Node16'
    tsConfig.compilerOptions.moduleResolution = 'Node16'
    tsConfig.compilerOptions.target = 'ES2022'
    tsConfig['ts-node'] = {
      ...tsConfig['ts-node'],
      esm: true,
      // scope: true,
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete tsConfig.compilerOptions.importHelpers
    delete tsConfig.compilerOptions.esModuleInterop

    log('tsconfig.json', 'updated', 'compilerOptions.module to Node16')
    log('tsconfig.json', 'updated', 'compilerOptions.moduleResolution to Node16')
    log('tsconfig.json', 'updated', 'compilerOptions.target to ES2022')
    log('tsconfig.json', 'updated', 'ts-node.esm to true')
    log('tsconfig.json', 'removed', 'compilerOptions.importHelpers')
    log('tsconfig.json', 'removed', 'compilerOptions.esModuleInterop')

    await writeJSON('tsconfig.json', tsConfig)
    return tsConfig
  }
}
