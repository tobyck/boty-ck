import * as fs from "fs";

import { inspect } from "util";

import { Collection, Command } from "../core";
import { randomChoice } from "../helpers";
import { client, session } from "../bot";
import { Session } from "../session";

const responses = JSON.parse(fs.readFileSync("./responses.json", "utf8"));

const adminCollection = new Collection(
    "admin",
    "This collection contains commands which can only be used by the owner of the bot.",
);

adminCollection.commands.unshift(new Command(
    "logsession", [],
    "Logs the current session data to the console",
    async message => {
        if (message.fromMe) {
            console.log(inspect(session.data, false, null, true));
        }
    }
));

adminCollection.commands.unshift(new Command(
    "newsession", [],
    "Clears current session data",
    async message => {
        if (message.fromMe) {
            session.data = Session.blankSession();
            session.save();

            const chat = await message.getChat();
            chat.sendMessage("*[bot]* Current session data has been cleared.");
        }
    }
));

adminCollection.commands.unshift(new Command(
    "die", [],
    "Kill the bot",
    async message => {
        if (message.fromMe) {
            const chat = await message.getChat();

            chat.sendMessage(`*[bot]* ${randomChoice(responses.death)}`);
            // wait a second before disconnecting because the promise
            // returned by chat.sendMessage seems to not work
            setTimeout(client.destroy.bind(client), 1000);
        }
    }
));

export default adminCollection;