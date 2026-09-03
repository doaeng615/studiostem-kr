// Public config — safe to expose client-side. Row Level Security in Supabase
// controls what the anon key can actually read/write.
const SUPABASE_URL = "https://iwbwssvvorwgtziygepb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Yndzc3Z2b3J3Z3R6aXlnZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDY1MDQsImV4cCI6MjEwMzk4MjUwNH0.VdZqtGaHvNWEQhFoaYa8WpJZDJ2bm53HtHZ1vI6f7Kc";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
