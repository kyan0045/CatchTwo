// This module exports a "click" command for CatchTwo. It allows the selfbot to click a button on a message.
module.exports = {
  name: "click", // Command name
  aliases: ["buttonclick", "clickbutton"], // Command aliases for easier access
  // Asynchronous function to handle the command execution
  async execute(client, message, args) {
    let msg; // Variable to store the message object
    let buttonId = 0; // Default button ID
    let rowId = 0; // Default row ID for button groups

    try {
      // If the first argument is a message ID (length > 10), fetch the message
      if (args[0]?.length > 10) {
        msg = await message.channel.fetchMessage(args[0]);
        buttonId = parseInt(args[1]) - 1; // Parse the button ID from the second argument
        // If a third argument is provided, parse it as the row ID
        if (args[2]) {
          rowId = parseInt(args[2]) - 1;
        }
      } else if (message.data?.message_reference) {
        // If the command is a reply, fetch the referenced message
        msg = await message.fetchReference();
        buttonId = parseInt(args[0]) - 1; // Parse the button ID from the first argument
        // If a second argument is provided, parse it as the row ID
        if (args[1]) {
          rowId = parseInt(args[1]) - 1;
        }
      } else {
        // If neither condition is met, throw an error
        throw new Error();
      }
    } catch (err) {
      // Log the error and inform the user to specify a message ID or reply to a message
      console.error(err);
      return message.reply(
        `Please reply to the message that the button is attached to, or specify the message ID.`
      );
    }

    try {
      // Check if the message has components (buttons)
      if (!msg.components || msg.components.length === 0) {
        return message.reply("This message doesn't have any buttons to click.");
      }

      // Find the button by position (row and button index)
      let targetButton = null;

      // If rowId is specified and valid, look in that specific row
      if (rowId >= 0 && rowId < msg.components.length) {
        const row = msg.components[rowId];
        if (buttonId >= 0 && buttonId < row.components.length) {
          targetButton = row.components[buttonId];
        }
      } else {
        // If no specific row, find the button by counting through all rows
        let currentIndex = 0;
        for (const row of msg.components) {
          for (const component of row.components) {
            if (currentIndex === buttonId) {
              targetButton = component;
              break;
            }
            currentIndex++;
          }
          if (targetButton) break;
        }
      }

      if (!targetButton || !targetButton.customId) {
        return message.reply("Button not found at the specified position.");
      }

      // Attempt to click the button using its custom_id
      await msg.clickButton(targetButton.customId);
      // React with a checkmark emoji to indicate success
      message.react("✅");
    } catch (err) {
      // Log any errors and react with an X emoji to indicate failure
      console.error(err);
      message.react("❌");
      message.reply(`Failed to click button: ${err.message}`);
    }
  },
};
