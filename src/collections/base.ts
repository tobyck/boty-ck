import fs from "fs";

import { Contact, GroupChat } from "whatsapp-web.js";

import { Collection, Command } from "../core";
import { randomChoice } from "../helpers";
import { client } from "../bot";

const responses = JSON.parse(fs.readFileSync("./responses.json", "utf8"));

const baseCollection = new Collection(
    "base",
    "All of my commands start with ! and can be seen below:",
);

baseCollection.commands.unshift(new Command(
    "cookie", [],
    "Gives you a cookie",
    async message => {
        if (Math.random() < .1) {
            message.reply("*[bot]* No.");
        } else {
            message.reply("*[bot]* Here you go: 🍪");
        }
    }
));

baseCollection.commands.unshift(new Command(
    "everyone", [],
    "Mentions everyone in the chat",
    async message => {
        // get the chat the message was sent in
        const chat = await message.getChat() as GroupChat;

        // if the chat is in a group
        if (chat.isGroup) {
            const text = ["*[bot]*"];
            const contacts: Contact[] = [];

            for (const participant of chat.participants) { // for each member
                text.push(`@${participant.id.user}`); // add their tag to the message

                // add their contact to the list of contacts to mention
                const contact = await client.getContactById(participant.id._serialized);
                contacts.push(contact);
            }

            chat.sendMessage(text.join(" "), { mentions: contacts });
        } else {
            chat.sendMessage("*[bot]* This command can only be used in a group chat.");
        }
    }
));

baseCollection.commands.unshift(new Command(
    "status", [],
    "See what the bot is doing",
    async message => {
        const statuses: string[] = [];

        for (const prefix in responses.statuses) {
            statuses.push(...responses.statuses[prefix]
                .map((status: string) => `${prefix}${prefix ? " " : ""}${status}`));
        }

        message.reply(`*[bot]* ${randomChoice(statuses)}.`);
    }
));

export default baseCollection;