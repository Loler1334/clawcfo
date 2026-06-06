// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PersonalCFORegistry
 * @notice On-chain audit log for Personal CFO agent decisions on Mantle.
 *         Satisfies hackathon requirement: AI-powered function callable on-chain.
 */
contract PersonalCFORegistry {
    struct Rule {
        string ruleType;
        string paramsJson;
        bool active;
        uint256 createdAt;
    }

    struct Decision {
        uint256 id;
        address agentOwner;
        string action;
        string reasoning;
        string inputToken;
        string outputToken;
        uint256 inputAmount;
        uint256 outputAmount;
        bool executed;
        uint256 timestamp;
        bytes32 txHash;
    }

    address public owner;
    uint256 public decisionCount;
    uint256 public ruleCount;

    mapping(uint256 => Rule) public rules;
    mapping(uint256 => Decision) public decisions;
    mapping(address => uint256[]) public ownerDecisions;
    mapping(address => uint256[]) public ownerRules;

    event RuleCreated(uint256 indexed ruleId, address indexed agentOwner, string ruleType);
    event RuleToggled(uint256 indexed ruleId, bool active);
    event AgentTriggered(address indexed caller, uint256 timestamp);
    event DecisionLogged(
        uint256 indexed decisionId,
        address indexed agentOwner,
        string action,
        bool executed
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice On-chain AI trigger - anyone can call to request agent evaluation cycle.
    function triggerAgentEvaluation() external returns (uint256 triggerId) {
        emit AgentTriggered(msg.sender, block.timestamp);
        return block.timestamp;
    }

    function createRule(
        string calldata ruleType,
        string calldata paramsJson
    ) external returns (uint256 ruleId) {
        ruleId = ++ruleCount;
        rules[ruleId] = Rule({
            ruleType: ruleType,
            paramsJson: paramsJson,
            active: true,
            createdAt: block.timestamp
        });
        ownerRules[msg.sender].push(ruleId);
        emit RuleCreated(ruleId, msg.sender, ruleType);
    }

    function toggleRule(uint256 ruleId, bool active) external {
        require(ruleId > 0 && ruleId <= ruleCount, "Invalid rule");
        require(rules[ruleId].active != active || rules[ruleId].createdAt > 0, "No rule");
        rules[ruleId].active = active;
        emit RuleToggled(ruleId, active);
    }

    /// @notice Log an agent decision permanently on Mantle.
    function logDecision(
        address agentOwner,
        string calldata action,
        string calldata reasoning,
        string calldata inputToken,
        string calldata outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        bool executed,
        bytes32 txHash
    ) external onlyOwner returns (uint256 decisionId) {
        decisionId = ++decisionCount;
        decisions[decisionId] = Decision({
            id: decisionId,
            agentOwner: agentOwner,
            action: action,
            reasoning: reasoning,
            inputToken: inputToken,
            outputToken: outputToken,
            inputAmount: inputAmount,
            outputAmount: outputAmount,
            executed: executed,
            timestamp: block.timestamp,
            txHash: txHash
        });
        ownerDecisions[agentOwner].push(decisionId);
        emit DecisionLogged(decisionId, agentOwner, action, executed);
    }

    function getOwnerDecisions(address agentOwner) external view returns (uint256[] memory) {
        return ownerDecisions[agentOwner];
    }

    function getOwnerRules(address agentOwner) external view returns (uint256[] memory) {
        return ownerRules[agentOwner];
    }

    function getDecision(uint256 decisionId) external view returns (Decision memory) {
        require(decisionId > 0 && decisionId <= decisionCount, "Invalid decision");
        return decisions[decisionId];
    }

    function getRule(uint256 ruleId) external view returns (Rule memory) {
        require(ruleId > 0 && ruleId <= ruleCount, "Invalid rule");
        return rules[ruleId];
    }
}
