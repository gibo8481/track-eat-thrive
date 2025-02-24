
import { createClient } from "@supabase/supabase-js";

// Using the project credentials directly since this is a demo app
// In a production environment, these would be in environment variables
const supabaseUrl = "https://ewqxfmkqzloirhjnrjio.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cXhmbWtxemxvaXJoam5yamlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNzIyNjMsImV4cCI6MjA1NTk0ODI2M30.Esbh5I72KaSapHoDak8Kvcs0jLK-BTaZXIwIafeeEKU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
