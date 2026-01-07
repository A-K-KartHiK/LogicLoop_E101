import { DiscussServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(process.env.GEMINI_API_KEY),
});

async function main() {
  const result = await client.listModels({});
  console.log(result);
}

main();
