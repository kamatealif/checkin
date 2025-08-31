
import {
    PUBLIC_APPWRITE_ENDPOINT,
    PUBLIC_APPWRITE_PROJECT_ID,
  } from "$env/static/public";

  
  import { Client, Account, Databases} from "appwrite";
import { TablesDB } from "node-appwrite";
  
  export const client = new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT_ID);
  
  export const account = new Account(client);
  export const db = new Databases(client);
  export const tablesDB = new TablesDB(client);
  
  // env: VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_COL_PROFILES, etc.
  export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  export const TEACHERS = import.meta.env.VITE_APPWRITE_TABLE_TEACHERS;
  export const STUDENTS = import.meta.env.VITE_APPWRITE_TABLE_STUDENTS;