const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;
const MAX_HISTORY = 500;
app.use(express.json());

let chatHistory = [];
let nextMessageId = 1;

function trimOldMessagesIfNeeded() {
    if (chatHistory.length > MAX_HISTORY) {
        chatHistory.shift();
    }
}

app.post("/send", (req, res) => {
    let { username, message } = req.body;
    username = username?.trim();
    message = message?.trim();

    if (!username || !message) {
        return res.status(400).json({
            success: false,
            error: "Both a username and a message are required. Please fill in both fields."
        });
    }

    const newMessage = {
        id: nextMessageId++,
        username,
        message,
        timestamp: Date.now()
    };

    chatHistory.push(newMessage);
    trimOldMessagesIfNeeded();

    console.log(`💬 [${newMessage.id}] ${username} said: "${message}"`);

    res.json({
        success: true,
        id: newMessage.id
    });
});

app.get("/poll", (req, res) => {
    const afterId = Number(req.query.after) || 0;

    const newMessages = chatHistory.filter((msg) => msg.id > afterId);

    console.log(`📡 Client polled for messages after ID ${afterId}. Found ${newMessages.length} new.`);

    res.json({
        success: true,
        messages: newMessages
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chat server is up and running`);
    console.log(`Listening on port ${PORT}`);
    console.log(`Send messages to: POST http://localhost:${PORT}/send`);
    console.log(`Poll for messages at: GET http://localhost:${PORT}/poll?after=0`);
});
