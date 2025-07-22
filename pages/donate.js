import { handleDonation } from "@/src/server/bitnetbackend"; // This imports your server logic

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userAddress, amount, telecomMeta } = req.body;

  try {
    const result = await handleDonation(userAddress, amount, telecomMeta);

    if (result.success) {
      return res.status(200).json({ message: "Donation successful", txHash: result.txHash });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
