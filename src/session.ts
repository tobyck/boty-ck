import fs from "fs";

// type aliases for whether data is serializable or not
type Serializable = true;
type NonSerializable = false;

/* 
 * This is a type for an object that stores the props for each collection
 * if T is true, i.e. the object is serializable, then the props are stored 
 * as a normal JS object, otherwise they are stored as a Map object to ensure
 * that all property names are valid.
 */
type Props<T extends boolean> = Record<
    string,
    T extends true
    ? Record<string, string>
    : Map<string, string>
>;

// stores session data for a chat (T is the generic for Props<T>)
interface ChatData<T extends boolean> {
    props: Props<T>; // properties for each collection
    automations: {
        command: string,
        times: {
            day: number,
            time: number
        }[];
    }[]; // maps commands to list of days/times to run them
    whosPlayingMsgId: string; // id of the message containing who's playing in the next game
}

// stores all session data (T is whether the data is serializable or not)
interface SessionData<T extends boolean> {
    chats: Record<string, ChatData<T>>;
}

export class Session {
    data: SessionData<NonSerializable>;
    fileName: string; // name of the file to save to

    constructor(fileName: string) {
        this.fileName = fileName;

        // initialize with empty session (non-serializable which means props are in Maps)
        this.data = Session.blankSession<NonSerializable>();
    }

    // if the session data doesn't have an object for a chat, create one
    tryInitChatData(chatId: string): void {
        this.data.chats[chatId] ??= {
            props: {},
            automations: [],
            whosPlayingMsgId: ""
        };
    }

    // attempts to load a session
    load(): void {
        if (fs.existsSync(this.fileName)) {
            // parse JSON from file
            const loadedJSON: SessionData<Serializable> = JSON.parse(fs.readFileSync(this.fileName, "utf8"));

            // empty the current session
            this.data = Session.blankSession<NonSerializable>();

            // for each chat
            for (const [chatId, chatData] of Object.entries(loadedJSON.chats)) {
                this.tryInitChatData(chatId);

                this.data.chats[chatId].whosPlayingMsgId = chatData.whosPlayingMsgId;
                this.data.chats[chatId].automations = chatData.automations;

                // add a map object of props for each collection which has any
                for (const [collection, props] of Object.entries(chatData.props)) {
                    this.data.chats[chatId].props[collection] = new Map(Object.entries(props));
                }
            }
        }
    }

    save(): void {
        // create a new serializable session which will be saved
        const serializable = Session.blankSession<Serializable>();

        // fill in the session data in a similar way to how it was loaded
        for (const [chatId, chatData] of Object.entries(this.data.chats)) {
            serializable.chats[chatId] = {
                props: {},
                automations: chatData.automations,
                whosPlayingMsgId: chatData.whosPlayingMsgId
            };

            for (const [collection, props] of Object.entries(chatData.props)) {
                serializable.chats[chatId].props[collection] = Object.fromEntries(props);
            }
        }

        // stringify with 4 spaces for indentation and save to file
        fs.writeFileSync(this.fileName, JSON.stringify(serializable, null, 4));
    }

    static blankSession<T extends boolean = NonSerializable>(): SessionData<T> {
        return {
            chats: {}
        };
    }
}