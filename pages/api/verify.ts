
import type { NextApiRequest, NextApiResponse } from "next";

// Dummy telecom verification function
async function verifyWithTelecom(userAddress: string, mb: number): Promise<boolean> {
  // Replace this logic with actual teleocm in future
  return mb <= 1000; // now for Example: only allow donations up to 1000 MB
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userAddress, mb } = req.body;
  if (!userAddress || !mb) {
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  const isAllowed = await verifyWithTelecom(userAddress, mb);
  if (isAllowed) {
    res.status(200).json({ ok: true });
  } else {
    res.status(403).json({ error: "Not enough MB left according to telecom!" });
  }
}