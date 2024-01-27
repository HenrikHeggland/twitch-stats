import { useState, useEffect } from "react";

type ChatMessage = {
  // Define the message structure here.
  username: string;
  message: string;
};

type UserMessageCount = {
  username: string;
  messageCount: number;
};

const TwitchChat = () => {
  // State variables declarations
  const [streamer, setStreamer] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [userMessageCounts, setUserMessageCounts] = useState<
    UserMessageCount[]
  >([]);

  // Function to clear chat messages
  const handleClearMessages = () => {
    setChat([]);
    setUserMessageCounts([]);
  };
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
      console.log("Message received:", event.data);

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
            const existingUser = prevCounts.find(
              (u) => u.username === username
            );
            if (existingUser) {
              return prevCounts.map((u) =>
                u.username === username
                  ? { ...u, messageCount: u.messageCount + 1 }
                  : u
              );
            } else {
              return [...prevCounts, { username, messageCount: 1 }];
            }
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
      <br />
      <h3>Input a channel name to connect to the chat</h3>
      <input
        type="text"
        value={streamer}
        onChange={(e) => setStreamer(e.target.value)}
      />
      <button onClick={handleConnect}>✅</button>
      <button onClick={handleDisconnect}>❎</button>
      <button onClick={handleClearMessages}>🔁</button>
      <br />
      <div>
        {userMessageCounts
          .sort((a, b) => b.messageCount - a.messageCount)
          .map((user, index) => (
            <p key={index}>
              {user.username}: {user.messageCount}
            </p>
          ))}
      </div>
    </>
  );
};

export default TwitchChat;
