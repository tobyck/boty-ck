import { writeFileSync, readFileSync, existsSync } from "fs";

export class BotPermissions {
    banned = new Set<string>();
    otherAdmins = new Set<string>();
    filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    save() {
        const permissions = {
            banned: [...this.banned],
            otherAdmins: [...this.otherAdmins]
        };

        writeFileSync(this.filename, JSON.stringify(permissions, null, 4));
    }

    load() {
        if (!existsSync(this.filename)) this.save();

        const permissions = JSON.parse(readFileSync(this.filename, "utf8"));

        this.banned = new Set(permissions.banned);
        this.otherAdmins = new Set(permissions.otherAdmins);
    }
}