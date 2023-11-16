import fs from "fs";

import { Contact, GroupChat } from "whatsapp-web.js";

import { Collection, Command, NiladicCommand, VariadicCommand } from "../core";
import { days, randomChoice, sendMessage } from "../helpers";
import { client, session } from "../bot";

const responses = JSON.parse(fs.readFileSync("./responses.json", "utf8"));

const baseCollection = new Collection(
    "base",
    "All of my commands start with ! and can be seen below:",
);

baseCollection.commands.unshift(new Command<VariadicCommand>(
    "unautomate", "<automation id>",
    async (chat, automationIndex) => {
        if (!automationIndex) {
            await sendMessage(chat, "Please specify the automation's id to remove it. You can view these with *!automations*.");
        } else {
            const automations = session.data.chats?.[chat.id._serialized]?.automations;

            if (!automations) {
                await sendMessage(chat, "There are no automations in this chat.");
                return;
            }

            const index = parseInt(automationIndex) - 1;

            if (index < 0 || index >= automations.length) {
                await sendMessage(chat, "Invalid automation id.");
            } else {
                automations.splice(index, 1);
                await sendMessage(chat, "Automation removed successfully.");
            }
        }
    }
));

baseCollection.commands.unshift(new Command<NiladicCommand>(
    "automations", null,
    async chat => {
        const chatId = chat.id._serialized;

        session.tryInitChatData(chatId);

        const automations = session.data.chats[chatId].automations;

        if (automations.length === 0) {
            await sendMessage(chat, "There are no automations in this chat.");
        } else {
            const message = "Here are the active automations in this chat:\n\n" +
                automations.map((automation, i) => {
                    const times = automation.times.map(time =>
                        `${days[time.day]} at ${time.time % 12}${time.time < 12 ? "am" : "pm"}`
                    ).join(", ");

                    return `\`\`\`${i + 1} | \`\`\`*${automation.command}* every ${times}`;
                }).join("\n");

            await sendMessage(chat, message);
        }
    }
));

baseCollection.commands.unshift(new Command<VariadicCommand>(
    "automate", "<command> every <day> <time>, ...",
    async (chat, args, message) => {
        args = args.toLowerCase();

        const [command, ...times] = args.split(/\s*every\s*/).flatMap(arg => arg.split(/\s*,\s*/));

        if (!times.every(time => new RegExp(`(${days.join("|")})\\s+[12]?\\d[ap]m`).test(time)) || !command || !times) {
            await sendMessage(chat, "Please specify the command, days and times in the correct format. Here's an example: *!automate !status every tuesday 4pm, saturday 10am*", message);
            return;
        }

        const chatId = (await message.getChat()).id._serialized;

        // init chat data if it doesn't exist
        session.tryInitChatData(chatId);

        session.data.chats[chatId].automations.push({
            command,
            times: times.map(time => {
                const [day, hour] = time.toLowerCase().split(" ");
                const afternoon = hour.endsWith("pm");
                return {
                    day: days.indexOf(day),
                    time: parseInt(hour) + (afternoon ? 12 : 0)
                };
            })
        });

        await sendMessage(chat, "Automation added successfully.");
    }
));

baseCollection.commands.unshift(new Command<NiladicCommand>(
    "cookie", null,
    async (chat, message) => {
        if (Math.random() < .1) {
            await sendMessage(chat, "No.", message);
        } else {
            await sendMessage(chat, "Here you go: 🍪", message);
        }
    }
));

baseCollection.commands.unshift(new Command<NiladicCommand>(
    "everyone", null,
    async (_, message) => {
        // get the chat the message was sent in
        const chat = await message.getChat() as GroupChat;

        // if the chat is in a group
        if (chat.isGroup) {
            const text = [];
            const contacts: Contact[] = [];

            for (const participant of chat.participants) { // for each member
                text.push(`@${participant.id.user}`); // add their tag to the message

                // add their contact to the list of contacts to mention
                const contact = await client.getContactById(participant.id._serialized);
                contacts.push(contact);
            }

            await sendMessage(chat, text.join(" "), null, { mentions: contacts });
        } else {
            await sendMessage(chat, "This command can only be used in a group chat.");
        }
    }
));

baseCollection.commands.unshift(new Command<NiladicCommand>(
    "status", null,
    async (chat, message) => {
        const statuses: string[] = [];

        for (const prefix in responses.statuses) {
            statuses.push(...responses.statuses[prefix]
                .map((status: string) => `${prefix}${prefix ? " " : ""}${status}`));
        }

        await sendMessage(chat, `${randomChoice(statuses)}.`, message);
    }
));

baseCollection.commands.unshift(new Command<NiladicCommand>(
    "guide", null,
    async chat => {
        await sendMessage(chat, "Read the guide here: github.com/tobyck/boty-ck#readme");
    }
));

export default baseCollection;