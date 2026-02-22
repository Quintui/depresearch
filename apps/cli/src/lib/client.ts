import { MastraClient } from "@mastra/client-js";
import { readConfig } from "./setup.js";

let _client: MastraClient | null = null;

export function getClient(): MastraClient {
  if (_client) return _client;

  const config = readConfig();
  _client = new MastraClient({
    baseUrl: `http://localhost:${config.port}`,
  });

  return _client;
}
