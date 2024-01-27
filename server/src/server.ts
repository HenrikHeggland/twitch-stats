import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT;

app.get("/auth/twitch/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  try {
    const response = await axios.post(`https://id.twitch.tv/oauth2/token`, {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URL,
    });
    const accessToken = response.data.access_token;

    // NOTE: Passing the access token in the URL is not a secure method
    // and should only be used for testing
    console.log(`Successfully exchanged code for access token`);
    res.redirect(`${process.env.CLIENT_URL}?accessToken=${accessToken}`);
  } catch (error) {
    console.log(`Error during token exchange: ${error}`);
    res.status(500).send(`Error during token exchange: ${error}`);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
