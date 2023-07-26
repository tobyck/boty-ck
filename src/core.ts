import type { Chat, Message } from "whatsapp-web.js";
import { session } from "./bot";
import { Session } from "./session";

// type for Command.func
type CommandFunction = (
    message: Message,
    args?: string,
    collection?: Collection
) => Promise<void>;

export class Command {
    name: string;
    params: string[];
    desc: string;

    // function for the command to run
    func: CommandFunction;

    constructor(name: string, params: string[], desc: string, func: CommandFunction) {
        this.name = name;
        this.params = params;
        this.desc = desc;
        this.func = func;
    }
}

export class Collection {
    name: string;
    desc: string;
    commands: Command[] = [];

    constructor(name: string, desc: string, hasProps = false) {
        this.name = name;
        this.desc = desc;

        // if the collection has properties, add the set, unset, and get commands
        if (hasProps) {
            this.commands.push(new Command(
                "set", ["property", "value"],
                "Set a property of this collection",
                async (message, args) => {
                    const [prop, value] = args!.split(/\s(.*)/s);

                    const chat = await message.getChat();

                    if (!prop) { // if no property is specified
                        chat.sendMessage("*[bot]* Please specify a property to set.");
                        return;
                    } else if (!value) { // if no value is specified
                        chat.sendMessage("*[bot]* Please specify a value to set the property to.");
                        return;
                    }

                    // otherwise all args have been provided, so set the property
                    this.props(session, chat).set(prop, value);

                    // notify the user that the property has been set
                    chat.sendMessage(`*[bot]* Property "${prop}" set to "${value}".`);
                }
            ));

            this.commands.push(new Command(
                "unset", ["property"],
                "Remove a property",
                async (message, arg) => {
                    const chat = await message.getChat();

                    if (arg) { // if a property is specified
                        if (this.props(session, chat).has(arg)) { // if the property exists
                            this.props(session, chat).delete(arg!); // delete it
                            chat.sendMessage(`*[bot]* Property "${arg}" removed.`);
                        } else {
                            chat.sendMessage(`*[bot]* Property "${arg}" not found.`);
                        }
                    } else {
                        chat.sendMessage("*[bot]* Please specify a property to remove.");
                    }
                }
            ));

            this.commands.push(new Command(
                "get", ["property"],
                "Get a property",
                async (message, arg) => {
                    const chat = await message.getChat();

                    if (!arg) {
                        chat.sendMessage("*[bot]* Please specify a property to get.");
                    } else if (this.props(session, chat).get(arg)) {
                        chat.sendMessage(`*[bot]* ${this.props(session, chat).get(arg)}`);
                    } else {
                        chat.sendMessage(`*[bot]* Property "${arg}" not found.`);
                    }
                }
            ));
        }

        // add a help command to every collection
        this.commands.push(new Command(
            "help", [],
            "Show this message",
            async message => {
                let helpMessage = `*[bot]* ${this.desc}\n\n`;

                helpMessage += this.commands.map(command => {
                    let ret = "";

                    // add command name
                    if (this.name === "base") {
                        ret += `*!${command.name}`;
                    } else {
                        ret += `*!${this.name}/${command.name}`;
                    }

                    // add params if there are any
                    if (command.params.length > 0) {
                        ret += ` ${command.params.map(param => `<${param}>`).join(" ")}`;
                    }

                    // add closing asterisk for bold
                    ret += "*";

                    // add description
                    ret += ` - ${command.desc}`;

                    return ret;
                }).join("\n");

                if (this.name === "base") {
                    helpMessage += "\n\nI also have other \"collections\" of commands. To see the commands in a certain collection, use *!<collection>/help*.";
                }

                const chat = await message.getChat();
                chat.sendMessage(helpMessage);
            }
        ));
    }

    // get the map object for the props of this collection given the session and chat
    props(session: Session, chat: Chat): Map<string, string> {
        session.tryInitChatData(chat.name);

        session.data.chats[chat.name].props[this.name] ??= new Map<string, string>();

        return session.data.chats[chat.name].props[this.name];
    }
}