# BITNET

BITNET is a decentralized bandwidth donation and request platform built on BlockDAG.  
Users donate excess bandwidth to the network, earn BITNET tokens, and unlock the ability to request bandwidth from others.  
Incentives, matching, and eligibility are enforced via smart contracts deployed on the Primordial BlockDAG Testnet.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack & Tools](#tech-stack--tools)
- [Development Approach](#development-approach)
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [BlockDAG Resources & Integration](#blockdag-resources--integration)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Smart Contracts](#smart-contracts)
- [License](#license)
- [Demo](#demo)

---

## Project Overview

BITNET solves the problem of unused bandwidth going to waste while others need connectivity.  
Connect your wallet, donate bandwidth to the network (telecom-verified), earn BITNET tokens, and unlock the ability to request bandwidth from others.  
Token minting, lock/reward logic, and request matching are fully decentralized via BlockDAG smart contracts.
In future these token can be exchanged for money by placing bitnet in DECENTRALIZED EXCHANGE platfrom to swap for ETH 
and ETH to money 

**Key Features:**
- Decentralized donation and request of bandwidth
- FIFO matching for requests
- Token incentives and reward logic
- Telecom verification (mock API)
- Transparent contract, live explorer links
- Make money with Your unused data

**Future Idea:**
   -Integrating with telecom for network bandwidth
   -same modal can be created for unused local storage doantion , cloud storage, GPU,email storage without relying on  any middleman
   
   
   

---

## Tech Stack & Tools

- **Frontend:** Next.js 14+, React 18, TypeScript, Tailwind CSS
- **Web3 & Blockchain:** BlockDAG Primordial Testnet, viem, wagmi, WalletConnect, ethers.js (optional, included in starter kit)
- **Smart Contracts:** Solidity ([contracts/BITNET.sol](contracts/BITNET.sol))
- **Backend/API:** Next.js API Route (`frontend/pages/api/verify.ts`) for mock telecom verification
- **Starter Kit:** [BlockDAG Starter Kit](https://github.com/BlockdagNetworkLabs/blockdag_starter_kit)  
  > Scaffolded using the official BlockDAG Starter Kit (`npx create-blockdag-dapp@latest`)
- **BlockDAG Resources:**
  - [Docs](https://docs.blockdagnetwork.io/)
  - [IDE](https://ide.primordial.bdagscan.com/)
  - [Explorer](https://primordial.bdagscan.com/)
  - [Faucet](https://primordial.bdagscan.com/faucet)

---

## Development Approach
  
  The BITNET dApp was scaffolded using the official BlockDAG Starter Kit, which provided a ready-to-go boilerplate for frontend, smart contracts, and Web3 integration

  We ran:

  ```bash

  npx create-blockdag-dapp@latest

```
This generated:

 - Next.js + React + TypeScript + Tailwind frontend
 - Hardhat & Foundry smart contract environments
 - WalletConnect integration out of the box
 - Git-initialized repository with modular folder structure

We then:

Customized the frontend UI/UX, state, and logic to support donation & request flows

Extended the smart contract (BITNET.sol) with ERC20 token minting, locking, reward, and burn logic

Created a mock telecom verification API (verify.ts)

Integrated the deployed smart contract with the frontend via viem & wagmi

---

## Requirements

- Node.js v18 or newer
- npm (comes with Node.js)
- A WalletConnect-compatible wallet (for donation/request flows)
- BlockDAG Testnet account and contract address (see [Smart Contracts](#smart-contracts))

---

## Project Structure

BITNET follows a modular structure for clarity and maintainability.  
Here’s an overview of the most important folders and files:

```
BITNET/
├── contracts/
│   └── BITNET.sol                # Main smart contract (Solidity)
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js application routing
│   │   ├── components/           # Reusable React components (ConnectButton, TopBar, Sidebar, etc.)
│   │   ├── dashboard/            # Dashboard logic and UI (donate/request flows)
│   │   ├── api/
│   │   │   ├── verify.ts         # Mock telecom verification API (called during donate)
│   │   │   ├── donate.js         # (Unused, kept for reference)
│   │   │   └── request.js        # (unused kept for reference)
│   │   ├── utils/                # Helper functions (contract interaction, error handling, persistent state)
│   │   ├── constants/            # ABI and contract address for BlockDAG contract
│   │   ├── configs/              # Config file(s) if needed for custom settings
│   │   ├── public/               # Static assets
│   │   ├── fonts/                # Custom fonts
│   │   └── context/              # React context providers (if needed)
│   ├── .env                      # Actual environment variables (not committed)
│   ├── .env.local                # Local environment variables (not committed)
│   └── .env.example              # Template for required variables (included in repo)
├── package.json                  # Dependency and scripts manager
├── README.md                     # This documentation
```

**Highlights:**
- **Smart contract:** All core donation/request logic lives in `contracts/BITNET.sol`.
- **Frontend:** User interacts with the dApp via Next.js/React; all state and UI logic (donation, request, dashboard) is here. 
- **API:** Only `verify.ts` is used for backend telecom verification on donations.(mock verify)
- **Utilities/Constants:** Web3 helpers, contract ABI/address, error handlers, persistent state are modularized in `utils` and `constants`.
- **Environment:** Sensitive config is managed via `.env`, with `.env.example` as template.
- **Unused files:** Files like `donate.js` and `request.js` are not used in this demo but may be kept for reference or future extension.

---

## BlockDAG Resources & Integration

BITNET is tightly integrated with the BlockDAG ecosystem.  
Here’s how each resource is used:

- **BlockDAG Docs:** Reference for smart contract standards, RPC endpoints, and integration details.  
  [https://docs.blockdagnetwork.io/](https://docs.blockdagnetwork.io/)

- **BlockDAG IDE:** Used to write, compile, and deploy the `BITNET.sol` contract to the Primordial Testnet.  
  [https://ide.primordial.bdagscan.com/](https://ide.primordial.bdagscan.com/)

- **BlockDAG Explorer:** Allows users  to view live contract states, token balances, locks, and all transactions (donate, request, burn).  
  [https://primordial.bdagscan.com/](https://primordial.bdagscan.com/)  

   - Direct contract link: [Explorer - BITNET Contract](https://primordial.bdagscan.com/address/0x031f2b19ec717371d3765a091ca4e7bde2fff1f3)

- **BlockDAG Faucet:** Used to obtain test tokens for wallet addresses to interact with the contract.  
  [https://primordial.bdagscan.com/faucet](https://primordial.bdagscan.com/faucet)

- **BlockDAG RPC:** All frontend and backend contract interactions are routed via the Primordial Testnet RPC endpoints.  
  Example: `BLOCKDAG_RPC_URL=https://test-rpc.primordial.bdagscan.com/`

- **Smart Contract ABI:** ABI is stored in `frontend/src/constants/abi.ts` and imported in contract interaction helpers.

- **WalletConnect:** User wallets connect via WalletConnect for seamless Web3 experience; setup instructions and project ID are included.

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd BITNET
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

  - Copy `.env.example` to `.env` and `.env.local`:

     ```bash
     cp .env.example .env
     cp .env.example .env.local
     ```
   - Fill in your values (see [Environment Variables](#environment-variables) below).

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

---



## Usage

### 1. Connect Your Wallet
- Visit the landing page and connect your wallet via WalletConnect or MetaMask (MetaMask preferred).

---

### 2. Donate Bandwidth
- Enter the amount of MB you wish to donate.  
  Rate: 1 MB = 10 BITNET tokens
- Telecom verification is performed via a mock API (`verify.ts`) — up to 1000 MB accepted.
- Upon successful donation:
  - BITNET tokens are minted
  - Check your BITNET token balance at the top of the dashboard
  - View your donation locks on the dashboard
- If your data is not assigned to anyone before expiry, you will not receive rewards.
- Expired donations must be burned the next day.

---

### 3. Request Bandwidth
- After donating, you can request bandwidth from community donors.
- The smart contract matches requests to available donor locks using FIFO logic.
- You’ll see the token split directly in the request card.
- Once the request is fulfilled:
  - Your BITNET balance is updated
  - You can verify it instantly

---

### 4. View Transactions and Contract
- All donations, requests, and token logic are transparent and visible on the BlockDAG Explorer.

---

### 5. History Page
- View all platform transactions
- Toggle between:
  - Network history
  - Your wallet history
- Use filters to view:
  - Donations
  - Requests
  - Unlocks
  - Burns

---

### 6. Network Status Dashboard
- Total Donations: Total MB donated on the platform
- Total Requests: Total MB requested
- Active Locks: Shows ongoing locks actively serving data
- Total Burned: Represents expired donations that were never used

---

### Note
- BITNET currently supports users who hold BDAG tokens.
- Get BDAG tokens from:  
  https://primordial.bdagscan.com/faucet

- To connect MetaMask to BlockDAG Testnet:
  - Visit the docs: https://docs.blockdagnetwork.io/
  - Add a custom network with:
    - Chain ID: `-1043`
    - Metamask can  Detect the network automatically  or refer RPC endpoints from the documentation

Note: Lock and stat updates may be delayed depending on the condition of the on-chain RPC endpoints.

   

---

## Environment Variables

**Include these in your `.env` and `.env.local` files.  
Never commit your real secrets; only use `.env.example` for templates.**

````env name=.env.example
# Mock telecom API key (replace with real key for production)
TELECOM_API_KEY=your_telecom_api_key_here

# Mock telecom API URL
TELECOM_API_URL=https://your-telecom-api/verify

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# Owner private key (NEVER commit your real key!)
OWNER_PRIVATE_KEY=your_owner_private_key_here

# Backend port
PORT=5001

# BlockDAG testnet RPC URL
BLOCKDAG_RPC_URL=https://test-rpc.primordial.bdagscan.com/

# BlockDAG contract address
BLOCKDAG_CONTRACT_ADDRESS=your_contract_address_here

# WalletConnect project ID (get yours at https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Public project ID for frontend
NEXT_PUBLIC_PROJECT_ID=your_project_id_here

# BlockDAG RPC URL for frontend
RPC_URL_BLOCKDAG=https://test-rpc.primordial.bdagscan.com/
````
---

## Smart Contracts

1. **Source:**  
   See `contracts/BITNET.sol`

2. **Deployed address (Primordial BlockDAG Testnet):**  
   `0x031f2b19ec717371d3765a091ca4e7bde2fff1f3`

3. **ABI:**  
   See `frontend/src/constants/abi.ts`

4. **Token Properties:**
   ERC20-compliant
   Permissionless
   On-chain data retrieval
   Ownable
    
  
    

    

---

## License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for details.

---

## Demo

1. **Demo Video 1 (15 mins detailed):** [https://youtu.be/Z2cj9caBVv4?feature=shared](https://youtu.be/Z2cj9caBVv4?feature=shared)
2. **Demo Video 2 (Short just a walkthrough):** [https://youtu.be/boHyLMqgAAo](https://youtu.be/boHyLMqgAAo)
3. **Live Demo:** [https://bitnet-7o2y.vercel.app/](https://bitnet-7o2y.vercel.app/)  
4. **Deployed Contract Address:**  
   `0x031f2b19ec717371d3765a091ca4e7bde2fff1f3`  
5. **BlockDAG Explorer:** [https://primordial.bdagscan.com/](https://primordial.bdagscan.com/)

---

For any questions, issues, or contributions, please see `CONTRIBUTING.md` or open a GitHub Issue.
