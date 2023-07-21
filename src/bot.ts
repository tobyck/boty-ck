import { Client } from "whatsapp-web.js";

import qrcode from "qrcode-terminal";

import type { Collection } from "./core";
import { removeStyling } from "./helpers";

import baseCollection from "./collections/base";
import ultiCollection from "./collections/ulti";
import adminCollection from "./collections/admin";
import { Session } from "./session";

export const collections: Collection[] = [
    baseCollection,
    ultiCollection,
    adminCollection
];

export const session = new Session("session.json");

session.load();

export const client = new Client({});

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
    const body = removeStyling(message.body);

    if (body.startsWith("!")) {
        let collectionName: string;
        let commandName: string;
        let args: string; // it's up to the command to parse this

        if (body.includes("/")) {
            const split = body.split("/");
            collectionName = split[0].slice(1);
            commandName = split[1].split(" ")[0];
            args = split[1].split(" ").slice(1).join(" ");
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