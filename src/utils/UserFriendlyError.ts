export function getUserFriendlyError(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    // MetaMask user rejected
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ("code" in error && (error as any).code === 4001) {
      return "You rejected the transaction in your wallet.";
    }
    // Custom errors
    if ("reason" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reason = (error as any).reason;
      if (typeof reason === "string" && reason.includes("user denied")) return "You rejected the transaction in your wallet.";
      if (typeof reason === "string") return reason;
      return "An unexpected smart contract error occurred.";
    }
    // ethers.js error
    if ("message" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any).message;
      if (typeof msg === "string") {
        if (msg.includes("insufficient funds")) return "You don't have enough ETH for gas fees.";
        if (msg.includes("denied")) return "You rejected the transaction in your wallet.";
        if (msg.includes("network does not match")) return "You're on the wrong network. Please switch your wallet network.";
        return msg;
      }
      return "An unexpected network error occurred.";
    }
  }
  return "An unexpected error occurred. Please try again.";
}