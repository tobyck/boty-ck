const fs = require("fs");

let [collection, name, description, args] = process.argv.slice(2);

args &&= JSON.stringify(args.split(","), null, 1)
    .replace(/\n\s?/g, " ")
    .replace(/\[\s/, "[")
    .replace(/\s\]/, "]");
    
args ??= "[]";

description = JSON.stringify(description);

const template = `${collection}Collection.commands.unshift(new Command(
    "${name}", ${args},
    ${description},
    async message => {
        
    }
));`;

const fileLines = fs.readFileSync(`./src/collections/${collection}.ts`, "utf8").split("\n");

const insertionIndex = fileLines.findIndex(line => line.includes("commands.unshift"));

fileLines.splice(insertionIndex, 0, template + "\n");

fs.writeFileSync(`./src/collections/${collection}.ts`, fileLines.join("\n"));