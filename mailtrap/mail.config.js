import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Spiro",
};

export { mailtrapClient, sender };
