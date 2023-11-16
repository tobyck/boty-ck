const fs = require("fs");

let [collection, name, argSyntax] = process.argv.slice(2);

const template = `${collection}Collection.commands.unshift(new Command<${argSyntax ? "VariadicCommand" : "NiladicCommand"}>(
    "${name}", ${argSyntax ? '"' + argSyntax + '"' : "null"},
    async ${argSyntax ? "(chat, args)" : "chat"} => {
        
    }
));`;

const fileLines = fs.readFileSync(`./src/collections/${collection}.ts`, "utf8").split("\n");

const insertionIndex = fileLines.findIndex(line => line.includes("commands.unshift"));

fileLines.splice(insertionIndex, 0, template + "\n");

fs.writeFileSync(`./src/collections/${collection}.ts`, fileLines.join("\n"));