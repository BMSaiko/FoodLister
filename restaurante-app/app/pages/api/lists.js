import { supabase } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Login successful" });
  }
}
