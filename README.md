# Boty C-K

## Contents

- [Boty C-K](#boty-c-k)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Commands](#commands)
    - [Basic](#basic)
    - [Ultimate Frisbee `!ulti/`](#ultimate-frisbee-ulti)
    - [Admin `!admin/`](#admin-admin)
  - [Contributing](#contributing)

## Overview

This is my WhatsApp bot built with an awesome library called [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) by [pedroslopez](https://github.com/pedroslopez) which uses [Puppeteer](https://pptr.dev/) to run a real instance of Whatsapp Web in a headless browser. It's mostly being used to organise my ultimate frisbee team at the moment, but it may expand for other purposes. The status responses are mostly taken from [VyxalBot](https://github.com/Vyxal/VyxalBot2).

If you're here to set up an instance of your own, keep reading the next section. If you need some help with usage you can skip to [here](#basic-usage).

## Installation

In theory, you should only need to do:

```bash
git clone https://github.com/tobyck/boty-ck.git
cd boty-ck
yarn install
yarn start
```

but there were a few things which went wrong while trying to set it up on an Oracle Cloud VM. These are some notes to self in case I have to set it up again:

- `dnf install nodejs` installed an older version of Node.js, so it needs updating for Puppeteer:

    ```bash
    npm install n -g
    n stable
    ```

- Puppeteer required some extra dependencies for Chrome which can be added with:

    ```bash
    curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
    sudo yum -y localinstall google-chrome-stable_current_x86_64.rpm
    ```

- To keep the bot after disconnecting from the VM:

    ```bash
    yarn start &  # Start job in background
                  # To return to the shell, press Enter once the client is ready
    disown        # Prevent SIGHUP
                  # You can now close the session
    ```

- To kill the bot manually you need to find the process ID:

    ```bash
    ps aux | grep boty-ck.js
    kill <PID>
    ```

## Basic Usage

All commands start with `!`, are case-insensitive and will work in any chat that the owner of the bot is in (unless you were banned or the command has security restrictions). All commands are part of a collection, which is a group of related commands. When you run a command, you specify which collection the command is in directly after the `!`, then type a `/` followed by the command. For example, to see when the next frisbee game is, you can use `!ulti/next` (note that this specific command needs some configuration. See the documentation [here](#ultimate-frisbee-ulti)). In this example, `ulti` is the collection and `next` is the command.

Collections can also have properties. Not all collections have these, but you can check by running the collections help command (`!<collection name here>/help`) to see if the `get` and `set` commands are available. These commands allow you to create and access properties which are only available in the chat and collection they were created in, and can effect how other commands behave.

For example, the `!ulti/next` command (as well as others in the `ulti` collection) needs to know which team to get information for, so we specify this by putting a team name in a property. We do this by saying `!ulti/set team to <your team name here>`. After running this, `!ulti/next` should work as expected.

One last thing: there's also the base collection. This is used for general commands that don't fit in to a category, and doesn't require specifying a collection name. For example, `!help` and `!everyone`. Ok, now you can read through all the commands...

> [!NOTE]
> If the bot didn't respond to your command, you may have sent too many messages in succession. The both has a 3-second cooldown to prevent spamming.

## Commands

### Basic

| Command/Syntax                                | Description                                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `!status`                                     | Tells you what the bot is doing right now                                                                                          |
| `!everyone`                                   | Pings everyone in the group chat                                                                                                   |
| `!cookie`                                     | Gives you a cookie (with a 10% of being denied)                                                                                    |
| `!automate <command> every <day> <time>, ...` | Automates a command on certain days and times. Only works on full hours, e.g. `!automate !status every tuesday 5pm` (not `5:30pm`) |
| `!automations`                                | Shows all active automations, when they run, and their IDs for deletion                                                            |
| `!unautomate <automation id>`                 | Removes an automation given an its ID which can be found with `!automations`                                                       |
| `!help`                                       | Shows a summary of all commands in this collection                                                                                 |

### Ultimate Frisbee `!ulti/`

All game information is retrieved from [Ultimate Central](https://ultimatecentral.com/) or derivatives.

| Command/Syntax                    | Description                                                                                                                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `!ulti/score`                     | Tells you the score of your last game. Needs the `team` to be set (and so do the next 3 commands)                                                                                                                |
| `!ulti/next`                      | Gives you details about your next game: time, location, field number, etc                                                                                                                                        |
| `!ulti/spirit`                    | Tells you your spirit score from your last game                                                                                                                                                                  |
| `!ulti/ranking`                   | Tells you where you are ranked in relation to others in the event specified in the `event` property                                                                                                              |
| `!ulti/who`                       | Asks who's playing in the next game. People can react with 👍 or 😥😢                                                                                                                                               |
| `!ulti/numbers`                   | Uses the last message from `!ulti/who` to tell you how many people are coming, how many subs you'll have, or how many more people you need. Team size defaults to 7 but can changed with the `teamsize` property |
| `!ulti/set <property> to <value>` | Set property to specified value in this collection only                                                                                                                                                          |
| `!ulti/get <property>`            | Tells you the value of the property specified                                                                                                                                                                    |
| `!ulti/unset <property>`          | Removes the specified property                                                                                                                                                                                   |
| `!ulti/help`                      | Shows a summary of all commands in this collection                                                                                                                                                               |

### Admin `!admin/`

These commands can only be used by the bot owner or other group members who the owner grants admin permissions.

| Command/Syntax                         | Description                                                                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `!admin/allow/user <phone number>`     | Allows a user to use the bot (un-ban a user)                                                                                                                                                                                                                   |
| `!admin/disallow/user <phone number>`  | Bans a user from using the bot (but keeps them in the chat)                                                                                                                                                                                                    |
| `!admin/allow/admin <phone number>`    | Grant a user admin permissions                                                                                                                                                                                                                                 |
| `!admin/disallow/admin <phone number>` | Revoke a user's admin permissions                                                                                                                                                                                                                              |
| `!admin/session/new`                   | Reset all session data                                                                                                                                                                                                                                         |
| `!admin/session/save`                  | Write all session and permissions data to files (this is automatically done when the bot is restarts/dies)                                                                                                                                                     |
| `!admin/session/load`                  | Load session data from file into session object                                                                                                                                                                                                                |
| `!admin/die`                           | Kills the bot (not the admin lol)                                                                                                                                                                                                                              |
| `!admin/sleep`                         | Puts the bot to sleep. From a technical point of view, the bot is still running but it won't respond to anything. Useful for when managing/testing multiple instances.                                                                                         |
| `!admin/wake`                          | Wakes up the bot after being put to sleep with `!admin/sleep`                                                                                                                                                                                                  |
| `!admin/restart`                       | Restarts the bot. This kills the current bot process and starts a new one, so a new QR code is sent to the owner. This expires one minute after being generated and can take some time to be sent, so be ready! (You will be notified if the QR code expires). |
| `!admin/update`                        | Pulls the latest changes from GitHub onto the server hosting the bot. This does *not* restart the bot so the changes will only take effect after the bot is restarted.                                                                                         |
| `!admin/help`                          | Shows a summary of all commands in this collection                                                                                                                                                                                                             |

## Contributing

If you've found a bug, please raise an issue on GitHub [here](https://github.com/tobyck/boty-ck/issues) and I'll hopefully fix it at some point[^1]. If you don't have a GitHub account, or you can't be bothered to click a few buttons and make one, contact me somewhere else. If you have a feature request, do the same thing, or if you'd like to implement something yourself, do the following:

1. Fork this repository
2. Make sure you have [Node.js](https://nodejs.org/en) and [Yarn](https://yarnpkg.com/) installed
3. Run `yarn install` to install dependencies
4. Make and test your changes (you can use `yarn add-cmd <collection> <name> [arg syntax]` to generate the boilerplate for a command in the right file)
5. Run `yarn lint` to fix any formatting errors, `yarn run check` to check for any type errors that weren't picked up by Parcel's parser, then `yarn build` to generate an optimised bundle with [Parcel](https://parceljs.org) (use `yarn watch` for incremental compilation during development)
6. Add any necessary documentation
7. Submit a PR

Thank you!

[^1]: maybe...