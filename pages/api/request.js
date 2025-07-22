"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contractService_1 = require("../../src/server/services/contractService");
const dbService_1 = require("../../src/server/services/dbService");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    const { requester, donor, tokenAmount, network } = req.body;
    if (!requester || !donor || !tokenAmount || !network) {
        return res.status(400).json({ error: "Missing params" });
    }
    try {
        const contract = (0, contractService_1.getContract)(network);
        const amount = BigInt(tokenAmount) * 10n ** 18n;
        const tx = await contract.requestData(donor, amount, { from: requester });
        await tx.wait();
        await (0, dbService_1.logEvent)({ type: "request", requester, donor, tokenAmount, txHash: tx.hash, network });
        res.json({ success: true, txHash: tx.hash });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.default = router;
