// Importing necessary modules and configurations

const chalk = require("chalk"); // Used for styling and coloring console output

const {
    solveHint,
    getImage
} = require("pokehint"); // Functions for solving hints and getting images

const config = require("../config.json"); // Loading configuration from JSON file

const axios = require("axios"); // Used for fetching the archery image

const sharp = require("sharp"); // Used for processing the archery image

// Utility functions and classes

const {
    wait,
    randomInteger
} = require("../utils/utils.js"); // Utility functions for waiting and generating random integers

const {
    ShinyHunter
} = require("../classes/clients/shinyHunter.js"); // ShinyHunter class

const {
    sendLog,
    sendCatch
} = require("../functions/logging.js"); // Logging functions

const {

    setSpamming,

    getSpamming,

    getWaiting,

    setWaiting,

} = require("../utils/states.js"); // State management functions

// The main function that handles new messages

module.exports = async (client, guildId, message) => {

    // Checking if the message is from Pokétwo and if the bot is not already waiting

    if (message.author.id == "716390085896962058" && getWaiting == false) {

        // Checking if the account is suspended

        if (message?.embeds[0]?.title?.includes("Account Suspended")) {

            const messages = await message.channel.messages

            .fetch({
                limit: 2, around: message.id
            })

            .catch(() => null);

            const newMessage = Array.from(messages.values());

            [...messages.values()];

            if (newMessage[1].author.id == client.user.id) {

                sendLog(client.user.username, "Detected suspension.", "suspension");

                setWaiting(true);

                config.ownership.OwnerIDs.forEach((id) => {

                    if (id.length <= 16) return;

                    client.users.fetch(id).then(async (user) => {

                        dmChannel = await client.channels.fetch(user.dmChannel.id);

                        lastMessage = await dmChannel.messages.fetch(

                            dmChannel.lastMessageId

                        );

                        if (lastMessage?.content.includes("suspended")) {

                            return;

                        } else {

                            sendWebhook(null, {

                                title: `Account ${client.user.username} Suspended!`,

                                color: "#FF0000",

                                footer: {

                                    text: "CatchTwo by @kyan0045",

                                    icon_url:

                                    "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",

                                },

                            });

                            return user.send(

                                `## ACCOUNT SUSPENDED\n> Your account has been suspended. The autocatcher has been paused. Please check your account for more information.`

                            );

                        }

                    });

                });

            }

        }

        if (message.embeds.length > 0) {

            const embed = message.embeds[0];

            const messages = await message.channel.messages

            .fetch({
                limit: 2, around: message.id
            })

            .catch(() => null);

            const newMessage = Array.from(messages.values());

            [...messages.values()];

            if (newMessage[1].author.id == client.user.id) {

                if (embed.title && embed.title.includes('Archery') && embed.image) {

                    const url = embed.image.url;

                    try {

                        const response = await axios.get(url, {
                            responseType: 'arraybuffer'
                        });

                        const imageBuffer = Buffer.from(response.data, 'binary');

                        const dartPositions = await processImage(imageBuffer);

                        const positionsStr = dartPositions.join(' ').toLowerCase();

                        const evSleep = [5.8,
                            5.4,
                            6.9,
                            4.2,
                            5.9][Math.floor(Math.random() * 5)];

                        await new Promise(resolve => setTimeout(resolve, evSleep * 1000));

                        await message.channel.send(`<@716390085896962058> ev m shoot ${positionsStr}`);

                        await new Promise(resolve => setTimeout(resolve, 3000));

                        await message.channel.send(`<@716390085896962058> ev play archery`);

                    } catch (error) {

                        console.error('Error processing image:', error);

                    }

                }



                if (message.content.includes('briefly shown 5')) {

                    if (message.components && message.components.length > 0) {

                        const component = message.components[0];

                        const button = component.components[0];

                        const buttonSleep = [3.3,
                            4.2,
                            2.7,
                            3.9,
                            2.9][Math.floor(Math.random() * 3)];

                        await new Promise(resolve => setTimeout(resolve, buttonSleep * 1000));

                        await message.clickButton(button.customId);

                    }
                }
            }
        }

        if (

            // Handling captcha detection

            message.content.includes(

                `https://verify.poketwo.net/captcha/${client.user.id}`

            )

        ) {

            setWaiting(true); // Setting the bot to a waiting state

            sendLog(client.user.username, "Detected captcha.", "captcha"); // Logging captcha detection

            // Notifying all owners about the captcha

            config.ownership.OwnerIDs.forEach((id) => {

                if (id.length <= 16) return; // Skipping invalid IDs

                client.users.fetch(id).then(async (user) => {

                    // Fetching the DM channel and the last message to the owner

                    dmChannel = await client.channels.fetch(user.dmChannel.id);

                    lastMessage = await dmChannel.messages.fetch(dmChannel.lastMessageId);

                    // Checking if the last message already informed about a captcha within the last 24 hours

                    if (

                        lastMessage?.content.includes("captcha") &&

                        lastMessage?.author.id == client.user.id &&

                        lastMessage?.createdTimestamp > Date.now() - 86400000

                    ) {

                        return; // Skipping if a recent captcha message was already sent

                    } else {

                        // Sending a webhook and a direct message to the owner about the captcha

                        sendWebhook(null, {

                            title: `Captcha Found!`,

                            color: "#FF5600",

                            url: `https://verify.poketwo.net/captcha/${client.user.id}`,

                            footer: {

                                text: "CatchTwo by @kyan0045",

                                icon_url:

                                "https://camo.githubusercontent.com/50135c6f8c4ae4b9faa62bf3aca70ce4ee18908c0b239539b18fc26f35d5f50b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",

                            },

                        });

                        return user.send(

                            `## DETECTED A CAPTCHA\n> I've detected a captcha. The autocatcher has been paused. To continue, please solve the captcha below.\n* https://verify.poketwo.net/captcha/${client.user.id}\n\n### SOLVED?\n> Once solved, run the command \`\`${config.ownership.CommandPrefix}solved\`\` to continue catching.`

                        );

                    }

                });

            });

        }

    }

};


function processImage(imageBuffer) {
    return sharp(imageBuffer)
    .raw()
    .toBuffer({
        resolveWithObject: true
    })
    .then(({
        data,
        info
    }) => {
        const {
            width, height, channels
        } = info;
        const gridSize = 6;
        const headerSize = 1;
        const tileRows = gridSize - headerSize;
        const tileCols = gridSize - headerSize;

        const tileHeight = Math.floor(height / gridSize);
        const tileWidth = Math.floor(width / gridSize);

        const dartPositions = [];
        for (let row = headerSize; row < gridSize; row++) {
            for (let col = headerSize; col < gridSize; col++) {
                let sum = 0;
                let count = 0;
                for (let y = row * tileHeight; y < (row + 1) * tileHeight; y++) {
                    for (let x = col * tileWidth; x < (col + 1) * tileWidth; x++) {
                        for (let c = 0; c < channels; c++) {
                            sum += data[y * width * channels + x * channels + c];
                            count++;
                        }
                    }
                }
                const meanValue = sum / count;
                if (meanValue > 128) {
                    dartPositions.push(indexToLabel(row - headerSize, col - headerSize));
                }
            }
        }
        return dartPositions;
    });
}

function indexToLabel(row, col) {
    const columns = 'ABCDE';
    const rows = '12345';
    return columns[col] + rows[row];
}