import { handleLogin } from "../helper/TwitchAuth";
import TwitchChat from "./TwitchChat";

const Home = () => {
  return (
    <div>
      <h1>Twitch Chat Analyser</h1>
      <button onClick={handleLogin}>Login with Twitch</button>;
      <TwitchChat />
    </div>
  );
};

export default Home;
