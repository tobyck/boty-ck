import fs from "fs";
import { readFile } from "fs/promises";
import process from "node:process";
import { spawn } from "child_process";

import { Collection, Command, NiladicCommand, VariadicCommand } from "../core";
import { fromAdmin, randomChoice, sendMessage } from "../helpers";
import { client, permissions, session } from "../bot";
import { Session } from "../session";

const responses: {
    statuses: Record<string, string[]>,
    death: string[],
    restart: string[],
    sleep: string[],
    awake: string[]
} = JSON.parse(fs.readFileSync("./responses.json", "utf8"));

const adminCollection = new Collection(
    "admin",
    "This collection contains commands which can only be used by the owner of the bot.",
);

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "update", null,
    async (chat, message) => {
        if (!await fromAdmin(message)) return;

        const childProc = spawn("git", "pull origin master".split(" "), {
            detached: true,
            stdio: [null, "ignore", fs.openSync("./stderr.log", "a")]
        });

        childProc.on("exit", async exitCode => {
            if (exitCode === 0) {
                await sendMessage(chat, "Latest changes have been pulled from GitHub and merged successfully. Use *!admin/restart* to put these changes into effect.", message);
            } else {
                await sendMessage(chat, "Something went wrong while trying to update. My owner can check the server for more details.", message);
            }
        });
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "restart", null,
    async (chat, message) => {
        // only allow the owner to restart the bot
        if (!message.fromMe) return;

        await sendMessage(chat, "I'm currently being restarted. My owner will be sent a QR code to bring me back online and will have 1 minute to scan it on web.whatsapp.com.");

        const stdout = fs.openSync("./stdout.log", "a");
        const stderr = fs.openSync("./stderr.log", "a");

        fs.writeFileSync("./stdout.log", "");
        fs.writeFileSync("./stderr.log", "");

        const childProc = spawn("nohup", ["yarn", "start", randomChoice(responses.restart)], {
            detached: true,
            stdio: [null, stdout, stderr] // null for stdin as we don't need it
        });

        let gotQrCode = false;

        const QR_CODE_HEIGHT = 29;

        const interval = setInterval(() => {
            readFile("./stdout.log", "utf8").then(async data => {
                const stdoutLines = data.split("\n");

                if (stdoutLines.length >= QR_CODE_HEIGHT && !gotQrCode) {
                    // send the qr code to the bot owner
                    await sendMessage(await client.getChatById(message.from), `Scan this to restart the bot:\n\`\`\`${stdoutLines.slice(-QR_CODE_HEIGHT - 1, -1).join("\n")}\`\`\``);

                    gotQrCode = true;
                }

                // if a second qr code is found, timeout
                if (stdoutLines.length >= QR_CODE_HEIGHT * 2) {
                    await sendMessage(chat, "QR code has expired. Please try again.");
                    childProc.kill();
                    clearInterval(interval);
                }

                // once the new bot is ready we can kill the old one
                if (stdoutLines.some(line => line.includes("Client is ready"))) {
                    await client.destroy();
                    clearInterval(interval);
                    process.exit(0);
                }
            });
        }, 4000);

        childProc.on("error", async err => {
            await sendMessage(chat, "Something went wrong while trying to restart. My owner can check the server for more details.");
            throw err;
        });
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "wake", null,
    async (chat, message) => {
        if (!await fromAdmin(message)) return;

        await sendMessage(chat, `${randomChoice(responses.awake)}`);

        globalThis.awake = true;
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "sleep", null,
    async (chat, message) => {
        if (!await fromAdmin(message)) return;

        await sendMessage(chat, `${randomChoice(responses.sleep)}`);

        globalThis.awake = false;
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "die", null,
    async (chat, message) => {
        if (!await fromAdmin(message)) return;

        await sendMessage(chat, `${randomChoice(responses.death)}`);
        // wait a second before disconnecting because chat.sendMessage is weird
        setTimeout(client.destroy.bind(client), 1000);
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "session/load", null,
    async (_, message) => {
        if (!await fromAdmin(message)) return;

        session.load();
        permissions.load();
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "session/save", null,
    async (_, message) => {
        if (!await fromAdmin(message)) return;

        session.save();
        permissions.save();
    }
));

adminCollection.commands.unshift(new Command<NiladicCommand>(
    "session/new", null,
    async (chat, message) => {
        if (!await fromAdmin(message)) return;

        session.data = Session.blankSession();

        await sendMessage(chat, "Current session data has been cleared.");
    }
));

adminCollection.commands.unshift(new Command<VariadicCommand>(
    "disallow/admin", "<phone number>",
    async (chat, phoneNumber, message) => {
        if (!await fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/\D/)) {
            await sendMessage(chat, "Please enter a valid phone number.", message);
            return;
        }

        permissions.otherAdmins.delete(phoneNumber);

        await sendMessage(chat, `${phoneNumber} has had their admin privileges revoked.`);
    }
));

adminCollection.commands.unshift(new Command<VariadicCommand>(
    "allow/admin", "<phone number>",
    async (chat, phoneNumber, message) => {
        if (!await fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/\D/)) {
            await sendMessage(chat, "Please enter a valid phone number.", message);
            return;
        }

        permissions.otherAdmins.add(phoneNumber);

        await sendMessage(chat, `${phoneNumber} has been given admin privileges.`);
    }
));

adminCollection.commands.unshift(new Command<VariadicCommand>(
    "disallow/user", "<phone number>",
    async (chat, phoneNumber, message) => {
        if (!await fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/\D/)) {
            await sendMessage(chat, "Please enter a valid phone number.", message);
            return;
        }

        // ignore if trying to ban the owner
        const ownerPhoneNumber = client.info.wid.user;
        if (ownerPhoneNumber === phoneNumber) return;

        permissions.banned.add(phoneNumber);

        await sendMessage(chat, `${phoneNumber} has been banned.`);
    }
));

adminCollection.commands.unshift(new Command<VariadicCommand>(
    "allow/user", "<phone number>",
    async (chat, phoneNumber, message) => {
        if (!await fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/\D/)) {
            await sendMessage(chat, "Please enter a valid phone number.", message);
            return;
        }

        permissions.banned.delete(phoneNumber);

        await sendMessage(chat, `${phoneNumber} has been unbanned.`);
    }
));

export default adminCollection;