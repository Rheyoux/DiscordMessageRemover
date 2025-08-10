Discord DM Message Deleter
Disclaimer:
This script is for educational purposes only. Use it responsibly.
The author is not responsible for any bans or issues resulting from its use.
Discord’s Terms of Service should be respected at all times.

Description
This JavaScript script automates the deletion of messages in a Discord Direct Message (DM) channel for the logged-in user. It deletes messages one by one with randomized delays to avoid rate limits and mimics human behavior.

It uses your Discord token to authenticate requests and deletes up to a configurable number of messages in the currently opened DM channel.

Features
Deletes your own messages from a targeted DM channel in Discord.

Supports deletion of up to 1000 messages (configurable).

Respects Discord API rate limits by handling HTTP 429 errors automatically.

Random delays between deletions (configurable) to reduce detection risk.

Logs progress to the console with message IDs and partial content.

Automatically detects the channel ID from the current URL.

Fetches user ID from the token to only delete your messages.

Requirements
Use in a web browser logged into Discord Web (https://discord.com/app).

Your Discord user token (found via browser dev tools or other methods).

Access to the targeted DM channel in your Discord client.

Setup & Usage
Open Discord Web and navigate to the DM channel where you want to delete messages.

Open your browser's developer console (F12 or Ctrl+Shift+I).

Copy the entire script from this repository.

Paste the script into the console.

Replace the token variable value with your actual Discord user token:

js
Copier
Modifier
const token = "YOUR_DISCORD_TOKEN_HERE";
Adjust optional parameters if needed:

js
Copier
Modifier
const deleteLimit = 1000;   // Max number of messages to delete
const minDelay = 1200;      // Min delay between deletes (ms)
const maxDelay = 3500;      // Max delay between deletes (ms)
Press Enter to run the script.

The script will start deleting messages in the current DM channel, showing progress in the console.

Important Notes
This script only deletes your own messages (messages authored by your user ID).

The script uses Discord's private API endpoints and requires your user token.

Using your token in scripts can be risky; keep it confidential.

Frequent or bulk deletion might trigger Discord anti-abuse mechanisms.

Always respect Discord's Terms of Service.

Use this tool responsibly and at your own risk.

Troubleshooting
If the script logs Error: Could not find channel ID in URL, make sure you are in a DM channel (URL contains /channels/@me/CHANNEL_ID).

If the token is invalid, you may see warnings about failing to fetch your user info.

The script automatically retries if it hits rate limits.

If no messages are deleted, check that your token is correct and you have permissions to delete messages.

License
This script is provided as-is for educational use.
