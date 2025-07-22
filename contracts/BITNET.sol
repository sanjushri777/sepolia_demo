// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BITNET Token with Data Donation Locking and FIFO Unlock/Burn Logic 
 
 * @notice Users can donate and mint tokens, with 90% locked and 10% immediately minted.
 *         Locks are consumed FIFO when requests happen. Expired, unused locks can be burned by anyone.
 *         Tokens are only minted to donor when their lock is fully used before expiry.
 */
contract BITNET is ERC20, Ownable {
    struct LockInfo {
        uint256 lockedAmount;          // Remaining locked amount in this lock
        uint256 initialLockedAmount;   // Original lock amount (for minting)
        bool unlocked;                 // True if fully unlocked (minted to donor) or burned
        uint256 lockTimestamp;         // When this lock was created
        uint256 expiryTimestamp;       // When this lock expires
    }

    address public immutable platformWallet;
    address public immutable telecomWallet;

    uint256 public constant FEE_PERCENT = 2;
    uint256 public constant PLATFORM_SHARE = 1;
    uint256 public constant TELECOM_SHARE = 1;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;

    // donor address => list of locks
    mapping(address => LockInfo[]) public locks;
    address[] public allDonors;

    event DataDonated(address indexed donor, uint256 totalAmount, uint256 immediate, uint256 locked, uint256 expiry);
    event TokensUnlocked(address indexed donor, uint256 lockIndex, uint256 amount);
    event TokensBurned(address indexed donor, uint256 lockIndex, uint256 amount);
    event DataRequested(
        address indexed requester,
        address indexed donor,
        uint256 tokenAmount,
        uint256 fee,
        uint256[] lockIndexes
    );

    constructor(address _platformWallet, address _telecomWallet)
        ERC20("BITNET Token", "BITNET") Ownable(msg.sender)
    {
        require(_platformWallet != address(0) && _telecomWallet != address(0), "Invalid wallet addresses");
        platformWallet = _platformWallet;
        telecomWallet = _telecomWallet;
    }

    /**
     * @notice Called by the user (after off-chain verification)
     * 10% tokens minted to user, 90% locked for expirySeconds.
     */
    function donateAndMint(address donor, uint256 totalAmount, uint256 expirySeconds) external {
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Max supply exceeded");
        require(donor != address(0) && totalAmount > 0 && expirySeconds > 0, "Invalid params");

        uint256 immediate = (totalAmount * 10) / 100;
        uint256 locked = totalAmount - immediate;
        uint256 expiryTimestamp = block.timestamp + expirySeconds;

        if (locks[donor].length == 0) {
            allDonors.push(donor);
        }

        _mint(donor, immediate);

        locks[donor].push(LockInfo({
            lockedAmount: locked,
            initialLockedAmount: locked,
            unlocked: false,
            lockTimestamp: block.timestamp,
            expiryTimestamp: expiryTimestamp
        }));

        emit DataDonated(donor, totalAmount, immediate, locked, expiryTimestamp);
    }

    /**
     * @notice Anyone can call this to burn expired, unused locks.
     */
    function burnExpiredLock(address donor, uint256 lockIndex) external {
        LockInfo storage lockInfo = locks[donor][lockIndex];
        require(!lockInfo.unlocked, "Already unlocked or burned");
        require(lockInfo.lockedAmount > 0, "No tokens to burn");
        require(block.timestamp > lockInfo.expiryTimestamp, "Not expired yet");

        uint256 burned = lockInfo.lockedAmount;
        lockInfo.lockedAmount = 0;
        lockInfo.unlocked = true;

        emit TokensBurned(donor, lockIndex, burned);
        // No _burn needed; tokens not minted yet
    }

    /**
     * @notice Request tokens from donor's locks (FIFO). Unlocks and mints tokens to donor as locks are fully used.
     *         If not enough available (non-expired) locked tokens, reverts.
     * @param donor The donor whose locked tokens are being requested
     * @param tokenAmount Amount requested (amount the donor will receive)
     *        User will pay fee ON TOP of this amount.
     */
    function requestData(address donor, uint256 tokenAmount) external {
        require(msg.sender != donor, "You cannot request your own donation");
        uint256 fee = (tokenAmount * FEE_PERCENT) / 100;
        uint256 totalAmount = tokenAmount + fee;
        require(tokenAmount > 0 && balanceOf(msg.sender) >= totalAmount, "Invalid request");

        uint256 remaining = tokenAmount;
        bool matched = false;
        uint256[] memory usedLocks = new uint256[](locks[donor].length);
        uint256 usedCount = 0;

        // FIFO: consume oldest first
        for (uint i = 0; i < locks[donor].length && remaining > 0; i++) {
            LockInfo storage lockInfo = locks[donor][i];
            if (!lockInfo.unlocked && lockInfo.lockedAmount > 0 && block.timestamp < lockInfo.expiryTimestamp) {
                matched = true;
                uint256 deduct = remaining > lockInfo.lockedAmount ? lockInfo.lockedAmount : remaining;
                lockInfo.lockedAmount -= deduct;
                remaining -= deduct;

                // If fully used, mint to donor
                if (lockInfo.lockedAmount == 0 && !lockInfo.unlocked) {
                    require(totalSupply() + lockInfo.initialLockedAmount <= MAX_SUPPLY, "Max supply exceeded");
                    _mint(donor, lockInfo.initialLockedAmount);
                    lockInfo.unlocked = true;
                    emit TokensUnlocked(donor, i, lockInfo.initialLockedAmount);
                }
                usedLocks[usedCount] = i;
                usedCount++;
            }
        }

        require(matched && remaining == 0, "Not enough locked tokens");

        // Transfer the full requested amount to donor
        _transfer(msg.sender, donor, tokenAmount);

        // Fee split
        uint256 platformFee = (tokenAmount * PLATFORM_SHARE) / 100;
        uint256 telecomFee = (tokenAmount * TELECOM_SHARE) / 100;
        _transfer(msg.sender, platformWallet, platformFee);
        _transfer(msg.sender, telecomWallet, telecomFee);

        // Truncate usedLocks array to only usedCount elements
        uint256[] memory usedLocksFinal = new uint256[](usedCount);
        for (uint j = 0; j < usedCount; j++) {
            usedLocksFinal[j] = usedLocks[j];
        }
        emit DataRequested(msg.sender, donor, tokenAmount, fee, usedLocksFinal);
    }

    // ========== READ FUNCTIONS FOR FRONTEND ==========

    /**
     * @notice Get number of locks for a donor
     */
    function getLockCount(address donor) external view returns (uint256) {
        return locks[donor].length;
    }

    /**
     * @notice Get info about a donor's lock
     */
    function getLockInfo(address donor, uint256 lockIndex)
        external
        view
        returns (uint256 lockedAmount, bool unlocked, uint256 lockTimestamp, uint256 expiryTimestamp, uint256 initialLockedAmount)
    {
        LockInfo storage lockInfo = locks[donor][lockIndex];
        return (
            lockInfo.lockedAmount,
            lockInfo.unlocked,
            lockInfo.lockTimestamp,
            lockInfo.expiryTimestamp,
            lockInfo.initialLockedAmount
        );
    }

    /**
     * @notice Get all donors (for pagination/analytics)
     */
    function getAllDonors() external view returns (address[] memory) {
        return allDonors;
    }
}