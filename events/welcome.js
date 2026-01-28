const fs = require('fs-extra');

module.exports = async (api, event, config, style) => {
    // Check kung may sumali sa GC
    if (event.logMessageType === "log:subscribe") {
        const { threadID } = event;
        const botID = api.getCurrentUserID();
        const addedParticipants = event.logMessageData.addedParticipants;

        for (let participant of addedParticipants) {
            // Huwag mag-welcome kung ang bot mismo ang sumali (handled na ito sa index.js)
            if (participant.userFbId !== botID) {
                const name = participant.fullName;
                const msg = `Welcome ${name}! 🎉\n\n` +
                            `${style.top}\n` +
                            `Enjoy your stay here in our group chat. Feel free to use ${config.prefix}help to see what I can do!\n` +
                            `${style.bottom}`;
                
                api.sendMessage(msg, threadID);
            }
        }
    }
};
