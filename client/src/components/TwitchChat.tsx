import { useState, useEffect } from "react";

type ChatMessage = {
  // Define the message structure here.
  username: string;
  message: string;
};

const TwitchChat = () => {
  const [streamer, setStreamer] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Function to parse the access token from URL query parameters
  const parseAccessToken = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("accessToken");
    setAccessToken(token);
  };

  // Connect to Twitch's IRC
  const handleConnect = () => {
    console.log("Connecting to Twitch IRC...");

    if (!accessToken) {
      console.log("Access token is required to connect to Twitch IRC");
      return;
    }

    const websocket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    websocket.onopen = () => {
      websocket.send(`PASS oauth:${accessToken}`);
      websocket.send(`NICK ${import.meta.env.VITE_REACT_APP_TWITCH_USERNAME}`);
      websocket.send(`JOIN #${streamer}`);
    };

    websocket.onmessage = (event) => {
      // Simple parsing logic to extract username and message
      const parsedData = event.data.match(
        /:(\w+)!\w+@\w+.tmi.twitch.tv PRIVMSG #\w+ :(.+)/
      );
      if (parsedData) {
        const [, username, message] = parsedData;
        const newMessage = { username, message };
        setChat((prevChat) => [...prevChat, newMessage]);
      }
    };

    websocket.onerror = (error) => {
      console.log("WebSocket Error: ", error);
    };

    setWs(websocket);
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
      <input
        type="text"
        value={streamer}
        onChange={(e) => setStreamer(e.target.value)}
      />
      <button onClick={handleConnect}>Connect</button>
      <div>
        {chat.map((message, index) => (
          <p key={index}>{message.message}</p>
        ))}
      </div>
    </>
  );
};

export default TwitchChat;
