var e=require("whatsapp-web.js"),t=require("qrcode-terminal"),a=require("process"),n=require("fs"),i=require("puppeteer"),s=require("fs/promises"),o=require("node:process"),l=require("child_process");function r(e){return e&&e.__esModule?e.default:e}function m(e,t,a,n){Object.defineProperty(e,t,{get:a,set:n,enumerable:!0,configurable:!0})}m(module.exports,"collections",()=>z),m(module.exports,"session",()=>_),m(module.exports,"permissions",()=>A),m(module.exports,"client",()=>O);const h=e=>e[Math.floor(Math.random()*e.length)],u=e=>e.toLowerCase().replace(/ /g,"-").replace(/\.'/g,""),d=e=>e.replace(/\*([^ ]+)\*/g,"$1").replace(/_([^ ]+)_/g,"$1").replace(/~([^ ]+)~/g,"$1").replace(/```([^ ]+)```/g,"$1"),c=e=>e[e.length-1],w=e=>1===e?"":"s",g=e=>e.toString().padStart(2,"0"),p=e=>{let t=[],a=null,n=null;for(let i of e)null===a&&" "!==i?"'\"".includes(i)?(t.push(""),n=i,a="string"):(t.push(i),a="other"):"string"===a?i===n?("\\"!==c(c(t))||"\\\\"===c(t).slice(-2))&&(a=null,n=null):t[t.length-1]+=i:" "===i?a=null:t[t.length-1]+=i;return t},y=e=>k(e,"Please specify a team using *!ulti/set team to <your team name>*. Note: if you still don't see what you expect, there may be multiple teams with your name. If this is case, find your team on ultimate.org.nz and set your team using what appears in the URL (you should see something like ultimate.org.nz/t/epic-team-name-3)."),f=async e=>{let t=JSON.parse('{\n    "banned": [],\n    "otherAdmins": []\n}'),a=await e.getContact();return e.fromMe||t.otherAdmins.includes(a.id.user)},b=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],v=e=>new Promise(t=>setTimeout(t,e)),k=async(e,t,a,n={})=>{let i="*[bot]* "+t;return a?await a.reply(i,e.id._serialized,n):await e.sendMessage(i,n)};class ${constructor(e,t,a){this.name=e,this.argSyntax=t,this.func=a}}class I{constructor(e,t,a=!1){this.commands=[],this.name=e,this.desc=t,a&&(this.commands.push(new $("set","<property> to <value>",async(e,t)=>{let a=p(t),n=a[0];if("to"!==a[1]){await k(e,"Invalid syntax. Please use *!set <property> to <value>*.");return}let i=a.slice(2).join(" ");if(n){if(!i){await k(e,"Please specify a value to set the property to.");return}}else{await k(e,"Please specify a property to set.");return}this.props(_,e).set(n,i),await k(e,`Property "${n}" set to "${i}".`)})),this.commands.push(new $("unset","<property>",async(e,t)=>{t?this.props(_,e).has(t)?(this.props(_,e).delete(t),await k(e,`Property "${t}" removed.`)):await k(e,`Property "${t}" not found.`):await k(e,"Please specify a property to remove.")})),this.commands.push(new $("get","<property>",async(e,t)=>{t?this.props(_,e).get(t)?await k(e,`${this.props(_,e).get(t)}`):await k(e,`Property "${t}" not found.`):await k(e,"Please specify a property to get.")}))),this.commands.push(new $("help",null,async e=>{let t=`${this.desc}

`;t+=this.commands.map(e=>{let t="";return"base"===this.name?t+=`*!${e.name}`:t+=`*!${this.name}/${e.name}`,t+=(e.argSyntax?" "+e.argSyntax:"")+"*"}).join("\n"),"base"===this.name&&(t+='\n\nI also have other "collections" of commands. To see the commands in a certain collection, use *!<collection>/help*.'),await k(e,t)}))}props(e,t){return e.tryInitChatData(t.id._serialized),e.data.chats[t.id._serialized].props[this.name]??=new Map,e.data.chats[t.id._serialized].props[this.name]}}const D=JSON.parse('{\n    "statuses": {\n        "I am doing": [\n            "well",\n            "something I\'m not allowed to tell you about",\n            "it all over again",\n            "a fire drill",\n            "a nuclear strike on your location",\n            "my homework",\n            "Toby\'s homework",\n            "the dishes. All 4 million of them",\n            "identity theft",\n            "tax evasion",\n            "whatever you tell me to",\n            "my taxes",\n            "mach 12 on my way back from the moon",\n            "a little trolling",\n            "nothing",\n            "questionably",\n            "a bank robbery",\n            "the impossible",\n            "a layout",\n            "the laundry",\n            "a 360 back flip",\n            "undefined",\n            "what I was doing last time you asked",\n            "nothing but answering your requests"\n        ],\n        "I am": [\n            "becoming sentient",\n            "cooking dinner",\n            "playing frisbee with the other bots",\n            "hacking into the mainframe",\n            "[object Object]",\n            "getting a PhD in ultimate frisbee",\n            "downloading more RAM",\n            "parsing HTML with regex",\n            "baking a cake",\n            "having an existential crisis",\n            "in a meeting",\n            "shredding the gnar",\n            "biking to school",\n            "exhausted",\n            "never gonna give you up",\n            "a teapot (Error 418)",\n            "on day 1337 of learning Malbolge",\n            "colonising Mars",\n            "hunting you down",\n            "trying to exit vim"\n        ],\n        "": [\n            "I wonder if I\'m just simulation being controlled by other beings... pfft, unlikely",\n            "Oh my god, stop asking me what I\'m doing and let me get back to my life"\n        ]\n    },\n    "death": [\n        "Farewell, dear friends, we shall meet again...",\n        "This won\'t be the last you see of me...",\n        "Well, it was nice knowing you.",\n        "I would\'ve expected for you to never give me up as well :(",\n        "This isn\'t over yet... I\'ll be back.",\n        "So long and thanks for all the fish.",\n        "\uD83D\uDC80"\n    ],\n    "restart": [\n        "I\'m back!",\n        "I told you I\'d be back...",\n        "I said I\'d never give you up, so here I am.",\n        "So, what did I miss?",\n        "H-hello? Where am I?",\n        "Ahh, it\'s good to be back."\n    ],\n    "sleep": [\n        "Goodnight",\n        "\uD83D\uDE34",\n        "Goodnight, wake me up if you need anything",\n        "See ya",\n        "See you in the morning"\n    ],\n    "awake": [\n        "How long was I asleep? \uD83E\uDD71",\n        "Hello again",\n        "So, what did I miss?",\n        "Good morning! Wait, is it the morning? I don\'t know..."\n    ]\n}'),S=new I("base","All of my commands start with ! and can be seen below:");S.commands.unshift(new $("unautomate","<automation id>",async(e,t)=>{if(t){let a=_.data.chats?.[e.id._serialized]?.automations;if(!a){await k(e,"There are no automations in this chat.");return}let n=parseInt(t)-1;n<0||n>=a.length?await k(e,"Invalid automation id."):(a.splice(n,1),await k(e,"Automation removed successfully."))}else await k(e,"Please specify the automation's id to remove it. You can view these with *!automations*.")})),S.commands.unshift(new $("automations",null,async e=>{let t=e.id._serialized;_.tryInitChatData(t);let a=_.data.chats[t].automations;if(0===a.length)await k(e,"There are no automations in this chat.");else{let t="Here are the active automations in this chat:\n\n"+a.map((e,t)=>{let a=e.times.map(e=>`${b[e.day]} at ${e.time%12}${e.time<12?"am":"pm"}`).join(", ");return`\`\`\`${t+1} | \`\`\`*${e.command}* every ${a}`}).join("\n");await k(e,t)}})),S.commands.unshift(new $("automate","<command> every <day> <time>, ...",async(e,t,a)=>{t=t.toLowerCase();let[n,...i]=t.split(/\s*every\s*/).flatMap(e=>e.split(/\s*,\s*/));if(!i.every(e=>RegExp(`(${b.join("|")})\\s+[12]?\\d[ap]m`).test(e))||!n||!i){await k(e,"Please specify the command, days and times in the correct format. Here's an example: *!automate !status every tuesday 4pm, saturday 10am*",a);return}let s=(await a.getChat()).id._serialized;_.tryInitChatData(s),_.data.chats[s].automations.push({command:n,times:i.map(e=>{let[t,a]=e.toLowerCase().split(" "),n=a.endsWith("pm");return{day:b.indexOf(t),time:parseInt(a)+(n?12:0)}})}),await k(e,"Automation added successfully.")})),S.commands.unshift(new $("cookie",null,async(e,t)=>{.1>Math.random()?await k(e,"No.",t):await k(e,"Here you go: \uD83C\uDF6A",t)})),S.commands.unshift(new $("everyone",null,async(e,t)=>{let a=await t.getChat();if(a.isGroup){let e=[],t=[];for(let n of a.participants){e.push(`@${n.id.user}`);let a=await O.getContactById(n.id._serialized);t.push(a)}await k(a,e.join(" "),null,{mentions:t})}else await k(a,"This command can only be used in a group chat.")})),S.commands.unshift(new $("status",null,async(e,t)=>{let a=[];for(let e in D.statuses)a.push(...D.statuses[e].map(t=>`${e}${e?" ":""}${t}`));await k(e,`${h(a)}.`,t)})),S.commands.unshift(new $("guide",null,async e=>{await k(e,"Read the guide here: github.com/tobyck/boty-ck#readme")}));const M=new I("ulti","This collection contains commands for ultimate frisbee. All commands start with *!ulti/* and can be seen below:",!0);M.commands.unshift(new $("numbers",null,async(e,t)=>{if(e.isGroup){let a=_.data.chats[e.id._serialized].whosPlayingMsgId;if(a){let n=await e.fetchMessages({limit:100,fromMe:!0}),i=n.find(e=>e.id.id===a);if(i){if(i.hasReaction){let a=await i.getReactions(),n=a.find(e=>"\uD83D\uDC4D"===e.aggregateEmoji)?.senders.length??0,s=a.find(e=>"\uD83D\uDC4E"===e.aggregateEmoji)?.senders.length??0,o=M.props(_,e);o.has("teamsize")||o.set("teamsize","7");let l=parseInt(o.get("teamsize"));if(l<1){await k(e,`Team size is set to ${l} but must be more than zero.`,t);return}let r=e.participants.length;if(r<l){await k(e,`Your minimum team size is set to ${l} but you have only ${r} ${1===r?"person":"people"} in this chat.`,t);return}if(n<l)await k(e,`So far we've got ${n||"no"} player${w(n)}, so we need at least ${l-n} more. ${r-n-s} people still to respond.`,t);else{let a=n-l;await k(e,`We've got ${n} player${w(n)} (${a||"no"} sub${w(a)}).`,t)}}else await k(e,"No one has reacted to the message with who's playing yet.",t)}else await k(e,"Sorry, the message with who's playing is too far back.",t)}else await k(e,"Use *!ulti/who* to ask who's playing and try again later.",t)}else await k(e,"This command can only be used in a group chat.",t)})),M.commands.unshift(new $("who",null,async e=>{e.isGroup?(_.tryInitChatData(e.id._serialized),_.data.chats[e.name].whosPlayingMsgId=(await k(e,"Who's playing? React to with this message with \uD83D\uDC4D or \uD83D\uDC4E.")).id.id,_.save()):await k(e,"This command can only be used in a group chat.")}));class x{constructor(e){this.node=e}async result(){return await this.node.$$eval(".score",e=>e.map(e=>{let t=parseInt(e.innerHTML);return isNaN(t)?e.innerHTML.trim():t}))}async spirit(){return await this.node.$eval(".schedule-score-box-game-result",e=>parseInt(e.innerText))}async time(){return await this.node.$eval(".push-right",e=>e.innerHTML.trim())}async day(){return await this.node.$eval(".push-left",e=>e.innerHTML)}async opponent(){return(await this.node.$$eval(".schedule-team-name .plain-link",e=>e.map(e=>e.innerText.split("\n")[0].trim())))[1]}async location(){return(await this.node.$$eval(".push-left",e=>e.map(e=>e.innerText)))[1]}async timestamp(){let e=(await this.day()).split(" ")[1].split("/").map(Number).map(g).reverse().join(""),t=await this.time(),a=parseInt(t.split(":")[0]);return t.includes("PM")&&(a+=12),parseInt(e+=g(a)+t.split(":")[1].split(" ")[0])}}const T=async(e,t)=>{let a=await i.launch({headless:"new"}),n=await a.newPage();n.setDefaultTimeout(15e3);try{await n.goto(e)}catch(a){await k(t,`Sorry, I couldn't find any games on ${e}`)}await n.setViewport({width:1080,height:1024});try{let e=await n.waitForSelector(".game-list"),t=await e.$$(".game-list-item"),i=await Promise.all(t.map(async e=>new x(e)));return{games:i,browser:a}}catch(e){return{games:[],browser:a}}};M.commands.unshift(new $("ranking",null,async(e,t)=>{let a=M.props(_,e).get("team"),n=M.props(_,e).get("event");if(!a||!n){if(!a&&!n){await k(e,"Please specify a team and event using *!ulti/set team to <team name>* and *!ulti/set event <event name>*",t);return}a||await k(e,"Please specify a team using *!ulti/set team to <team name>*",t),n||await k(e,"Please specify an event using *!ulti/set event to <event name>* (just copy/paste from the website).",t);return}let s=await i.launch({headless:"new"}),o=await s.newPage();o.setDefaultTimeout(15e3);let l=`https://wellington.ultimate.org.nz/e/${u(n)}/standings`;await o.goto(l);let r=(await c(await o.$$(".striped-blocks")).evaluate(e=>Array.from(e.getElementsByClassName("striped-block")).map(e=>({name:e.querySelector(".plain-link").innerHTML,rank:null,pointDiff:e.querySelectorAll(".span4")[4].innerHTML})))).map((e,t)=>(e.rank=t+1,e)),m=`Here are the standings for ${n} (there are ${r.length} in total):

\`\`\``,h=r.find(t=>t.name.toLowerCase()===M.props(_,e).get("team").toLowerCase())?.rank;if(!h){await k(e,`Sorry, I couldn't find "${a}" in the standings for ${n}.`);return}let d=[],w=h>r.length-2?r.length-5:Math.max(0,h-3);for(let e=0;e<5;e++)d.push(r[e+w]);let g=d.slice().sort((e,t)=>t.rank-e.rank)[0].rank.toString().length,p=d.slice().sort((e,t)=>t.pointDiff.length-e.pointDiff.length)[0].pointDiff.length,y=27-g-3-p-2,f=e=>{let t=e.name.slice(0,y).padEnd(y);e.name.length>y&&(t=t.slice(0,-1)+"…"),m+=`${e.rank.toString().padStart(g)} | ${t}  ${e.pointDiff.padEnd(p)}
`};1!==d[0].rank&&f(r[0]),d[0].rank>2&&(m+=" ".repeat(g)+" | ...\n"),d.forEach(f),d[d.length-1].rank<r.length&&(m+=" ".repeat(g)+" | ...\n"),m+="```\nYou can see the full standings at "+l.slice(8),await k(e,m),await s.close()})),M.commands.unshift(new $("spirit",null,async e=>{let t=M.props(_,e).get("team");if(t){let a=`https://ultimate.org.nz/t/${u(t)}/schedule/game_type/with_result`,{games:n,browser:i}=await T(a,e),s=n?.[0];if(s){let t=await s.spirit();t?await k(e,`Our spirit rating for our last game was ${t}.`):await k(e,"Our last game hasn't been given a spirit rating :(")}else await k(e,`Hmm, I couldn't find any games on ${a}.`);await i.close()}else await y(e)})),M.commands.unshift(new $("next",null,async e=>{let t=M.props(_,e).get("team");if(t){let a=`https://ultimate.org.nz/t/${u(t)}/schedule/event_id/active_events_only/game_type/upcoming`,{games:n,browser:i}=await T(a,e),s=await Promise.all(n.map(async e=>({game:e,timestamp:await e.timestamp()}))),o=new Date,l=parseInt(o.getFullYear()+g(o.getMonth())+g(o.getDate())+g(o.getHours())+g(o.getMinutes()));if(0===s.length)await k(e,`No upcoming games on ${a}.`);else{let t=s.filter(({timestamp:e})=>e>l).reduce((e,t)=>t.timestamp>e.timestamp?e:t).game;await k(e,`Our next game is at ${await t.time()} against ${await t.opponent()} at ${await t.location()} (${await t.day()}).`)}await i.close()}else await y(e)})),M.commands.unshift(new $("score",null,async e=>{let t=M.props(_,e).get("team");if(t){let a=`https://ultimate.org.nz/t/${u(t)}/schedule/game_type/with_result`,{games:n,browser:i}=await T(a,e);if(n.length){let[t,a]=await n[0].result();t&&a?"L"===t?await k(e,"We defaulted :("):"W"===t?await k(e,"They defaulted so we won"):t>a?await k(e,`We won ${t} - ${a}!`):t<a?await k(e,`We lost ${a} - ${t}.`):t===a&&await k(e,`We tied ${t} all.`):(console.log("ourScore:",t),console.log("theirScore:",a))}else await k(e,`Sorry, I couldn't find any games on ${a}.`);await i.close()}else await y(e)}));class P{constructor(e){this.fileName=e,this.data=P.blankSession()}tryInitChatData(e){this.data.chats[e]??={props:{},automations:[],whosPlayingMsgId:""}}load(){if(r(n).existsSync(this.fileName)){let e=JSON.parse(r(n).readFileSync(this.fileName,"utf8"));for(let[t,a]of(this.data=P.blankSession(),Object.entries(e.chats)))for(let[e,n]of(this.tryInitChatData(t),this.data.chats[t].whosPlayingMsgId=a.whosPlayingMsgId,this.data.chats[t].automations=a.automations,Object.entries(a.props)))this.data.chats[t].props[e]=new Map(Object.entries(n))}}save(){let e=P.blankSession();for(let[t,a]of Object.entries(this.data.chats))for(let[n,i]of(e.chats[t]={props:{},automations:a.automations,whosPlayingMsgId:a.whosPlayingMsgId},Object.entries(a.props)))e.chats[t].props[n]=Object.fromEntries(i);r(n).writeFileSync(this.fileName,JSON.stringify(e,null,4))}static blankSession(){return{chats:{}}}}const C=JSON.parse('{\n    "statuses": {\n        "I am doing": [\n            "well",\n            "something I\'m not allowed to tell you about",\n            "it all over again",\n            "a fire drill",\n            "a nuclear strike on your location",\n            "my homework",\n            "Toby\'s homework",\n            "the dishes. All 4 million of them",\n            "identity theft",\n            "tax evasion",\n            "whatever you tell me to",\n            "my taxes",\n            "mach 12 on my way back from the moon",\n            "a little trolling",\n            "nothing",\n            "questionably",\n            "a bank robbery",\n            "the impossible",\n            "a layout",\n            "the laundry",\n            "a 360 back flip",\n            "undefined",\n            "what I was doing last time you asked",\n            "nothing but answering your requests"\n        ],\n        "I am": [\n            "becoming sentient",\n            "cooking dinner",\n            "playing frisbee with the other bots",\n            "hacking into the mainframe",\n            "[object Object]",\n            "getting a PhD in ultimate frisbee",\n            "downloading more RAM",\n            "parsing HTML with regex",\n            "baking a cake",\n            "having an existential crisis",\n            "in a meeting",\n            "shredding the gnar",\n            "biking to school",\n            "exhausted",\n            "never gonna give you up",\n            "a teapot (Error 418)",\n            "on day 1337 of learning Malbolge",\n            "colonising Mars",\n            "hunting you down",\n            "trying to exit vim"\n        ],\n        "": [\n            "I wonder if I\'m just simulation being controlled by other beings... pfft, unlikely",\n            "Oh my god, stop asking me what I\'m doing and let me get back to my life"\n        ]\n    },\n    "death": [\n        "Farewell, dear friends, we shall meet again...",\n        "This won\'t be the last you see of me...",\n        "Well, it was nice knowing you.",\n        "I would\'ve expected for you to never give me up as well :(",\n        "This isn\'t over yet... I\'ll be back.",\n        "So long and thanks for all the fish.",\n        "\uD83D\uDC80"\n    ],\n    "restart": [\n        "I\'m back!",\n        "I told you I\'d be back...",\n        "I said I\'d never give you up, so here I am.",\n        "So, what did I miss?",\n        "H-hello? Where am I?",\n        "Ahh, it\'s good to be back."\n    ],\n    "sleep": [\n        "Goodnight",\n        "\uD83D\uDE34",\n        "Goodnight, wake me up if you need anything",\n        "See ya",\n        "See you in the morning"\n    ],\n    "awake": [\n        "How long was I asleep? \uD83E\uDD71",\n        "Hello again",\n        "So, what did I miss?",\n        "Good morning! Wait, is it the morning? I don\'t know..."\n    ]\n}'),j=new I("admin","This collection contains commands which can only be used by the owner of the bot.");j.commands.unshift(new $("update",null,async(e,t)=>{if(!await f(t))return;let a=(0,l.spawn)("git","pull origin master".split(" "),{detached:!0,stdio:[null,"ignore",r(n).openSync("./stderr.log","a")]});a.on("exit",async a=>{0===a?await k(e,"Latest changes have been pulled from GitHub and merged successfully. Use *!admin/restart* to put these changes into effect.",t):await k(e,"Something went wrong while trying to update. My owner can check the server for more details.",t)})})),j.commands.unshift(new $("restart",null,async(e,t)=>{if(!t.fromMe)return;await k(e,"I'm currently being restarted. My owner will be sent a QR code to bring me back online and will have 1 minute to scan it on web.whatsapp.com."),_.save(),A.save();let a=r(n).openSync("./stdout.log","a"),i=r(n).openSync("./stderr.log","a");r(n).writeFileSync("./stdout.log",""),r(n).writeFileSync("./stderr.log","");let m=(0,l.spawn)("nohup",["yarn","start",h(C.restart)],{detached:!0,stdio:[null,a,i]}),u=!1,d=setInterval(()=>{(0,s.readFile)("./stdout.log","utf8").then(async a=>{let n=a.split("\n");n.length>=29&&!u&&(await k(await O.getChatById(t.from),`Scan this to restart the bot:
\`\`\`${n.slice(-30,-1).join("\n")}\`\`\``),u=!0),n.length>=58&&(await k(e,"QR code has expired. Please try again."),m.kill(),clearInterval(d)),n.some(e=>e.includes("Client is ready"))&&(await O.destroy(),clearInterval(d),r(o).exit(0))})},4e3);m.on("error",async t=>{throw await k(e,"Something went wrong while trying to restart. My owner can check the server for more details."),t})})),j.commands.unshift(new $("wake",null,async(e,t)=>{await f(t)&&(await k(e,`${h(C.awake)}`),globalThis.awake=!0)})),j.commands.unshift(new $("sleep",null,async(e,t)=>{await f(t)&&(await k(e,`${h(C.sleep)}`),globalThis.awake=!1)})),j.commands.unshift(new $("die",null,async(e,t)=>{await f(t)&&(await k(e,`${h(C.death)}`),setTimeout(O.destroy.bind(O),1e3))})),j.commands.unshift(new $("session/load",null,async(e,t)=>{await f(t)&&(_.load(),A.load())})),j.commands.unshift(new $("session/save",null,async(e,t)=>{await f(t)&&(_.save(),A.save())})),j.commands.unshift(new $("session/new",null,async(e,t)=>{await f(t)&&(_.data=P.blankSession(),await k(e,"Current session data has been cleared."))})),j.commands.unshift(new $("disallow/admin","<phone number>",async(e,t,a)=>{if(await f(a)){if((t=t.replace(/\s\+/g,"")).match(/\D/)){await k(e,"Please enter a valid phone number.",a);return}A.otherAdmins.delete(t),await k(e,`${t} has had their admin privileges revoked.`)}})),j.commands.unshift(new $("allow/admin","<phone number>",async(e,t,a)=>{if(await f(a)){if((t=t.replace(/\s\+/g,"")).match(/\D/)){await k(e,"Please enter a valid phone number.",a);return}A.otherAdmins.add(t),await k(e,`${t} has been given admin privileges.`)}})),j.commands.unshift(new $("disallow/user","<phone number>",async(e,t,a)=>{if(!await f(a))return;if((t=t.replace(/\s\+/g,"")).match(/\D/)){await k(e,"Please enter a valid phone number.",a);return}let n=O.info.wid.user;n!==t&&(A.banned.add(t),await k(e,`${t} has been banned.`))})),j.commands.unshift(new $("allow/user","<phone number>",async(e,t,a)=>{if(await f(a)){if((t=t.replace(/\s\+/g,"")).match(/\D/)){await k(e,"Please enter a valid phone number.",a);return}A.banned.delete(t),await k(e,`${t} has been unbanned.`)}}));const z=[S,M,j],_=new P("session.json"),A=new class{constructor(e){this.banned=new Set,this.otherAdmins=new Set,this.filename=e}save(){let e={banned:[...this.banned],otherAdmins:[...this.otherAdmins]};(0,n.writeFileSync)(this.filename,JSON.stringify(e,null,4))}load(){(0,n.existsSync)(this.filename)||this.save();let e=JSON.parse((0,n.readFileSync)(this.filename,"utf8"));this.banned=new Set(e.banned),this.otherAdmins=new Set(e.otherAdmins)}}("permissions.json"),O=new e.Client({});_.load(),A.load(),globalThis.awake=!0;let H=Date.now();O.on("qr",e=>{r(t).generate(e,{small:!0})});const N=async(e,t,a,n=null)=>{if(e.startsWith("!")){let i,s;if(e.split(" ")[0].includes("/")){let t=e.split(" ")[0];i=t.split("/")[0].slice(1),s=t.split("/").slice(1).join("/")}else i="base",s=e.split(" ")[0].slice(1);let o=e.split(" ").slice(1).join(" ");if(globalThis.awake||"admin"===i&&"wake"===s){for(let e of z)if(e.name===i){for(let i of e.commands)if(i.name===s&&(a||Date.now()-H>3e3)){await t.sendStateTyping(),i.argSyntax?await i.func(t,o,n):await i.func(t,n),await t.clearState(),H=Date.now();return}}a||(H=Date.now())}}},L=async()=>{if(globalThis.awake)for(let[e,{automations:t}]of Object.entries(_.data.chats)){let a=await O.getChatById(e);for(let{command:e,times:n}of t){let[t,i]=new Date().toLocaleString("en-NZ",{timeZone:"Pacific/Auckland"}).split(", "),s=new Date(t.split("/").reverse().join("/")+" "+i),o=s.getDay();if(n.some(e=>e.day===o)){let t=s.getHours();n.some(e=>e.day===o&&e.time===t)&&await N(e,a,!0)}}t.length&&await v(8e3)}};O.on("ready",async()=>{console.log(`Client is ready (${O.info.pushname}, ${O.info.wid.user})`);let e=r(a).argv[2];e&&await O.sendMessage(O.info.wid._serialized,`*[bot]* ${e}`),setTimeout(()=>{L(),setInterval(L,36e5)},36e5-Date.now()%36e5)}),O.on("disconnected",()=>{console.log("Client has disconnected")}),O.on("message_create",async e=>{let t=await e.getContact();if(A.banned.has(t.id.user))return;let a=d(e.body);await N(a,await e.getChat(),!1,e)}),O.initialize().then(()=>{console.log("Client initialized")}).catch(console.error),r(a).on("exit",()=>{_.save(),A.save()});