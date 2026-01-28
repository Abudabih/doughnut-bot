const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: "help",
    description: "View all commands or get details of a specific command.",
    usage: "help [command name]",
    author: "Doughnut",
    category: "System",
    role: 0,
    cooldown: 5,

    execute: async (api, event, args) => {
        const { threadID, messageID } = event;
        const prefix = (JSON.parse(fs.readFileSync('./config.json'))).prefix;
        const cmdDir = path.join(__dirname);

        const commandFiles = fs.readdirSync(cmdDir).filter(file => file.endsWith('.js'));
        const commands = [];

        commandFiles.forEach(file => {
            const cmd = require(path.join(cmdDir, file));
            commands.push(cmd);
        });

        if (args[0]) {
            const name = args[0].toLowerCase();
            const cmd = commands.find(c => c.name === name || (c.aliases && c.aliases.includes(name)));

            if (!cmd) {
                return api.sendMessage(`Command "${name}" not found!`, threadID, messageID);
            }

            const roleText = cmd.role === 1.0 ? "Admin Bot" : cmd.role === 2.0 ? "GC Admin" : "Everyone";
            
            const detailMsg = `𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦\n` +
                `_______________________________\n\n` +
                `𝗡𝗮𝗺𝗲: ${cmd.name}\n` +
                `𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${cmd.description || "No description"}\n` +
                `𝗨𝘀𝗮𝗴𝗲: ${prefix}${cmd.usage || cmd.name}\n` +
                `𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${cmd.aliases ? cmd.aliases.join(", ") : "None"}\n` +
                `𝗔𝘂𝘁𝗵𝗼𝗿: ${cmd.author || "Unknown"}\n` +
                `𝗥𝗼𝗹𝗲: ${roleText}\n` +
                `𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${cmd.cooldown || 0}s\n` +
                `_______________________________`;

            return api.sendMessage(detailMsg, threadID, messageID);
        }

        const categories = {};

        commands.forEach(cmd => {
            const cat = cmd.category || "General";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd.name);
        });

        let helpContent = `𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦\n`;
        helpContent += `_______________________________\n\n`;
        for (const category in categories) {
            helpContent += `( ${category.toUpperCase()} )\n\n`;
            helpContent += `${categories[category].join(", ")}\n\n`;
        }

        helpContent += `Use ${prefix}command to execute.\n`;
        helpContent += `Use ${prefix}help <command> for details.\n`;
        helpContent += `Total commands : ${commands.length}`;

        return api.sendMessage(helpContent, threadID, messageID);
    }
};
