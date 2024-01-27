const TWITCH_CLIENT_ID = import.meta.env.VITE_REACT_APP_TWITCH_CLIENT_ID;
const REDIRECT_URI = encodeURIComponent(
  import.meta.env.VITE_REACT_APP_TWITCH_REDIRECT_URI
);
const SCOPES = encodeURIComponent("user_read");

export const handleLogin = () => {
  window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;
};
