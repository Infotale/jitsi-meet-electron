import { Issuer, Client, custom } from "openid-client";
import fs from "fs";
import https from "https";
import logger from "../utils/logger";

let client: Client;

export const configureClient = async (): Promise<Client> => {
  if (!client) {
    // Use CA only on prod
    // IS_PROD is for differentiating between azure and prod env
    if (process.env.IS_PROD === "true") {
      let caCert: string | undefined;

      // Optional: Setup CA certificate (commented out)
      try {
        // Read the CA certificate from a file or environment variable
        caCert = process.env.CA_CERT || fs.readFileSync(process.env.CA_CERT_PATH || "", "utf-8");
        // logger.debug(`configureClient - ${caCert}`);
      } catch (error) {
        logger.error("Failed to load CA certificate:", error);
        throw new Error("Failed to load CA certificate");
      }

      // Create an HTTPS agent with the CA certificate if available
      const httpsAgent = new https.Agent({
        ca: caCert,
      });

      // Customize the HTTP request options to use the HTTPS agent
      custom.setHttpOptionsDefaults({
        agent: httpsAgent,
        // timeout: 10000 //check if maybe it fixes timeout in dev
      });
    }

    try {
      // Discover the Issuer
      const receivedIssuer = await Issuer.discover(process.env.SSO_ISSUER_URL!);

      // Create a new Client instance
      client = new receivedIssuer.Client({
        client_id: process.env.SSO_CLIENT_ID!,
        client_secret: process.env.SSO_CLIENT_SECRET!, // Required for HS256
        redirect_uris: [process.env.SSO_COMEBACK_URL!],
        response_types: ["code"],
        // id_token_signed_response_alg: 'HS256',
      });

      logger.info("OpenID Client successfully configured.");
      return client;
    } catch (error) {
      logger.error("Error configuring OpenID Client:", error);
      throw error; // Handle or rethrow error as necessary
    }
  }

  return client;
};
