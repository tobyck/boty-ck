/* 
 * Ultimate Frisbee Collection (run with !ulti/<command>)
 *
 * !score - Get the score of the last game
 * !next - Get details about our next game
 */

import type { GroupChat } from "whatsapp-web.js";

import * as puppeteer from "puppeteer";
import { ElementHandle } from "puppeteer";

import { Collection, Command } from "../core";
import { hyphenateForURL, padTwo0s, pleaseSetTeam, pluralS } from "../helpers";
import { session } from "../bot";

const ultiCollection = new Collection(
    "ulti",
    "This collection contains commands for ultimate frisbee. All commands start with *!ulti/* and can be seen below:"
);

ultiCollection.commands.unshift(new Command(
    "numbers", [],
    "See how many people are playing",
    async (message, _, collection) => {
        const chat = await message.getChat() as GroupChat;

        if (chat.isGroup) { // only allow command in group chats
            // get the message id of the whosPlaying message
            const whosPlayingMsgId = session.data.chats[chat.name].whosPlayingMsgId;

            if (whosPlayingMsgId) { // if that id exists
                // get the last 100 of my messages in the chat
                const messages = await chat.fetchMessages({ limit: 100, fromMe: true });

                // find the message with the whosPlayingMsgId
                const whosPlayingMsg = messages.find(
                    msg => msg.id.id === whosPlayingMsgId
                );

                if (whosPlayingMsg) { // if could be found
                    // if anyone has reacted to the message yet
                    if (whosPlayingMsg.hasReaction) {
                        // get the reactions
                        const reactions = await whosPlayingMsg.getReactions();

                        // get the number of people who are playing
                        const numOfPlayers: number = reactions
                            .find(reaction => reaction.aggregateEmoji === "👍")
                            ?.senders.length ?? 0;

                        // get the number of people who are NOT playing
                        const notPlaying: number = reactions
                            .find(reaction => reaction.aggregateEmoji === "👎")
                            ?.senders.length ?? 0;

                        const props = collection!.props(session, chat);

                        // if the teamsize property doesn't exist, set it to 4 (for indoors)
                        if (!props.has("teamsize")) {
                            props.set("teamsize", "4");
                        }

                        const teamSize = parseInt(props.get("teamsize")!);

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

                        if (numOfPlayers < teamSize) {
                            message.reply(`*[bot]* So far we've got ${numOfPlayers || "no"} player${pluralS(numOfPlayers)}, so we need at least ${teamSize - numOfPlayers} more. ${numOfParticipants - numOfPlayers - notPlaying} people still to respond.`);
                        } else {
                            const subs = numOfPlayers - teamSize;
                            message.reply(`*[bot]* We've got ${numOfPlayers} player${pluralS(numOfPlayers)} (${subs || "no"} sub${pluralS(subs)}).`);
                        }
                    } else {
                        message.reply("*[bot]* No one has reacted to the message with who's playing yet.");
                    }
                } else {
                    message.reply("*[bot]* Sorry, the message with who's playing is too far back.");
                }
            } else {
                message.reply("*[bot]* Use *!ulti/who* to ask who's playing and try again later.");
            }
        } else {
            message.reply("*[bot]* This command can only be used in a group chat.");
        }
    }
));

ultiCollection.commands.unshift(new Command(
    "who", [],
    "Ask who's playing",
    async message => {
        const chat = await message.getChat();

        if (chat.isGroup) { // only allow command in group chats
            // ask who's playing and store the id of that message in the session data
            session.tryInitChatData(chat.name);
            session.data.chats[chat.name].whosPlayingMsgId = (await chat.sendMessage("*[bot]* Who's playing? React to with this message with 👍 or 👎.")).id.id;
            session.save(); // update the session data file
        } else {
            message.reply("*[bot]* This command can only be used in a group chat.");
        }
    }
));

class Game {
    node: ElementHandle<HTMLDivElement>;

    constructor(node: ElementHandle<HTMLDivElement>) {
        this.node = node;
    }

    async result(): Promise<[number, number]> {
        return (await this.node.$$eval(".score", scoreEl => {
            return scoreEl.map(el => parseInt(el.innerHTML));
        })) as [number, number];
    }

    async time(): Promise<string> {
        return (await this.node.$eval(".push-right", node => {
            return node.innerHTML.trim();
        }));
    }

    async day(): Promise<string> {
        return (await this.node.$eval(".push-left", node => {
            return node.innerHTML;
        }));
    }

    async opponent(): Promise<string> {
        return (await this.node.$$eval(
            ".schedule-team-name .plain-link",
            (nodes: HTMLDivElement[]) => {
                return nodes.map(node => node.innerText.split("\n")[0].trim());
            }
        ))[1];
    }

    async location(): Promise<string> {
        return (await this.node.$$eval(
            ".push-left",
            (nodes: HTMLLinkElement[]) => {
                return nodes.map(node => node.innerText);
            }
        ))[1];
    }

    // get a single number representing the time of the game
    // for example, 7:30pm on 4/06/2023 would be 202306041930
    async timestamp(): Promise<number> {
        let str = (await this.day()).split(" ")[1].split("/").reverse().join("");

        const time = await this.time();

        let hour = parseInt(time.split(":")[0]);

        if (time.includes("PM")) {
            hour += 12;
        }

        // add hour and minutes to the string
        str += hour.toString().padStart(2, "0") + time.split(":")[1].split(" ")[0];

        return parseInt(str);
    }
}

const getGames = async (url: string): Promise<{
    games: Game[], browser: puppeteer.Browser
}> => {
    // make browser not headless so we can see what's going on, and not close it when we're done
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // set default timeout to 15 seconds
    await page.setDefaultTimeout(15_000);

    await page.goto(url);

    // set screen size to 1080p
    await page.setViewport({ width: 1080, height: 1024 });

    try {
        const gameList = await page.waitForSelector(".game-list") as ElementHandle<HTMLDivElement>;

        const gameNodes = await gameList.$$(".game-list-item") as ElementHandle<HTMLDivElement>[];

        const games = await Promise.all(gameNodes.map(async node => {
            return new Game(node);
        }));

        return { games, browser };
    } catch (_) {
        return {
            games: [],
            browser
        };
    }
};

ultiCollection.commands.unshift(new Command(
    "next", [],
    "Get details about our next game",
    async (message, _, collection) => {
        const chat = await message.getChat();

        const teamName = collection.props(session, chat).get("team");

        if (teamName) { // if a team is set
            const url = `https://ultimate.org.nz/t/${hyphenateForURL(teamName)}/schedule/event_id/active_events_only/game_type/upcoming`;
            const { games, browser } = await getGames(url);

            const gamesWithTimestamps = await Promise.all(games.map(
                async game => ({ game, timestamp: await game.timestamp() })
            ));

            const date = new Date();

            // current timestamp in format returned by Game.timestamp()
            const currentTimestamp = parseInt(
                date.getFullYear() +
                padTwo0s(date.getMonth()) +
                padTwo0s(date.getDate()) +
                padTwo0s(date.getHours()) +
                padTwo0s(date.getMinutes())
            );

            if (gamesWithTimestamps.length === 0) {
                chat.sendMessage(`*[bot]* No upcoming games on ${url}.`);
            } else {
                const nextGame = gamesWithTimestamps
                    .filter(({ timestamp }) => timestamp > currentTimestamp)
                    .reduce((acc, cur) => cur.timestamp > acc.timestamp ? acc : cur).game;

                chat.sendMessage(`*[bot]* Our next game is at ${await nextGame.time()} against ${await nextGame.opponent()} at ${await nextGame.location()} (${await nextGame.day()}).`);
            }

            browser.close();
        } else {
            pleaseSetTeam(chat);
        }
    }
));

ultiCollection.commands.unshift(new Command(
    "score", [],
    "Get the score of the last game",
    async (message, _, collection) => {
        const chat = await message.getChat();

        const teamName = collection.props(session, chat).get("team");

        if (teamName) {
            const url = `https://ultimate.org.nz/t/${hyphenateForURL(teamName)}/schedule/game_type/with_result`;
            const { games, browser } = await getGames(url);

            if (games.length) {
                const [ourScore, theirScore] = await games[0].result();

                if (ourScore && theirScore) {
                    if (ourScore > theirScore) {
                        chat.sendMessage(`*[bot]* We won ${ourScore} - ${theirScore}!`);
                    } else if (ourScore < theirScore) {
                        chat.sendMessage(`*[bot]* We lost ${theirScore} - ${ourScore}.`);
                    } else {
                        chat.sendMessage(`*[bot]* We tied ${ourScore} all.`);
                    }
                } else {
                    // if we got down here something went very wrong
                    console.log("ourScore:", ourScore);
                    console.log("theirScore:", theirScore);
                }
            } else {
                chat.sendMessage(`*[bot]* Sorry, I couldn't find any games on ${url}.`);
            }

            browser.close();
        } else {
            pleaseSetTeam(chat);
        }
    }
));

export default ultiCollection;