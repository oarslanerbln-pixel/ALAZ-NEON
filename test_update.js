import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function check() {
  const { data: roomData } = await supabase.from("rooms").select("*").limit(1);
  if (!roomData || roomData.length === 0) {
    console.log("No room found.");
    return;
  }
  const roomId = roomData[0].id;
  
  const { error } = await supabase
    .from("rooms")
    .update({ status: "playing", time_left: 60 })
    .eq("id", roomId);
    
  console.log("Update Error:", error);
}

check();
