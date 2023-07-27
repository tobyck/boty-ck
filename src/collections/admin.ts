import fs from "fs";
import { readFile } from "fs/promises";
import { spawn } from "child_process";

import { Collection, Command } from "../core";
import { fromAdmin, randomChoice } from "../helpers";
import { client, permissions, session } from "../bot";
import { Session } from "../session";

const responses = JSON.parse(fs.readFileSync("./responses.json", "utf8"));

const adminCollection = new Collection(
    "admin",
    "This collection contains commands which can only be used by the owner of the bot.",
);

adminCollection.commands.unshift(new Command(
    "new-session", [],
    "Clears current session data",
    async message => {
        if (!fromAdmin(message)) return;

        session.data = Session.blankSession();

        const chat = await message.getChat();
        chat.sendMessage("*[bot]* Current session data has been cleared.");
    }
));

adminCollection.commands.unshift(new Command(
    "force-save", [],
    "Forces the bot to save session data and permissions",
    async message => {
        if (!fromAdmin(message)) return;

        session.save();
        permissions.save();
    }
));

adminCollection.commands.unshift(new Command(
    "update", [],
    "Pulls the latest changes from GitHub",
    async message => {
        if (!fromAdmin(message)) return;

        const childProc = spawn("git", "pull origin master".split(" "), {
            detached: true,
            stdio: [null, "ignore", fs.openSync("./stderr.log", "a")]
        });

        childProc.on("exit", exitCode => {
            if (exitCode === 0) {
                message.reply("*[bot]* Latest changes have been pulled from GitHub and merged successfully. Use *!admin/restart* to put these changes into effect.");
            } else {
                message.reply("*[bot]* Something went wrong while trying to update. My owner can check the server for more details.");
            }
        });
    }
));

adminCollection.commands.unshift(new Command(
    "restart", [],
    "Restarts the bot",
    async message => {
        // only allow the owner to restart the bot
        if (!message.fromMe) return;

        const chat = await message.getChat();

        chat.sendMessage("*[bot]* I'm currently being restarted. My owner will be sent a QR code to bring me back online and will have 1 minute to scan it on web.whatsapp.com.");

        const stdout = fs.openSync("./stdout.log", "a");
        const stderr = fs.openSync("./stderr.log", "a");

        fs.writeFileSync("./stdout.log", "");
        fs.writeFileSync("./stderr.log", "");

        const childProc = spawn("nohup", ["yarn", "start", randomChoice(responses.return)], {
            detached: true,
            stdio: [null, stdout, stderr] // null for stdin as we don't need it
        });

        let gotQrCode = false;

        const QR_CODE_HEIGHT = 29;

        const interval = setInterval(() => {
            readFile("./stdout.log", "utf8").then(data => {
                const stdoutLines = data.split("\n");

                if (stdoutLines.length >= QR_CODE_HEIGHT && !gotQrCode) {
                    // send the qr code to the bot's owner
                    client.sendMessage(message.from, `*[bot]* Scan this to restart the bot:\n\`\`\`${stdoutLines.slice(-QR_CODE_HEIGHT - 1, -1).join("\n")}\`\`\``);

                    gotQrCode = true;
                }

                // if a second qr code is found, timeout
                if (stdoutLines.length >= QR_CODE_HEIGHT * 2) {
                    chat.sendMessage("*[bot]* QR code has expired. Please try again.");
                    childProc.kill();
                    clearInterval(interval);
                }

                // once the new bot is ready we can kill the old one
                if (stdoutLines.includes("Client is ready")) {
                    client.destroy();
                    clearInterval(interval);
                    process.exit(0);
                }
            });
        }, 4000);

        childProc.on("error", err => {
            chat.sendMessage("*[bot]* Something went wrong while trying to restart. My owner can check the server for more details.");
            throw err;
        });
    }
));

adminCollection.commands.unshift(new Command(
    "die", [],
    "Kills the bot",
    async message => {
        if (!fromAdmin(message)) return;

        const chat = await message.getChat();

        chat.sendMessage(`*[bot]* ${randomChoice(responses.death)}`);
        // wait a second before disconnecting because the promise
        // returned by chat.sendMessage seems to not work
        setTimeout(client.destroy.bind(client), 1000);
    }
));

adminCollection.commands.unshift(new Command(
    "disallow/admin", ["phone number"],
    "Removes a user's admin privileges",
    async (message, phoneNumber) => {
        if (!fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/[^\d]/)) {
            message.reply("*[bot]* Please enter a valid phone number.");
            return;
        }

        permissions.otherAdmins.delete(phoneNumber);

        const chat = await message.getChat();
        chat.sendMessage(`*[bot]* ${phoneNumber} has had their admin privileges revoked.`);
    }
));

adminCollection.commands.unshift(new Command(
    "allow/admin", ["phone number"],
    "Gives a user admin privileges",
    async (message, phoneNumber) => {
        if (!fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/[^\d]/)) {
            message.reply("*[bot]* Please enter a valid phone number.");
            return;
        }

        permissions.otherAdmins.add(phoneNumber);

        const chat = await message.getChat();
        chat.sendMessage(`*[bot]* ${phoneNumber} has been given admin privileges.`);
    }
));

adminCollection.commands.unshift(new Command(
    "disallow/user", ["phone number"],
    "Bans a user from using the bot",
    async (message, phoneNumber) => {
        if (!fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/[^\d]/)) {
            message.reply("*[bot]* Please enter a valid phone number.");
            return;
        }

        // ignore if trying to ban the owner
        const ownerPhoneNumber = await client.info.wid.user;
        if (ownerPhoneNumber === phoneNumber) return;

        permissions.banned.add(phoneNumber);

        const chat = await message.getChat();
        chat.sendMessage(`*[bot]* ${phoneNumber} has been banned.`);
    }
));

adminCollection.commands.unshift(new Command(
    "allow/user", ["phone number"],
    "Removes a user's ban from using the bot",
    async (message, phoneNumber) => {
        if (!fromAdmin(message)) return;
        phoneNumber = phoneNumber.replace(/\s\+/g, "");

        if (phoneNumber.match(/[^\d]/)) {
            message.reply("*[bot]* Please enter a valid phone number.");
            return;
        }

        permissions.banned.delete(phoneNumber);

        const chat = await message.getChat();
        chat.sendMessage(`*[bot]* ${phoneNumber} has been unbanned.`);
    }
));

export default adminCollection;