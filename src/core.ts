import type { Chat, Message } from "whatsapp-web.js";
import { session } from "./bot";
import { parseArgs, sendMessage } from "./helpers";
import { Session } from "./session";

export type NiladicCommand = (
    chat: Chat,
    message?: Message,
) => Promise<void>;

export type VariadicCommand = (
    chat: Chat,
    args: string,
    message?: Message,
) => Promise<void>;

type CommandFunc = NiladicCommand | VariadicCommand;

export class Command<T extends CommandFunc> {
    name: string;
    argSyntax: string; // used in the help command and also to determine arity at runtime
    func: T; // function for the command to run

    constructor(name: string, argSyntax: string, func: T) {
        this.name = name;
        this.argSyntax = argSyntax;
        this.func = func;
    }
}

export class Collection {
    name: string;
    desc: string;
    commands: Command<CommandFunc>[] = [];

    constructor(name: string, desc: string, hasProps = false) {
        this.name = name;
        this.desc = desc;

        // if the collection has properties, add the set, unset, and get commands
        if (hasProps) {
            this.commands.push(new Command<VariadicCommand>(
                "set", "<property> to <value>",
                async (chat, args) => {
                    const parsedArgs = parseArgs(args);
                    const prop = parsedArgs[0];

                    if (parsedArgs[1] !== "to") {
                        await sendMessage(chat, "Invalid syntax. Please use *!set <property> to <value>*.");
                        return;
                    }

                    const value = parsedArgs.slice(2).join(" ");

                    if (!prop) { // if no property is specified
                        await sendMessage(chat, "Please specify a property to set.");
                        return;
                    } else if (!value) { // if no value is specified
                        await sendMessage(chat, "Please specify a value to set the property to.");
                        return;
                    }

                    // otherwise all args have been provided, so set the property
                    this.props(session, chat).set(prop, value);

                    // notify the user that the property has been set
                    await sendMessage(chat, `Property "${prop}" set to "${value}".`);
                }
            ));

            this.commands.push(new Command<VariadicCommand>(
                "unset", "<property>",
                async (chat, arg) => {
                    if (arg) { // if a property is specified
                        if (this.props(session, chat).has(arg)) { // if the property exists
                            this.props(session, chat).delete(arg!); // delete it
                            await sendMessage(chat, `Property "${arg}" removed.`);
                        } else {
                            await sendMessage(chat, `Property "${arg}" not found.`);
                        }
                    } else {
                        await sendMessage(chat, "Please specify a property to remove.");
                    }
                }
            ));

            this.commands.push(new Command<VariadicCommand>(
                "get", "<property>",
                async (chat, arg) => {
                    if (!arg) {
                        await sendMessage(chat, "Please specify a property to get.");
                    } else if (this.props(session, chat).get(arg)) {
                        await sendMessage(chat, `${this.props(session, chat).get(arg)}`);
                    } else {
                        await sendMessage(chat, `Property "${arg}" not found.`);
                    }
                }
            ));
        }

        // add a help command to every collection
        this.commands.push(new Command<NiladicCommand>(
            "help", null,
            async chat => {
                let helpMessage = `${this.desc}\n\n`;

                helpMessage += this.commands.map(command => {
                    let ret = "";

                    // add command name
                    if (this.name === "base") ret += `*!${command.name}`;
                    else ret += `*!${this.name}/${command.name}`;

                    // add params if there are any and close bold markdown
                    ret += (command.argSyntax ? " " + command.argSyntax : "") + "*";

                    return ret;
                }).join("\n");

                if (this.name === "base") {
                    helpMessage += "\n\nI also have other \"collections\" of commands. To see the commands in a certain collection, use *!<collection>/help*.";
                }

                await sendMessage(chat, helpMessage);
            }
        ));
    }

    // get the map object for the props of this collection given the session and chat
    props(session: Session, chat: Chat): Map<string, string> {
        session.tryInitChatData(chat.id._serialized);

        session.data.chats[chat.id._serialized].props[this.name] ??= new Map<string, string>();

        return session.data.chats[chat.id._serialized].props[this.name];
    }
}