import { writeFileSync, readFileSync, existsSync } from "fs";

export class BotPermissions {
    banned = new Set<string>();
    otherAdmins = new Set<string>();

    static readonly filename = "permissions.json";

    save() {
        const permissions = {
            banned: [...this.banned],
            otherAdmins: [...this.otherAdmins]
        };

        writeFileSync(BotPermissions.filename, JSON.stringify(permissions, null, 4));
    }

    load() {
        if (!existsSync(BotPermissions.filename)) this.save();

        const permissions = JSON.parse(readFileSync(BotPermissions.filename, "utf8"));

        this.banned = new Set(permissions.banned);
        this.otherAdmins = new Set(permissions.otherAdmins);
    }
}