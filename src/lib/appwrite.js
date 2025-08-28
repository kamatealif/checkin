import {
  PUBLIC_APPWRITE_ENDPOINT,
  PUBLIC_APPWRITE_PROJECT_ID,
} from "$env/static/public";
// import { Client, Account, Databases } from "appwrite";

// const client = new Client()
//   .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
//   .setProject(PUBLIC_APPWRITE_PROJECT_ID);

// const account = new Account(client);
// const databases = new Databases(client);


// export { client, account, databases };

import { Client, Account, Databases } from "appwrite";

export const client = new Client()
  .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
  .setProject(PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const db = new Databases(client);

// env: VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_COL_PROFILES, etc.
