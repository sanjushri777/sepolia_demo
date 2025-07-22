/*import express from "express";
import { getContract } from "../services/contractService";
import { logEvent } from "../services/dbService";

const router = express.Router();

router.post("/", async (req, res) => {
  const { requester, donor, tokenAmount, network } = req.body;
  if (!requester || !donor || !tokenAmount || !network) {
    return res.status(400).json({ error: "Missing params" });
  }
  try {
    const contract = getContract(network);
    const amount = BigInt(tokenAmount) * 10n ** 18n;
    const tx = await contract.requestData(donor, amount, { from: requester });
    await tx.wait();
    await logEvent({ type: "request", requester, donor, tokenAmount, txHash: tx.hash, network });
    res.json({ success: true, txHash: tx.hash });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
*/