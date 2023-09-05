import type { Chat, GroupChat } from "whatsapp-web.js";

import * as puppeteer from "puppeteer";
import { ElementHandle } from "puppeteer";

import { Collection, Command } from "../core";
import { hyphenateForURL, last, padTwo0s, pleaseSetTeam, pluralS } from "../helpers";
import { session } from "../bot";

const ultiCollection = new Collection(
    "ulti",
    "This collection contains commands for ultimate frisbee. All commands start with *!ulti/* and can be seen below:",
    true // give the collection the set, unset, and get commands
);

ultiCollection.commands.unshift(new Command(
    "numbers", [],
    "See how many people are playing",
    async message => {
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

                if (whosPlayingMsg) { // if message could be found
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

                        const props = ultiCollection!.props(session, chat);

                        // if the teamsize property doesn't exist, set it to 4 (for indoors)
                        if (!props.has("teamsize")) {
                            props.set("teamsize", "4");
                        }

                        const teamSize = parseInt(props.get("teamsize")!);

                        if (teamSize < 1) {
                            await message.reply(`*[bot]* Team size is set to ${teamSize} but must be more than zero.`);
                            return;
                        }

                        // get the number of participants (i.e. all players whether they're playing or not)
                        const numOfParticipants = chat.participants.length;

                        if (numOfParticipants < teamSize) {
                            await message.reply(`*[bot]* Your minimum team size is set to ${teamSize} but you have only ${numOfParticipants} ${numOfParticipants === 1 ? "person" : "people"} in this chat.`);
                            return;
                        }

                        if (numOfPlayers < teamSize) {
                            await message.reply(`*[bot]* So far we've got ${numOfPlayers || "no"} player${pluralS(numOfPlayers)}, so we need at least ${teamSize - numOfPlayers} more. ${numOfParticipants - numOfPlayers - notPlaying} people still to respond.`);
                        } else {
                            const subs = numOfPlayers - teamSize;
                            await message.reply(`*[bot]* We've got ${numOfPlayers} player${pluralS(numOfPlayers)} (${subs || "no"} sub${pluralS(subs)}).`);
                        }
                    } else {
                        await message.reply("*[bot]* No one has reacted to the message with who's playing yet.");
                    }
                } else {
                    await message.reply("*[bot]* Sorry, the message with who's playing is too far back.");
                }
            } else {
                await message.reply("*[bot]* Use *!ulti/who* to ask who's playing and try again later.");
            }
        } else {
            await message.reply("*[bot]* This command can only be used in a group chat.");
        }
    }
));

ultiCollection.commands.unshift(new Command(
    "who", [],
    "Asks who's playing",
    async message => {
        const chat = await message.getChat();

        if (chat.isGroup) { // only allow command in group chats
            // ask who's playing and store the id of that message in the session data
            session.tryInitChatData(chat.name);
            session.data.chats[chat.name].whosPlayingMsgId = (await chat.sendMessage("*[bot]* Who's playing? React to with this message with 👍 or 👎.")).id.id;
            session.save(); // update the session data file
        } else {
            await message.reply("*[bot]* This command can only be used in a group chat.");
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

    async spirit(): Promise<number> {
        return await this.node.$eval(".schedule-score-box-game-result", spiritEl => {
            return parseInt((spiritEl as HTMLDivElement).innerText);
        });
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
    // for example, 7:30pm on 4/6/2023 would be 202306041930
    async timestamp(): Promise<number> {
        let str = (await this.day()).split(" ")[1]
            .split("/")
            .map(Number)
            .map(padTwo0s)
            .reverse()
            .join("");

        const time = await this.time();

        let hour = parseInt(time.split(":")[0]);

        if (time.includes("PM")) {
            hour += 12;
        }

        // add hour and minutes to the string
        str += padTwo0s(hour) + time.split(":")[1].split(" ")[0];

        return parseInt(str);
    }
}

const getGames = async (url: string, chat: Chat): Promise<{
    games: Game[], browser: puppeteer.Browser
}> => {
    // make browser not headless, so we can see what's going on, and not close it when we're done
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // set default timeout to 15 seconds
    page.setDefaultTimeout(15000);

    try {
        await page.goto(url);
    } catch (_) {
        await chat.sendMessage(`*[bot]* Sorry, I couldn't find any games on ${url}`);
    }

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
    "ranking", [],
    "Shows the standings in the event specified in the \"event\" property",
    async message => {
        const chat = await message.getChat();

        const team = ultiCollection.props(session, chat).get("team");
        const event = ultiCollection.props(session, chat).get("event");

        if (!team || !event) {
            if (!team && !event) {
                await message.reply("*[bot]* Please specify a team and event using *!ulti/set team <team name>* and *!ulti/set event <event name>*");
                return;
            }

            if (!team) await message.reply("*[bot]* Please specify a team using *!ulti/set team <team name>*");
            if (!event) await message.reply("*[bot]* Please specify an event using *!ulti/set event <event name>* (just copy/paste from the website).");

            return;
        }

        const browser = await puppeteer.launch({ headless: "new" });

        const page = await browser.newPage();

        page.setDefaultTimeout(15_000);

        const url = `https://wellington.ultimate.org.nz/e/${hyphenateForURL(event)}/standings`;

        await page.goto(url);

        interface Team {
            name: string,
            rank: number,
            pointDiff: string,
        }

        // noinspection CommaExpressionJS
        const teams: Team[] = (await last(await page.$$(".striped-blocks")).evaluate(node => {
            return Array.from(node.getElementsByClassName("striped-block")).map(node => ({
                name: node.querySelector(".plain-link").innerHTML,
                rank: null,
                pointDiff: node.querySelectorAll(".span4")[4].innerHTML
            }));
        })).map((team, index) => (team.rank = index + 1, team));

        let rankingMessage = `*[bot]* Here are the standings for ${event} (there are ${teams.length} in total):\n\n\`\`\``;

        const ourRank = teams.find(
            team => team.name.toLowerCase() === ultiCollection.props(session, chat).get("team").toLowerCase()
        )?.rank;

        if (!ourRank) {
            await chat.sendMessage(`*[bot]* Sorry, I couldn't find "${team}" in the standings for ${event}.`);
            return;
        }

        // 2 teams above us, us, and 2 teams below
        const nearbyTeams: Team[] = [];

        // rank of the first team in the nearby teams
        const firstNearbyTeamRank = ourRank > teams.length - 2 // if we're in the bottom two
            ? teams.length - 5 // show the bottom 5
            : Math.max(0, ourRank - 3);

        for (let i = 0; i < 5; i++) {
            nearbyTeams.push(teams[i + firstNearbyTeamRank]);
        }

        const MAX_MSG_WIDTH = 27;

        const maxRankLength = nearbyTeams.slice().sort((a, b) => b.rank - a.rank)[0].rank.toString().length;
        const maxPointDiffLength = nearbyTeams.slice().sort((a, b) => b.pointDiff.length - a.pointDiff.length)[0].pointDiff.length;
        const maxNameLength = MAX_MSG_WIDTH - maxRankLength - 3 - maxPointDiffLength - 2;

        // adds a team to the table in the message
        const addTeam = (team: Team): void => {
            // truncate name if it's too long and pad it to the right length
            let name = team.name.slice(0, maxNameLength).padEnd(maxNameLength);

            // add ellipsis if it was truncated
            if (team.name.length > maxNameLength) name = name.slice(0, -1) + "…";

            rankingMessage += `${team.rank.toString().padStart(maxRankLength)} | ${name}  ${team.pointDiff.padEnd(maxPointDiffLength)}\n`;
        };

        // if the top team isn't in nearbyTeams
        if (nearbyTeams[0].rank !== 1) {
            addTeam(teams[0]);
        }

        // if there are teams between the top one and nearby teams
        if (nearbyTeams[0].rank > 2) {
            rankingMessage += " ".repeat(maxRankLength) + " | ...\n";
        }

        nearbyTeams.forEach(addTeam);

        // if there are teams between the bottom one and nearby teams
        if (nearbyTeams[nearbyTeams.length - 1].rank < teams.length) {
            rankingMessage += " ".repeat(maxRankLength) + " | ...\n";
        }

        rankingMessage += "```\nYou can see the full standings at " + url.slice(8);

        await chat.sendMessage(rankingMessage);
        await browser.close();
    }
));

ultiCollection.commands.unshift(new Command(
    "spirit", [],
    "Shows our spirit rating of our last game",
    async message => {
        const chat = await message.getChat();

        const teamName = ultiCollection.props(session, chat).get("team");

        if (teamName) {
            const url = `https://ultimate.org.nz/t/${hyphenateForURL(teamName)}/schedule/game_type/with_result`;
            const { games, browser } = await getGames(url, chat);
            const game = games?.[0];

            if (game) {
                const spirit = await game.spirit();
                if (spirit) await chat.sendMessage(`*[bot]* Our spirit rating for our last game was ${spirit}.`);
                else await chat.sendMessage("*[bot]* Our last game hasn't been given a spirit rating :(");
            } else await chat.sendMessage(`*[bot]* Hmm, I couldn't find any games on ${url}.`);

            await browser.close();
        } else await pleaseSetTeam(chat);
    }
));

ultiCollection.commands.unshift(new Command(
    "next", [],
    "Gets details about our next game",
    async message => {
        const chat = await message.getChat();

        const teamName = ultiCollection.props(session, chat).get("team");

        if (teamName) { // if a team is set
            const url = `https://ultimate.org.nz/t/${hyphenateForURL(teamName)}/schedule/event_id/active_events_only/game_type/upcoming`;
            const { games, browser } = await getGames(url, chat);

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
                await chat.sendMessage(`*[bot]* No upcoming games on ${url}.`);
            } else {
                const nextGame = gamesWithTimestamps
                    .filter(({ timestamp }) => timestamp > currentTimestamp)
                    .reduce((acc, cur) => cur.timestamp > acc.timestamp ? acc : cur).game;

                await chat.sendMessage(`*[bot]* Our next game is at ${await nextGame.time()} against ${await nextGame.opponent()} at ${await nextGame.location()} (${await nextGame.day()}).`);
            }

            await browser.close();
        } else await pleaseSetTeam(chat);
    }
));

ultiCollection.commands.unshift(new Command(
    "score", [],
    "Gets the score of the last game",
    async message => {
        const chat = await message.getChat();

        const teamName = ultiCollection.props(session, chat).get("team");

        if (teamName) {
            const url = `https://ultimate.org.nz/t/${hyphenateForURL(teamName)}/schedule/game_type/with_result`;
            const { games, browser } = await getGames(url, chat);

            if (games.length) {
                const [ourScore, theirScore] = await games[0].result();

                if (ourScore && theirScore) {
                    if (ourScore > theirScore) {
                        await chat.sendMessage(`*[bot]* We won ${ourScore} - ${theirScore}!`);
                    } else if (ourScore < theirScore) {
                        await chat.sendMessage(`*[bot]* We lost ${theirScore} - ${ourScore}.`);
                    } else {
                        await chat.sendMessage(`*[bot]* We tied ${ourScore} all.`);
                    }
                } else {
                    // if we got down here something went very wrong
                    /* eslint-disable */
                    console.log("ourScore:", ourScore);
                    console.log("theirScore:", theirScore);
                    /* eslint-enable */
                }
            } else {
                await chat.sendMessage(`*[bot]* Sorry, I couldn't find any games on ${url}.`);
            }

            await browser.close();
        } else await pleaseSetTeam(chat);
    }
));

export default ultiCollection;