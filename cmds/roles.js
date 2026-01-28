const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: "roles",
    aliases: ["roles-set"],
    usage: "roles-set [command] [role]",
    description: "Switch or set the permission role of a specific command.",
    author: "Doughnut",
    category: "Moderator",
    role: 1.0, // Admin only can change roles
    cooldown: 5,

    execute: async (api, event, args) => {
        const { threadID, messageID } = event;
        const prefix = (JSON.parse(fs.readFileSync('./config.json'))).prefix;

        // Display basic UI if no arguments
        if (args.length < 2) {
            const msg = `𝗥𝗢𝗟𝗘𝗦\n` +
                        `_________________________\n\n` +
                        `1. ${prefix}roles-set [command] [role]\n` +
                        `_________________________\n\n` +
                        `Roles Guide:\n` +
                        `0 = Everyone\n` +
                        `1.0 = Admin Bot\n` +
                        `2.0 = GC Admin`;
            return api.sendMessage(msg, threadID, messageID);
        }

        const targetCmd = args[0].toLowerCase();
        const newRole = parseFloat(args[1]);

        // Validation para sa role input
        if (isNaN(newRole) || ![0, 1.0, 2.0].includes(newRole)) {
            return api.sendMessage("❌ Invalid role! Use 0, 1.0, or 2.0 only.", threadID, messageID);
        }

        const cmdPath = path.join(__dirname, `${targetCmd}.js`);

        if (!fs.existsSync(cmdPath)) {
            return api.sendMessage(`❌ Command "${targetCmd}" not found.`, threadID, messageID);
        }

        try {
            // Basahin ang content ng file
            let content = fs.readFileSync(cmdPath, 'utf8');

            // I-replace ang role value gamit ang Regex
            // Hinahanap nito ang pattern na: role: [any number]
            const updatedContent = content.replace(/role:\s*[\d.]+/, `role: ${newRole}`);

            if (content === updatedContent) {
                 return api.sendMessage(`⚠️ Role of "${targetCmd}" is already set to ${newRole}.`, threadID, messageID);
            }

            // Isulat pabalik sa file
            fs.writeFileSync(cmdPath, updatedContent, 'utf8');

            // I-clear ang cache para ma-load ang bagong role sa susunod na gamit
            delete require.cache[require.resolve(cmdPath)];

            const roleText = newRole === 1.0 ? "Admin Bot" : newRole === 2.0 ? "GC Admin" : "Everyone";
            return api.sendMessage(`✅ Successfully updated "${targetCmd}" role to ${newRole} (${roleText}).`, threadID, messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage("❌ Failed to update command file.", threadID, messageID);
        }
    }
};
