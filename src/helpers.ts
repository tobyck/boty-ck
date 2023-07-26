import type { Chat, Message } from "whatsapp-web.js";
import { writeFileSync, readFileSync, existsSync } from "fs";

export const randomChoice = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

export const hyphenateForURL = (str: string) => str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/\.'/g, "");

export const removeStyling = (str: string) => str
    .replace(/\*([^ ]+)\*/g, "$1")
    .replace(/_([^ ]+)_/g, "$1")
    .replace(/~([^ ]+)~/g, "$1")
    .replace(/```([^ ]+)```/g, "$1");

export const nthLast = (arr: any[], n: number) => arr[arr.length - n];
export const pluralS = (n: number) => n === 1 ? "" : "s";
export const padTwo0s = (num: number) => num.toString().padStart(2, "0");

export const pleaseSetTeam = (chat: Chat) => chat.sendMessage(
    "*[bot]* Please specify a team using *!ulti/set team <your team name>*. Note: if you still don't see what you expect, there may be multiple teams with your name. If this is case, find your team on ultimate.org.nz and set your team using what appears in the URL (you should see something like ultimate.org.nz/t/epic-team-name-3)."
);

export const fromAdmin = async (message: Message): Promise<boolean> => {
    const permissions = JSON.parse(readFileSync("permissions.json", "utf8"));
    const sender = await message.getContact();
    return message.fromMe || permissions.otherAdmins.includes(sender.id.user);
}