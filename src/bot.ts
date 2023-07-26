import { Client } from "whatsapp-web.js";

import qrcode from "qrcode-terminal";

import type { Collection } from "./core";
import { removeStyling } from "./helpers";

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
export const permissions = new BotPermissions();
export const client = new Client({});

session.load();

let timeOfLastCommand = Date.now();
const cooldown = 3000;

// generate qr to connect to whatsapp via phone
client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});

// notify when client is ready
client.on("ready", () => {
    console.log("Client is ready");
});

// notify when client has disconnected
client.on("disconnected", () => {
    console.log("Client has disconnected");
});

// every time a new message is created, it will be forwarded to this function
client.on("message_create", async message => {
    const sender = await message.getContact();
    if (permissions.banned.has(sender.id.user)) return;

    const body = removeStyling(message.body);

    if (body.startsWith("!")) {
        let collectionName: string;
        let commandName: string;
        let args: string; // it's up to the command to parse this

        if (body.includes("/")) {
            const command = body.split(" ")[0];
            collectionName = command.split("/")[0].slice(1);
            commandName = command.split("/").slice(1).join("/");
            args = body.split(" ").slice(1).join(" ");
        } else {
            collectionName = "base";
            commandName = body.split(" ")[0].slice(1);
            args = body.split(" ").slice(1).join(" ");
        }

        for (const collection of collections) {
            if (collection.name === collectionName) {
                for (const command of collection.commands) {
                    if (
                        command.name === commandName &&
                        Date.now() - timeOfLastCommand > cooldown
                    ) {
                        const chat = await message.getChat();

                        await chat.sendStateTyping();
                        await command.func(message, args, collection);
                        await chat.clearState();

                        timeOfLastCommand = Date.now();

                        return;
                    }
                }
            }
        }
    }
});

// bring Boty Copper-Kettle to life
client.initialize();

// save session data and permissions when the bot dies
process.on("exit", () => {
    session.save();
    permissions.save();
});