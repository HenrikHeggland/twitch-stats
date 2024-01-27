import { useState, useEffect } from "react";

type ChatMessage = {
  username: string;
  message: string;
};

type UserMessageCount = {
  username: string;
  messageCount: number;
};
const TwitchChat = () => {
  const [streamer, setStreamer] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [userMessageCounts, setUserMessageCounts] = useState<
    UserMessageCount[]
  >([]);

  // Function to parse the access token from URL query parameters
  const parseAccessToken = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("accessToken");
    setAccessToken(token);
  };

  // Connect to Twitch's IRC
  const handleConnect = () => {
    console.log("Connecting to Twitch IRC...");

    // Check if access token is available
    if (!accessToken) {
      console.log("Access token is required to connect to Twitch IRC");
      return;
    }

    // Create a new WebSocket
    const websocket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    // Set up event listeners
    websocket.onopen = () => {
      console.log("WebSocket connection opened.");
      websocket.send(`CAP REQ twitch.tv/tags`);
      websocket.send(`PASS oauth:${accessToken}`);
      websocket.send(`NICK ${import.meta.env.VITE_REACT_APP_TWITCH_USERNAME}`);
      websocket.send(`JOIN #${streamer}`);
      console.log(`Joined channel: ${streamer}`);
    };

    // Handle incoming messages
    websocket.onmessage = (event) => {
      // For debugging
      // console.log("Message received:", event.data);

      if (event.data.includes("PRIVMSG")) {
        // This is a chat message
        const parsedData = event.data.match(
          /:(\w+)!\w+@\w+.tmi.twitch.tv PRIVMSG #\w+ :(.+)/
        );
        if (parsedData) {
          const [, username, message] = parsedData;
          const newMessage = { username, message };
          setChat((prevChat) => [...prevChat, newMessage]);

          setUserMessageCounts((prevCounts) => {
            const updatedCounts = prevCounts.map((u) => ({ ...u }));
            const userIndex = updatedCounts.findIndex(
              (u) => u.username === username
            );

            if (userIndex !== -1) {
              updatedCounts[userIndex].messageCount++;
            } else {
              updatedCounts.push({ username, messageCount: 1 });
            }

            return updatedCounts
              .sort((a, b) => b.messageCount - a.messageCount)
              .slice(0, 10);
          });
        }
      }
    };

    // Handle errors
    websocket.onerror = (error) => {
      console.log("WebSocket Error: ", error);
    };

    setWs(websocket);
  };

  // Disconnect from Twitch's IRC
  const handleDisconnect = () => {
    if (ws) {
      console.log("Disconnecting from Twitch IRC...");
      ws.close();
      setWs(null);
      console.log("Disconnected");
    }
  };

  // Clear leaderboard
  const handleClearLeaderboard = () => {
    setUserMessageCounts([]);
  };

  useEffect(() => {
    parseAccessToken();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <>
      <h3>Input a channel name to connect to the chat</h3>
      <input
        type="text"
        value={streamer}
        onChange={(e) => setStreamer(e.target.value)}
      />
      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      <button onClick={handleClearLeaderboard}>Clear Leaderboard</button>
      <div className="leaderboard">
        {userMessageCounts.map((user, index) => (
          <div key={index} className="leaderboard-entry">
            <span className="username">{user.username}</span>:
            <span className="message-count">{user.messageCount}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default TwitchChat;
