// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvaluationAnchor
 * @dev Cryptographic anchoring contract for VeriJudge AI / HackJudge.
 * Stores immutable keccak256 hashes of canonical hackathon evaluation bundles.
 */
contract EvaluationAnchor {
    address public owner;

    struct AnchorRecord {
        bytes32 evaluationHash;
        string evaluationId;
        uint256 timestamp;
        address anchoredBy;
        bool exists;
    }

    // Mapping from evaluationHash to AnchorRecord
    mapping(bytes32 => AnchorRecord) private recordsByHash;

    // Mapping from evaluationId to evaluationHash (enables lookup by ID)
    mapping(string => bytes32) private hashById;

    // Event emitted upon anchoring an evaluation
    event EvaluationAnchored(
        bytes32 indexed evaluationHash,
        string evaluationId,
        uint256 timestamp,
        address indexed anchoredBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Anchors an evaluation canonical hash to the blockchain.
     * @param evaluationHash The keccak256 hash of the canonical evaluation JSON.
     * @param evaluationId The unique identifier of the evaluation in HackJudge.
     */
    function anchorEvaluation(bytes32 evaluationHash, string calldata evaluationId) external {
        require(evaluationHash != bytes32(0), "Invalid evaluation hash");
        require(bytes(evaluationId).length > 0, "Evaluation ID cannot be empty");
        require(!recordsByHash[evaluationHash].exists, "Evaluation hash already anchored");

        recordsByHash[evaluationHash] = AnchorRecord({
            evaluationHash: evaluationHash,
            evaluationId: evaluationId,
            timestamp: block.timestamp,
            anchoredBy: msg.sender,
            exists: true
        });

        hashById[evaluationId] = evaluationHash;

        emit EvaluationAnchored(evaluationHash, evaluationId, block.timestamp, msg.sender);
    }

    /**
     * @notice Verifies if a given evaluation hash exists on-chain.
     * @param evaluationHash The keccak256 hash to verify.
     */
    function verifyEvaluation(bytes32 evaluationHash) external view returns (
        bool exists,
        string memory evaluationId,
        uint256 timestamp,
        address anchoredBy
    ) {
        AnchorRecord memory record = recordsByHash[evaluationHash];
        return (record.exists, record.evaluationId, record.timestamp, record.anchoredBy);
    }

    /**
     * @notice Retrieves the anchored hash and details by evaluation ID.
     * @param evaluationId The HackJudge evaluation ID.
     */
    function getEvaluation(string calldata evaluationId) external view returns (
        bytes32 evaluationHash,
        uint256 timestamp,
        address anchoredBy
    ) {
        bytes32 evalHash = hashById[evaluationId];
        require(evalHash != bytes32(0), "Evaluation ID not found");
        AnchorRecord memory record = recordsByHash[evalHash];
        return (record.evaluationHash, record.timestamp, record.anchoredBy);
    }

    /**
     * @notice Transfers ownership of the anchor contract.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        owner = newOwner;
    }
}
