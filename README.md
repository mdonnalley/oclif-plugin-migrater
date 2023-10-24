oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g oclif-plugin-migrater
$ oclif-plugin-migrater COMMAND
running command...
$ oclif-plugin-migrater (--version)
oclif-plugin-migrater/0.0.0 darwin-arm64 node-v18.15.0
$ oclif-plugin-migrater --help [COMMAND]
USAGE
  $ oclif-plugin-migrater COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oclif-plugin-migrater hello PERSON`](#oclif-plugin-migrater-hello-person)
* [`oclif-plugin-migrater hello world`](#oclif-plugin-migrater-hello-world)
* [`oclif-plugin-migrater help [COMMANDS]`](#oclif-plugin-migrater-help-commands)
* [`oclif-plugin-migrater plugins`](#oclif-plugin-migrater-plugins)
* [`oclif-plugin-migrater plugins:install PLUGIN...`](#oclif-plugin-migrater-pluginsinstall-plugin)
* [`oclif-plugin-migrater plugins:inspect PLUGIN...`](#oclif-plugin-migrater-pluginsinspect-plugin)
* [`oclif-plugin-migrater plugins:install PLUGIN...`](#oclif-plugin-migrater-pluginsinstall-plugin-1)
* [`oclif-plugin-migrater plugins:link PLUGIN`](#oclif-plugin-migrater-pluginslink-plugin)
* [`oclif-plugin-migrater plugins:uninstall PLUGIN...`](#oclif-plugin-migrater-pluginsuninstall-plugin)
* [`oclif-plugin-migrater plugins:uninstall PLUGIN...`](#oclif-plugin-migrater-pluginsuninstall-plugin-1)
* [`oclif-plugin-migrater plugins:uninstall PLUGIN...`](#oclif-plugin-migrater-pluginsuninstall-plugin-2)
* [`oclif-plugin-migrater plugins update`](#oclif-plugin-migrater-plugins-update)

## `oclif-plugin-migrater hello PERSON`

Say hello

```
USAGE
  $ oclif-plugin-migrater hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/mdonnalley/oclif-plugin-migrater/blob/v0.0.0/dist/commands/hello/index.ts)_

## `oclif-plugin-migrater hello world`

Say hello world

```
USAGE
  $ oclif-plugin-migrater hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oclif-plugin-migrater hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [dist/commands/hello/world.ts](https://github.com/mdonnalley/oclif-plugin-migrater/blob/v0.0.0/dist/commands/hello/world.ts)_

## `oclif-plugin-migrater help [COMMANDS]`

Display help for oclif-plugin-migrater.

```
USAGE
  $ oclif-plugin-migrater help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for oclif-plugin-migrater.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.19/src/commands/help.ts)_

## `oclif-plugin-migrater plugins`

List installed plugins.

```
USAGE
  $ oclif-plugin-migrater plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ oclif-plugin-migrater plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.7.0/src/commands/plugins/index.ts)_

## `oclif-plugin-migrater plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ oclif-plugin-migrater plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ oclif-plugin-migrater plugins add

EXAMPLES
  $ oclif-plugin-migrater plugins:install myplugin 

  $ oclif-plugin-migrater plugins:install https://github.com/someuser/someplugin

  $ oclif-plugin-migrater plugins:install someuser/someplugin
```

## `oclif-plugin-migrater plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ oclif-plugin-migrater plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ oclif-plugin-migrater plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.7.0/src/commands/plugins/inspect.ts)_

## `oclif-plugin-migrater plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ oclif-plugin-migrater plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ oclif-plugin-migrater plugins add

EXAMPLES
  $ oclif-plugin-migrater plugins:install myplugin 

  $ oclif-plugin-migrater plugins:install https://github.com/someuser/someplugin

  $ oclif-plugin-migrater plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.7.0/src/commands/plugins/install.ts)_

## `oclif-plugin-migrater plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ oclif-plugin-migrater plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ oclif-plugin-migrater plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.7.0/src/commands/plugins/link.ts)_

## `oclif-plugin-migrater plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ oclif-plugin-migrater plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oclif-plugin-migrater plugins unlink
  $ oclif-plugin-migrater plugins remove
```

## `oclif-plugin-migrater plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ oclif-plugin-migrater plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oclif-plugin-migrater plugins unlink
  $ oclif-plugin-migrater plugins remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.7.0/src/commands/plugins/uninstall.ts)_

## `oclif-plugin-migrater plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ oclif-plugin-migrater plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oclif-plugin-migrater plugins unlink
  $ oclif-plugin-migrater plugins remove
```

## `oclif-plugin-migrater plugins update`

Update installed plugins.

```
USAGE
  $ oclif-plugin-migrater plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.7.0/src/commands/plugins/update.ts)_
<!-- commandsstop -->
