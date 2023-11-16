import { Chat, Client, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import process from "process";

import type { Collection, NiladicCommand, VariadicCommand } from "./core";
import { removeStyling, sleep } from "./helpers";

import baseCollection from "./collections/base";

import ultiCollection from "./collections/ulti";
import adminCollection from "./collections/admin";
import { Session } from "./session";
import { BotPermissions } from "./permissions";

export const collections: Collection[] = [
    baseCollection,
    ultiCollection,
    adminCollection
];

export const session = new Session("session.json");
export const permissions = new BotPermissions("permissions.json");
export const client = new Client({});

session.load();
permissions.load();

globalThis.awake = true;

let timeOfLastCommand = Date.now();
const COOLDOWN = 3000;

// generate qr to connect to whatsapp via phone
client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});

// runs a command given the message it which it was requested
const runCommand = async (commandBody: string, chat: Chat, automated: boolean, message = null) => {
    if (commandBody.startsWith("!")) {
        let collectionName: string;
        let commandName: string;

        if (commandBody.split(" ")[0].includes("/")) {
            const command = commandBody.split(" ")[0];
            collectionName = command.split("/")[0].slice(1);
            commandName = command.split("/").slice(1).join("/");
        } else {
            collectionName = "base";
            commandName = commandBody.split(" ")[0].slice(1);
        }

        // it's up to the command how to parse this
        const args = commandBody.split(" ").slice(1).join(" ");

        // only run commands if the bot is awake and an admin isn't trying to wake it up
        if (!globalThis.awake && !(collectionName === "admin" && commandName === "wake")) return;

        for (const collection of collections) {
            if (collection.name === collectionName) {
                for (const command of collection.commands) {
                    if (
                        automated ||
                        (command.name === commandName &&
                        Date.now() - timeOfLastCommand > COOLDOWN)
                    ) {
                        await chat.sendStateTyping();

                        if (command.argSyntax) {
                            await (command.func as VariadicCommand)(chat, args, message);
                        } else {
                            await (command.func as NiladicCommand)(chat, message);
                        }

                        await chat.clearState();
                        timeOfLastCommand = Date.now();

                        return;
                    }
                }
            }
        }

        if (!automated) timeOfLastCommand = Date.now();
    }
};

const runAutomations = async () => {
    if (globalThis.awake) { // only run automations if the bot is awake
        for (const [chatId, { automations }] of Object.entries(session.data.chats)) { // for each chat and its automations
            const chat = await client.getChatById(chatId); // chat object to run the commands in

            for (const { command, times } of automations) { // for each automation and the times to run it
                const [date, time] = new Date()
                    .toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })
                    .split(", ");

                const now = new Date(date.split("/").reverse().join("/") + " " + time);
                const today = now.getDay();

                if (times.some(time => time.day === today)) {
                    const hour = now.getHours();
                    if (times.some(time => time.day === today && time.time === hour)) {
                        await runCommand(command, chat, true);
                    }
                }
            }

            /* if an automated message was sent in this chat, make the possibility of sending multiple messages
             * in different chats in a very short space of time slightly less suspicious
             */
            if (automations.length) await sleep(8000);
        }
    }
};

// notify when client is ready
client.on("ready", async () => {
    // eslint-disable-next-line
    console.log(`Client is ready (${client.info.pushname}, ${client.info.wid.user})`);

    // send the owner a message if they specified one
    const returnMessage = process.argv[2];
    if (returnMessage) await client.sendMessage(client.info.wid._serialized, `*[bot]* ${returnMessage}`);

    // start the cycle of checking for automations
    const HOUR = 3600000;
    setTimeout( () => {
        runAutomations(); // run on the hour
        setInterval(runAutomations, HOUR); // and every hour after that
    }, HOUR - Date.now() % HOUR); // time until next hour
});

// notify when client has disconnected
client.on("disconnected", () => {
    // eslint-disable-next-line
    console.log("Client has disconnected");
});

// every time a new message is created, it will be forwarded to this function which will run the command if it is one
client.on("message_create", async (message: Message) => {
    const sender = await message.getContact();
    if (permissions.banned.has(sender.id.user)) return;

    const commandBody = removeStyling(message.body);
    await runCommand(commandBody, await message.getChat(), false, message);
});

/* eslint-disable no-console */

// bring Boty Copper-Kettle to life
client.initialize().then(() => {
    console.log("Client initialized");
}).catch(console.error);

// save session data and permissions when the bot dies
process.on("exit", () => {
    session.save();
    permissions.save();
});