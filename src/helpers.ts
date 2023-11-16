import type { Chat, Message, MessageSendOptions } from "whatsapp-web.js";
import { readFileSync } from "fs";

export const randomChoice = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

export const hyphenateForURL = (str: string): string => str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/\.'/g, "");

export const removeStyling = (str: string): string => str
    .replace(/\*([^ ]+)\*/g, "$1")
    .replace(/_([^ ]+)_/g, "$1")
    .replace(/~([^ ]+)~/g, "$1")
    .replace(/```([^ ]+)```/g, "$1");

export const last = <T extends { length: number }>(
    iterable: T
): T extends (infer ElType)[] ? ElType : string => iterable[iterable.length - 1];

export const pluralS = (n: number) => n === 1 ? "" : "s";

export const padTwo0s = (num: number) => num.toString().padStart(2, "0");

export const parseArgs = (str: string): string[] => {
    // this can probably be done with a regex but too bad

    const args: string[] = [];
    let state: "string" | "other" = null;
    let startedWith: "'" | "\"" = null; // what the string started with

    for (const char of str) {
        if (state === null && char !== " ") {
            if ("'\"".includes(char)) {
                args.push("");
                startedWith = char as "'" | "\"";
                state = "string";
            } else {
                args.push(char);
                state = "other";
            }
        } else if (state === "string") {
            if (char === startedWith) {
                if (last(last(args)) !== "\\" || last(args).slice(-2) === "\\\\") {
                    state = null;
                    startedWith = null;
                }
            }
            else args[args.length - 1] += char;
        } else {
            if (char === " ") state = null;
            else args[args.length - 1] += char;
        }
    }

    return args;
};

export const pleaseSetTeam = (chat: Chat) => sendMessage(
    chat, "Please specify a team using *!ulti/set team to <your team name>*. Note: if you still don't see what you expect, there may be multiple teams with your name. If this is case, find your team on ultimate.org.nz and set your team using what appears in the URL (you should see something like ultimate.org.nz/t/epic-team-name-3)."
);

export const fromAdmin = async (message: Message): Promise<boolean> => {
    const permissions = JSON.parse(readFileSync("permissions.json", "utf8"));
    const sender = await message.getContact();
    return message.fromMe || permissions.otherAdmins.includes(sender.id.user);
};

export const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessage = async (chat: Chat, message: string, replyTo?: Message, options: MessageSendOptions = {}) => {
    const prefixedMessage = "*[bot]* " + message;
    if (replyTo) return await replyTo.reply(prefixedMessage, chat.id._serialized, options);
    else return await chat.sendMessage(prefixedMessage, options);
};