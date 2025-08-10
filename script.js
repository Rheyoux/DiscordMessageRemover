// Disclaimer: For educational purposes only. 
// I am not responsible for any bans or issues arising from the use of this script. 
// ChatGPT helped me translate and optimize it :)

// === CONFIGURATION BEFORE RUNNING ===
const token = "TOKEN_HERE"; // Put your Discord token here
const deleteLimit = 1000;    // Maximum number of messages to delete
const minDelay = 1200;       // Minimum delay between deletions in milliseconds
const maxDelay = 3500;       // Maximum delay between deletions in milliseconds

// Utility function to wait for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility function to generate a random delay between minDelay and maxDelay
function getRandomDelay() {
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

// Wrapper around fetch to handle rate limits and JSON stringification automatically
async function apiFetch(path, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    "Authorization": token,
    "User-Agent": navigator.userAgent,
  };

  // If a body is provided and it's an object, stringify it and set JSON header
  if (options.body && typeof options.body === "object") {
    options.body = JSON.stringify(options.body);
    options.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, options);

  if (response.status === 429) { // Rate limited
    let retryAfter = 1000; // default 1 second
    try {
      const json = await response.json();
      retryAfter = (json.retry_after || response.headers.get('retry-after') || 1) * 1000;
    } catch {
      // ignore JSON parsing errors
    }
    console.warn(`Rate limited by Discord API. Waiting ${retryAfter} ms before retrying...`);
    await sleep(retryAfter + 500);
    return apiFetch(path, options);
  }

  return response;
}

(async () => {
  if (!token || token === "TOKEN_HERE") {
    console.error("Error: Please set your Discord token in the `token` variable before running.");
    return;
  }

  // Extract channel ID from URL: expects URL like .../channels/@me/CHANNEL_ID
  const urlMatch = window.location.href.match(/channels\/@me\/(\d+)/);
  if (!urlMatch) {
    console.error("Error: Could not find channel ID in URL. Please make sure you are in the target DM channel.");
    return;
  }
  const channelId = urlMatch[1];
  console.log("Target Channel ID:", channelId);

  // Optionally get current user ID from token (useful to only delete your own messages)
  let userId = null;
  try {
    const meResponse = await apiFetch("/api/v9/users/@me");
    if (meResponse.ok) {
      const meData = await meResponse.json();
      userId = meData.id;
      console.log("Detected User ID:", userId);
    } else {
      console.warn("Warning: Could not fetch /users/@me. Token might be invalid.");
    }
  } catch (error) {
    console.warn("Warning: Error while fetching /users/@me:", error);
  }

  let deletedCount = 0;
  let beforeMessageId = null;

  while (deletedCount < deleteLimit) {
    // Fetch up to 100 messages before the 'beforeMessageId' cursor if set
    const fetchUrl = `/api/v9/channels/${channelId}/messages?limit=100` + (beforeMessageId ? `&before=${beforeMessageId}` : "");
    const fetchResponse = await apiFetch(fetchUrl, { method: "GET" });

    if (!fetchResponse.ok) {
      console.error("Error fetching messages:", fetchResponse.status, fetchResponse.statusText);
      break;
    }

    const messages = await fetchResponse.json();

    if (!messages || messages.length === 0) {
      console.log("No more messages to delete in this channel.");
      break;
    }

    // Shuffle messages to avoid a robotic pattern
    messages.sort(() => Math.random() - 0.5);

    for (const message of messages) {
      beforeMessageId = message.id;

      // Only delete messages authored by the user
      if (message.author && (userId ? message.author.id === userId : true)) {
        try {
          const deleteResponse = await apiFetch(`/api/v9/channels/${channelId}/messages/${message.id}`, { method: "DELETE" });
          if (deleteResponse.status === 204 || deleteResponse.ok) {
            deletedCount++;
            console.log(`🗑️ Deleted (${deletedCount}): ${message.id} ${message.content ? `- ${message.content.slice(0, 80)}` : ""}`);
          } else {
            const errorText = await deleteResponse.text().catch(() => "");
            console.warn(`Failed to delete message: ${deleteResponse.status} ${errorText}`);
          }
        } catch (error) {
          console.error("Error deleting message:", error);
        }

        // Respect rate limits with a random delay between deletes
        await sleep(getRandomDelay());

        if (deletedCount >= deleteLimit) break;
      }
    }

    // Random delay before fetching next batch
    await sleep(getRandomDelay());
  }

  console.log(`Finished. Total messages deleted: ${deletedCount}`);
})();
