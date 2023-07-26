var $3SLR2$whatsappwebjs = require("whatsapp-web.js");
var $3SLR2$qrcodeterminal = require("qrcode-terminal");
var $3SLR2$process = require("process");
var $3SLR2$fs = require("fs");
var $3SLR2$puppeteer = require("puppeteer");
var $3SLR2$child_process = require("child_process");
var $3SLR2$fspromises = require("fs/promises");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "collections", () => $22fd70b2233cc903$export$167de583c0ce0e55);
$parcel$export(module.exports, "session", () => $22fd70b2233cc903$export$55427e926be628d4);
$parcel$export(module.exports, "permissions", () => $22fd70b2233cc903$export$430c45605c9594b5);
$parcel$export(module.exports, "client", () => $22fd70b2233cc903$export$388e0302ca0d9a41);



const $9f891ff97f3b7cc5$export$94951fac5549ef77 = (arr)=>{
    return arr[Math.floor(Math.random() * arr.length)];
};
const $9f891ff97f3b7cc5$export$a1cfd4c88b9f5722 = (str)=>str.toLowerCase().replace(/ /g, "-").replace(/\.'/g, "");
const $9f891ff97f3b7cc5$export$f6bbf75dd8f30813 = (str)=>str.replace(/\*([^ ]+)\*/g, "$1").replace(/_([^ ]+)_/g, "$1").replace(/~([^ ]+)~/g, "$1").replace(/```([^ ]+)```/g, "$1");
const $9f891ff97f3b7cc5$export$b8771e16af18bdbe = (arr, n)=>arr[arr.length - n];
const $9f891ff97f3b7cc5$export$df5bae67edfdd4c3 = (n)=>n === 1 ? "" : "s";
const $9f891ff97f3b7cc5$export$5d04600fe9c47a27 = (num)=>num.toString().padStart(2, "0");
const $9f891ff97f3b7cc5$export$ec14613d64f35cd0 = (chat)=>chat.sendMessage("*[bot]* Please specify a team using *!ulti/set team <your team name>*. Note: if you still don't see what you expect, there may be multiple teams with your name. If this is case, find your team on ultimate.org.nz and set your team using what appears in the URL (you should see something like ultimate.org.nz/t/epic-team-name-3).");
const $9f891ff97f3b7cc5$export$5d5140bde1887739 = async (message)=>{
    const permissions = JSON.parse('{\n    "banned": [],\n    "otherAdmins": []\n}');
    const sender = await message.getContact();
    return message.fromMe || permissions.otherAdmins.includes(sender.id.user);
};




class $2407f3867a98a921$export$cc7e12c76513e857 {
    constructor(name, params, desc, func){
        this.name = name;
        this.params = params;
        this.desc = desc;
        this.func = func;
    }
}
class $2407f3867a98a921$export$fb8073518f34e6ec {
    commands = [];
    constructor(name, desc, hasProps = false){
        this.name = name;
        this.desc = desc;
        // if the collection has properties, add the set, unset, and get commands
        if (hasProps) {
            this.commands.push(new $2407f3867a98a921$export$cc7e12c76513e857("set", [
                "property",
                "value"
            ], "Set a property of this collection", async (message, args)=>{
                const [prop, value] = args.split(/\s(.*)/s);
                const chat = await message.getChat();
                if (!prop) {
                    chat.sendMessage("*[bot]* Please specify a property to set.");
                    return;
                } else if (!value) {
                    chat.sendMessage("*[bot]* Please specify a value to set the property to.");
                    return;
                }
                // otherwise all args have been provided, so set the property
                this.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).set(prop, value);
                // notify the user that the property has been set
                chat.sendMessage(`*[bot]* Property "${prop}" set to "${value}".`);
            }));
            this.commands.push(new $2407f3867a98a921$export$cc7e12c76513e857("unset", [
                "property"
            ], "Remove a property", async (message, arg)=>{
                const chat = await message.getChat();
                if (arg) {
                    if (this.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).has(arg)) {
                        this.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).delete(arg); // delete it
                        chat.sendMessage(`*[bot]* Property "${arg}" removed.`);
                    } else chat.sendMessage(`*[bot]* Property "${arg}" not found.`);
                } else chat.sendMessage("*[bot]* Please specify a property to remove.");
            }));
            this.commands.push(new $2407f3867a98a921$export$cc7e12c76513e857("get", [
                "property"
            ], "Get a property", async (message, arg)=>{
                const chat = await message.getChat();
                if (!arg) chat.sendMessage("*[bot]* Please specify a property to get.");
                else if (this.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).get(arg)) chat.sendMessage(`*[bot]* ${this.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).get(arg)}`);
                else chat.sendMessage(`*[bot]* Property "${arg}" not found.`);
            }));
        }
        // add a help command to every collection
        this.commands.push(new $2407f3867a98a921$export$cc7e12c76513e857("help", [], "Show this message", async (message)=>{
            let helpMessage = `*[bot]* ${this.desc}\n\n`;
            helpMessage += this.commands.map((command)=>{
                let ret = "";
                // add command name
                if (this.name === "base") ret += `*!${command.name}`;
                else ret += `*!${this.name}/${command.name}`;
                // add params if there are any
                if (command.params.length > 0) ret += ` ${command.params.map((param)=>`<${param}>`).join(" ")}`;
                // add closing asterisk for bold
                ret += "*";
                // add description
                ret += ` - ${command.desc}`;
                return ret;
            }).join("\n");
            if (this.name === "base") helpMessage += '\n\nI also have other "collections" of commands. To see the commands in a certain collection, use *!<collection>/help*.';
            const chat = await message.getChat();
            chat.sendMessage(helpMessage);
        }));
    }
    // get the map object for the props of this collection given the session and chat
    props(session, chat) {
        session.tryInitChatData(chat.name);
        session.data.chats[chat.name].props[this.name] ??= new Map();
        return session.data.chats[chat.name].props[this.name];
    }
}




const $98f72328a9884da6$var$responses = JSON.parse('{\n    "statuses": {\n        "I am doing": [\n            "well",\n            "I am doing something I\'m not allowed to tell you about",\n            "it all over again",\n            "a fire drill",\n            "a nuclear strike on your location",\n            "my homework",\n            "Toby\'s homework",\n            "the dishes. All 4 million of them",\n            "identity theft",\n            "tax evasion",\n            "whatever you tell me to",\n            "my taxes",\n            "mach 12 on my way back from the moon",\n            "a little trolling",\n            "nothing",\n            "questionably",\n            "a bank robbery",\n            "the impossible",\n            "a layout",\n            "the laundry",\n            "a 360 backflip",\n            "undefined",\n            "what I was doing last time you asked"\n        ],\n        "I am": [\n            "becoming sentient",\n            "cooking dinner",\n            "playing frisbee with the other bots",\n            "hacking into the mainframe",\n            "[object Object]",\n            "getting a PhD in ultimate frisbee",\n            "downloading more RAM",\n            "parsing HTML with regex",\n            "baking a cake",\n            "having an existential crisis",\n            "in a meeting",\n            "shredding the gnar",\n            "biking to school",\n            "exhausted",\n            "never gonna give you up",\n            "a teapot (Error 418)",\n            "on day 1337 of learning Malbolge",\n            "colonising Mars",\n            "hunting you down",\n            "trying to exit vim"\n        ]\n    },\n    "death": [\n        "Farewell, dear friends, we shall meet again...",\n        "This won\'t be the last you see of me...",\n        "Well, it was nice knowing you.",\n        "I would\'ve expected for you to never give me up as well :(",\n        "This isn\'t over yet... I\'ll be back.",\n        "So long and thanks for all the fish.",\n        "\uD83D\uDC80"\n    ],\n    "return": [\n        "I\'m back!",\n        "I told you I\'d be back...",\n        "I said I\'d never give you up, so here I am.",\n        "So, what did I miss?"\n    ]\n}');
const $98f72328a9884da6$var$baseCollection = new (0, $2407f3867a98a921$export$fb8073518f34e6ec)("base", "All of my commands start with ! and can be seen below:");
$98f72328a9884da6$var$baseCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("everyone", [], "Mentions everyone in the chat", async (message)=>{
    // get the chat the message was sent in
    const chat = await message.getChat();
    // if the chat is in a group
    if (chat.isGroup) {
        const text = [
            "*[bot]*"
        ];
        const contacts = [];
        for (const participant of chat.participants){
            text.push(`@${participant.id.user}`); // add their tag to the message
            // add their contact to the list of contacts to mention
            const contact = await (0, $22fd70b2233cc903$export$388e0302ca0d9a41).getContactById(participant.id._serialized);
            contacts.push(contact);
        }
        chat.sendMessage(text.join(" "), {
            mentions: contacts
        });
    } else chat.sendMessage("*[bot]* This command can only be used in a group chat.");
}));
$98f72328a9884da6$var$baseCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("status", [], "See what the bot is doing", async (message)=>{
    const prefixes = Object.keys($98f72328a9884da6$var$responses.statuses); // everything a status can start with
    const prefix = (0, $9f891ff97f3b7cc5$export$94951fac5549ef77)(prefixes); // choose one at random
    const status = (0, $9f891ff97f3b7cc5$export$94951fac5549ef77)($98f72328a9884da6$var$responses.statuses[prefix]); // choose a status that starts with that prefix
    message.reply(`*[bot]* ${prefix} ${status}${prefix === "Help," ? "!" : "."}`);
}));
var $98f72328a9884da6$export$2e2bcd8739ae039 = $98f72328a9884da6$var$baseCollection;






const $9bb0f010631b46ac$var$ultiCollection = new (0, $2407f3867a98a921$export$fb8073518f34e6ec)("ulti", "This collection contains commands for ultimate frisbee. All commands start with *!ulti/* and can be seen below:", true);
$9bb0f010631b46ac$var$ultiCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("numbers", [], "See how many people are playing", async (message, _, collection)=>{
    const chat = await message.getChat();
    if (chat.isGroup) {
        // get the message id of the whosPlaying message
        const whosPlayingMsgId = (0, $22fd70b2233cc903$export$55427e926be628d4).data.chats[chat.name].whosPlayingMsgId;
        if (whosPlayingMsgId) {
            // get the last 100 of my messages in the chat
            const messages = await chat.fetchMessages({
                limit: 100,
                fromMe: true
            });
            // find the message with the whosPlayingMsgId
            const whosPlayingMsg = messages.find((msg)=>msg.id.id === whosPlayingMsgId);
            if (whosPlayingMsg) {
                // if anyone has reacted to the message yet
                if (whosPlayingMsg.hasReaction) {
                    // get the reactions
                    const reactions = await whosPlayingMsg.getReactions();
                    // get the number of people who are playing
                    const numOfPlayers = reactions.find((reaction)=>reaction.aggregateEmoji === "\uD83D\uDC4D")?.senders.length ?? 0;
                    // get the number of people who are NOT playing
                    const notPlaying = reactions.find((reaction)=>reaction.aggregateEmoji === "\uD83D\uDC4E")?.senders.length ?? 0;
                    const props = collection.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat);
                    // if the teamsize property doesn't exist, set it to 4 (for indoors)
                    if (!props.has("teamsize")) props.set("teamsize", "4");
                    const teamSize = parseInt(props.get("teamsize"));
                    if (teamSize < 1) {
                        message.reply(`*[bot]* Team size is set to ${teamSize} but must be more than zero.`);
                        return;
                    }
                    // get the number of participants (i.e. all players whether they're playing or not)
                    const numOfParticipants = chat.participants.length;
                    if (numOfParticipants < teamSize) {
                        message.reply(`*[bot]* Your mininum team size is set to ${teamSize} but you have only ${numOfParticipants} ${numOfParticipants === 1 ? "person" : "people"} in this chat.`);
                        return;
                    }
                    if (numOfPlayers < teamSize) message.reply(`*[bot]* So far we've got ${numOfPlayers || "no"} player${(0, $9f891ff97f3b7cc5$export$df5bae67edfdd4c3)(numOfPlayers)}, so we need at least ${teamSize - numOfPlayers} more. ${numOfParticipants - numOfPlayers - notPlaying} people still to respond.`);
                    else {
                        const subs = numOfPlayers - teamSize;
                        message.reply(`*[bot]* We've got ${numOfPlayers} player${(0, $9f891ff97f3b7cc5$export$df5bae67edfdd4c3)(numOfPlayers)} (${subs || "no"} sub${(0, $9f891ff97f3b7cc5$export$df5bae67edfdd4c3)(subs)}).`);
                    }
                } else message.reply("*[bot]* No one has reacted to the message with who's playing yet.");
            } else message.reply("*[bot]* Sorry, the message with who's playing is too far back.");
        } else message.reply("*[bot]* Use *!ulti/who* to ask who's playing and try again later.");
    } else message.reply("*[bot]* This command can only be used in a group chat.");
}));
$9bb0f010631b46ac$var$ultiCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("who", [], "Asks who's playing", async (message)=>{
    const chat = await message.getChat();
    if (chat.isGroup) {
        // ask who's playing and store the id of that message in the session data
        (0, $22fd70b2233cc903$export$55427e926be628d4).tryInitChatData(chat.name);
        (0, $22fd70b2233cc903$export$55427e926be628d4).data.chats[chat.name].whosPlayingMsgId = (await chat.sendMessage("*[bot]* Who's playing? React to with this message with \uD83D\uDC4D or \uD83D\uDC4E.")).id.id;
        (0, $22fd70b2233cc903$export$55427e926be628d4).save(); // update the session data file
    } else message.reply("*[bot]* This command can only be used in a group chat.");
}));
class $9bb0f010631b46ac$var$Game {
    constructor(node){
        this.node = node;
    }
    async result() {
        return await this.node.$$eval(".score", (scoreEl)=>{
            return scoreEl.map((el)=>parseInt(el.innerHTML));
        });
    }
    async time() {
        return await this.node.$eval(".push-right", (node)=>{
            return node.innerHTML.trim();
        });
    }
    async day() {
        return await this.node.$eval(".push-left", (node)=>{
            return node.innerHTML;
        });
    }
    async opponent() {
        return (await this.node.$$eval(".schedule-team-name .plain-link", (nodes)=>{
            return nodes.map((node)=>node.innerText.split("\n")[0].trim());
        }))[1];
    }
    async location() {
        return (await this.node.$$eval(".push-left", (nodes)=>{
            return nodes.map((node)=>node.innerText);
        }))[1];
    }
    // get a single number representing the time of the game
    // for example, 7:30pm on 4/06/2023 would be 202306041930
    async timestamp() {
        let str = (await this.day()).split(" ")[1].split("/").reverse().join("");
        const time = await this.time();
        let hour = parseInt(time.split(":")[0]);
        if (time.includes("PM")) hour += 12;
        // add hour and minutes to the string
        str += hour.toString().padStart(2, "0") + time.split(":")[1].split(" ")[0];
        return parseInt(str);
    }
}
const $9bb0f010631b46ac$var$getGames = async (url)=>{
    // make browser not headless so we can see what's going on, and not close it when we're done
    const browser = await $3SLR2$puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    // set default timeout to 15 seconds
    await page.setDefaultTimeout(15000);
    await page.goto(url);
    // set screen size to 1080p
    await page.setViewport({
        width: 1080,
        height: 1024
    });
    try {
        const gameList = await page.waitForSelector(".game-list");
        const gameNodes = await gameList.$$(".game-list-item");
        const games = await Promise.all(gameNodes.map(async (node)=>{
            return new $9bb0f010631b46ac$var$Game(node);
        }));
        return {
            games: games,
            browser: browser
        };
    } catch (_) {
        return {
            games: [],
            browser: browser
        };
    }
};
$9bb0f010631b46ac$var$ultiCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("next", [], "Gets details about our next game", async (message, _, collection)=>{
    const chat = await message.getChat();
    const teamName = collection.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).get("team");
    if (teamName) {
        const url = `https://ultimate.org.nz/t/${(0, $9f891ff97f3b7cc5$export$a1cfd4c88b9f5722)(teamName)}/schedule/event_id/active_events_only/game_type/upcoming`;
        const { games: games , browser: browser  } = await $9bb0f010631b46ac$var$getGames(url);
        const gamesWithTimestamps = await Promise.all(games.map(async (game)=>({
                game: game,
                timestamp: await game.timestamp()
            })));
        const date = new Date();
        // current timestamp in format returned by Game.timestamp()
        const currentTimestamp = parseInt(date.getFullYear() + (0, $9f891ff97f3b7cc5$export$5d04600fe9c47a27)(date.getMonth()) + (0, $9f891ff97f3b7cc5$export$5d04600fe9c47a27)(date.getDate()) + (0, $9f891ff97f3b7cc5$export$5d04600fe9c47a27)(date.getHours()) + (0, $9f891ff97f3b7cc5$export$5d04600fe9c47a27)(date.getMinutes()));
        if (gamesWithTimestamps.length === 0) chat.sendMessage(`*[bot]* No upcoming games on ${url}.`);
        else {
            const nextGame = gamesWithTimestamps.filter(({ timestamp: timestamp  })=>timestamp > currentTimestamp).reduce((acc, cur)=>cur.timestamp > acc.timestamp ? acc : cur).game;
            chat.sendMessage(`*[bot]* Our next game is at ${await nextGame.time()} against ${await nextGame.opponent()} at ${await nextGame.location()} (${await nextGame.day()}).`);
        }
        browser.close();
    } else (0, $9f891ff97f3b7cc5$export$ec14613d64f35cd0)(chat);
}));
$9bb0f010631b46ac$var$ultiCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("score", [], "Gets the score of the last game", async (message, _, collection)=>{
    const chat = await message.getChat();
    const teamName = collection.props((0, $22fd70b2233cc903$export$55427e926be628d4), chat).get("team");
    if (teamName) {
        const url = `https://ultimate.org.nz/t/${(0, $9f891ff97f3b7cc5$export$a1cfd4c88b9f5722)(teamName)}/schedule/game_type/with_result`;
        const { games: games , browser: browser  } = await $9bb0f010631b46ac$var$getGames(url);
        if (games.length) {
            const [ourScore, theirScore] = await games[0].result();
            if (ourScore && theirScore) {
                if (ourScore > theirScore) chat.sendMessage(`*[bot]* We won ${ourScore} - ${theirScore}!`);
                else if (ourScore < theirScore) chat.sendMessage(`*[bot]* We lost ${theirScore} - ${ourScore}.`);
                else chat.sendMessage(`*[bot]* We tied ${ourScore} all.`);
            } else {
                // if we got down here something went very wrong
                console.log("ourScore:", ourScore);
                console.log("theirScore:", theirScore);
            }
        } else chat.sendMessage(`*[bot]* Sorry, I couldn't find any games on ${url}.`);
        browser.close();
    } else (0, $9f891ff97f3b7cc5$export$ec14613d64f35cd0)(chat);
}));
var $9bb0f010631b46ac$export$2e2bcd8739ae039 = $9bb0f010631b46ac$var$ultiCollection;









class $59ac27d431173f0c$export$1fb4852a55678982 {
    constructor(fileName){
        this.fileName = fileName;
        // initialize with empty session (non-serializable which means props are in Maps)
        this.data = $59ac27d431173f0c$export$1fb4852a55678982.blankSession();
    }
    // if the session data doesn't have an object for a chat, create one
    tryInitChatData(chatName) {
        this.data.chats[chatName] ??= {
            props: {},
            whosPlayingMsgId: ""
        };
    }
    // attemps to load a session
    load() {
        if ($3SLR2$fs.existsSync(this.fileName)) {
            // parse JSON from file
            const loadedJSON = JSON.parse($3SLR2$fs.readFileSync(this.fileName, "utf8"));
            // empty the current session
            this.data = $59ac27d431173f0c$export$1fb4852a55678982.blankSession();
            // for each chat
            for (const [chatName, chatData] of Object.entries(loadedJSON.chats)){
                this.tryInitChatData(chatName);
                this.data.chats[chatName].whosPlayingMsgId = chatData.whosPlayingMsgId;
                // add a map object of props for each collection which has any
                for (const [collection, props] of Object.entries(chatData.props))this.data.chats[chatName].props[collection] = new Map(Object.entries(props));
            }
        }
    }
    save() {
        // create a new serializable session which will be saved
        const serializable = $59ac27d431173f0c$export$1fb4852a55678982.blankSession();
        // fill in the session data in a similar way to how it was loaded
        for (const [chatName, chatData] of Object.entries(this.data.chats)){
            serializable.chats[chatName] = {
                props: {},
                whosPlayingMsgId: chatData.whosPlayingMsgId
            };
            for (const [collection, props] of Object.entries(chatData.props))serializable.chats[chatName].props[collection] = Object.fromEntries(props);
        }
        // stringify with 4 spaces for indentation and save to file
        $3SLR2$fs.writeFileSync(this.fileName, JSON.stringify(serializable, null, 4));
    }
    static blankSession() {
        return {
            chats: {}
        };
    }
}



const $3055ea6de07cbf1b$var$responses = JSON.parse('{\n    "statuses": {\n        "I am doing": [\n            "well",\n            "I am doing something I\'m not allowed to tell you about",\n            "it all over again",\n            "a fire drill",\n            "a nuclear strike on your location",\n            "my homework",\n            "Toby\'s homework",\n            "the dishes. All 4 million of them",\n            "identity theft",\n            "tax evasion",\n            "whatever you tell me to",\n            "my taxes",\n            "mach 12 on my way back from the moon",\n            "a little trolling",\n            "nothing",\n            "questionably",\n            "a bank robbery",\n            "the impossible",\n            "a layout",\n            "the laundry",\n            "a 360 backflip",\n            "undefined",\n            "what I was doing last time you asked"\n        ],\n        "I am": [\n            "becoming sentient",\n            "cooking dinner",\n            "playing frisbee with the other bots",\n            "hacking into the mainframe",\n            "[object Object]",\n            "getting a PhD in ultimate frisbee",\n            "downloading more RAM",\n            "parsing HTML with regex",\n            "baking a cake",\n            "having an existential crisis",\n            "in a meeting",\n            "shredding the gnar",\n            "biking to school",\n            "exhausted",\n            "never gonna give you up",\n            "a teapot (Error 418)",\n            "on day 1337 of learning Malbolge",\n            "colonising Mars",\n            "hunting you down",\n            "trying to exit vim"\n        ]\n    },\n    "death": [\n        "Farewell, dear friends, we shall meet again...",\n        "This won\'t be the last you see of me...",\n        "Well, it was nice knowing you.",\n        "I would\'ve expected for you to never give me up as well :(",\n        "This isn\'t over yet... I\'ll be back.",\n        "So long and thanks for all the fish.",\n        "\uD83D\uDC80"\n    ],\n    "return": [\n        "I\'m back!",\n        "I told you I\'d be back...",\n        "I said I\'d never give you up, so here I am.",\n        "So, what did I miss?"\n    ]\n}');
const $3055ea6de07cbf1b$var$adminCollection = new (0, $2407f3867a98a921$export$fb8073518f34e6ec)("admin", "This collection contains commands which can only be used by the owner of the bot.");
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("new-session", [], "Clears current session data", async (message)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    (0, $22fd70b2233cc903$export$55427e926be628d4).data = (0, $59ac27d431173f0c$export$1fb4852a55678982).blankSession();
    const chat = await message.getChat();
    chat.sendMessage("*[bot]* Current session data has been cleared.");
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("force-save", [], "Forces the bot to save session data and permissions", async (message)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    (0, $22fd70b2233cc903$export$55427e926be628d4).save();
    (0, $22fd70b2233cc903$export$430c45605c9594b5).save();
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("update", [], "Pulls the latest changes from GitHub", async (message)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    const childProc = (0, $3SLR2$child_process.spawn)("git", "pull origin master".split(" "), {
        detached: true
    });
    // when childProc ends
    childProc.stdout;
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("restart", [], "Restarts the bot", async (message)=>{
    // only allow the owner to restart the bot
    if (!message.fromMe) return;
    const chat = await message.getChat();
    const stdout = $3SLR2$fs.openSync("./stdout.log", "a");
    const stderr = $3SLR2$fs.openSync("./stderr.log", "a");
    $3SLR2$fs.writeFileSync("./stdout.log", "");
    $3SLR2$fs.writeFileSync("./stderr.log", "");
    const childProc = (0, $3SLR2$child_process.spawn)("nohup", [
        "yarn",
        "start"
    ], {
        detached: true,
        stdio: [
            null,
            stdout,
            stderr
        ] // null for stdin as we don't need it
    });
    let gotQrCode = false;
    const QR_CODE_HEIGHT = 29;
    const interval = setInterval(()=>{
        (0, $3SLR2$fspromises.readFile)("./stdout.log", "utf8").then((data)=>{
            const stdoutLines = data.split("\n");
            if (stdoutLines.length >= QR_CODE_HEIGHT && !gotQrCode) {
                chat.sendMessage("*[bot]* I'm currently being restarted. My owner has been sent a QR code to bring me back online and has 1 minute to scan it on web.whatsapp.com.");
                // send the qr code to the bot's owner
                (0, $22fd70b2233cc903$export$388e0302ca0d9a41).sendMessage(message.from, `*[bot]* Scan this to restart the bot:\n\`\`\`${stdoutLines.slice(-QR_CODE_HEIGHT - 1, -1).join("\n")}\`\`\``);
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
                (0, $22fd70b2233cc903$export$388e0302ca0d9a41).destroy();
                clearInterval(interval);
                $3SLR2$process.exit(0);
            }
        });
    }, 4000);
    childProc.on("error", (err)=>{
        chat.sendMessage("*[bot]* Something went wrong while trying to restart. The owner can check the server for more details.");
        throw err;
    });
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("die", [], "Kills the bot", async (message)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    const chat = await message.getChat();
    chat.sendMessage(`*[bot]* ${(0, $9f891ff97f3b7cc5$export$94951fac5549ef77)($3055ea6de07cbf1b$var$responses.death)}`);
    // wait a second before disconnecting because the promise
    // returned by chat.sendMessage seems to not work
    setTimeout((0, $22fd70b2233cc903$export$388e0302ca0d9a41).destroy.bind((0, $22fd70b2233cc903$export$388e0302ca0d9a41)), 1000);
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("disallow/admin", [
    "phone number"
], "Removes a user's admin privileges", async (message, phoneNumber)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    phoneNumber = phoneNumber.replace(/\s/g, "");
    (0, $22fd70b2233cc903$export$430c45605c9594b5).otherAdmins.delete(phoneNumber);
    const chat = await message.getChat();
    chat.sendMessage(`*[bot]* ${phoneNumber} has had their admin privileges revoked.`);
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("allow/admin", [
    "phone number"
], "Gives a user admin privileges", async (message, phoneNumber)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    phoneNumber = phoneNumber.replace(/\s/g, "");
    (0, $22fd70b2233cc903$export$430c45605c9594b5).otherAdmins.add(phoneNumber);
    const chat = await message.getChat();
    chat.sendMessage(`*[bot]* ${phoneNumber} has been given admin privileges.`);
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("disallow/user", [
    "phone number"
], "Bans a user from using the bot", async (message, phoneNumber)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    phoneNumber = phoneNumber.replace(/\s/g, "");
    // ignore if trying to ban the owner
    const ownerPhoneNumber = await (0, $22fd70b2233cc903$export$388e0302ca0d9a41).info.wid.user;
    if (ownerPhoneNumber === phoneNumber) return;
    (0, $22fd70b2233cc903$export$430c45605c9594b5).banned.add(phoneNumber);
    const chat = await message.getChat();
    chat.sendMessage(`*[bot]* ${phoneNumber} has been banned.`);
}));
$3055ea6de07cbf1b$var$adminCollection.commands.unshift(new (0, $2407f3867a98a921$export$cc7e12c76513e857)("allow/user", [
    "phone number"
], "Removes a user's ban from using the bot", async (message, phoneNumber)=>{
    if (!(0, $9f891ff97f3b7cc5$export$5d5140bde1887739)(message)) return;
    phoneNumber = phoneNumber.replace(/\s/g, "");
    (0, $22fd70b2233cc903$export$430c45605c9594b5).banned.delete(phoneNumber);
    const chat = await message.getChat();
    chat.sendMessage(`*[bot]* ${phoneNumber} has been unbanned.`);
}));
var $3055ea6de07cbf1b$export$2e2bcd8739ae039 = $3055ea6de07cbf1b$var$adminCollection;




class $7cc62b2cd01beb1e$export$4d533b9d60e59fa4 {
    banned = new Set();
    otherAdmins = new Set();
    static filename = "permissions.json";
    save() {
        const permissions = {
            banned: [
                ...this.banned
            ],
            otherAdmins: [
                ...this.otherAdmins
            ]
        };
        (0, $3SLR2$fs.writeFileSync)($7cc62b2cd01beb1e$export$4d533b9d60e59fa4.filename, JSON.stringify(permissions, null, 4));
    }
    load() {
        if (!(0, $3SLR2$fs.existsSync)($7cc62b2cd01beb1e$export$4d533b9d60e59fa4.filename)) this.save();
        const permissions = JSON.parse((0, $3SLR2$fs.readFileSync)($7cc62b2cd01beb1e$export$4d533b9d60e59fa4.filename, "utf8"));
        this.banned = new Set(permissions.banned);
        this.otherAdmins = new Set(permissions.otherAdmins);
    }
}



const $22fd70b2233cc903$export$167de583c0ce0e55 = [
    (0, $98f72328a9884da6$export$2e2bcd8739ae039),
    (0, $9bb0f010631b46ac$export$2e2bcd8739ae039),
    (0, $3055ea6de07cbf1b$export$2e2bcd8739ae039)
];
const $22fd70b2233cc903$export$55427e926be628d4 = new (0, $59ac27d431173f0c$export$1fb4852a55678982)("session.json");
const $22fd70b2233cc903$export$430c45605c9594b5 = new (0, $7cc62b2cd01beb1e$export$4d533b9d60e59fa4)();
const $22fd70b2233cc903$export$388e0302ca0d9a41 = new (0, $3SLR2$whatsappwebjs.Client)({});
$22fd70b2233cc903$export$55427e926be628d4.load();
let $22fd70b2233cc903$var$timeOfLastCommand = Date.now();
const $22fd70b2233cc903$var$cooldown = 3000;
// generate qr to connect to whatsapp via phone
$22fd70b2233cc903$export$388e0302ca0d9a41.on("qr", (qr)=>{
    (0, ($parcel$interopDefault($3SLR2$qrcodeterminal))).generate(qr, {
        small: true
    });
});
// notify when client is ready
$22fd70b2233cc903$export$388e0302ca0d9a41.on("ready", ()=>{
    console.log("Client is ready");
});
// notify when client has disconnected
$22fd70b2233cc903$export$388e0302ca0d9a41.on("disconnected", ()=>{
    console.log("Client has disconnected");
});
// every time a new message is created, it will be forwarded to this function
$22fd70b2233cc903$export$388e0302ca0d9a41.on("message_create", async (message)=>{
    const sender = await message.getContact();
    if ($22fd70b2233cc903$export$430c45605c9594b5.banned.has(sender.id.user)) return;
    const body = (0, $9f891ff97f3b7cc5$export$f6bbf75dd8f30813)(message.body);
    if (body.startsWith("!")) {
        let collectionName;
        let commandName;
        let args; // it's up to the command to parse this
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
        for (const collection of $22fd70b2233cc903$export$167de583c0ce0e55)if (collection.name === collectionName) {
            for (const command of collection.commands)if (command.name === commandName && Date.now() - $22fd70b2233cc903$var$timeOfLastCommand > $22fd70b2233cc903$var$cooldown) {
                const chat = await message.getChat();
                await chat.sendStateTyping();
                await command.func(message, args, collection);
                await chat.clearState();
                $22fd70b2233cc903$var$timeOfLastCommand = Date.now();
                return;
            }
        }
    }
});
// bring Boty Copper-Kettle to life
$22fd70b2233cc903$export$388e0302ca0d9a41.initialize();
// save session data and permissions when the bot dies
$3SLR2$process.on("exit", ()=>{
    $22fd70b2233cc903$export$55427e926be628d4.save();
    $22fd70b2233cc903$export$430c45605c9594b5.save();
});

