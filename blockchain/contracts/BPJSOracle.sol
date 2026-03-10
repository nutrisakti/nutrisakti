// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BPJSVerificationBridge
 * @dev Verification Bridge for BPJS health insurance verification using Chainlink
 * Provides secure connection to government data without exposing PII
 */
contract BPJSVerificationBridge is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;
    
    struct BPJSStatus {
        bool isVerified;
        bool hasActiveCoverage;
        uint256 lastChecked;
        bytes32 zkProofHash; // Zero-knowledge proof hash
    }
    
    mapping(address => BPJSStatus) public bpjsStatuses;
    mapping(bytes32 => address) private requestIdToAddress;
    
    bytes32 private jobId;
    uint256 private fee;
    
    event BPJSVerificationRequested(address indexed user, bytes32 requestId);
    event BPJSVerified(address indexed user, bool hasActiveCoverage);
    event ProtectionAlarmTriggered(address indexed user, uint256 timestamp);
    
    event ProtectionAlarmSent(address indexed healthPost, address indexed mother, uint256 timestamp);
    
    constructor(address _link, address _oracle, bytes32 _jobId) Ownable(msg.sender) {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = 0.1 * 10**18; // 0.1 LINK
    }
    
    function requestBPJSVerification(bytes32 _zkProofHash) external returns (bytes32) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillBPJSVerification.selector
        );
        
        req.add("zkProof", bytes32ToString(_zkProofHash));
        req.add("endpoint", "bpjs-verification");
        
        bytes32 requestId = sendChainlinkRequest(req, fee);
        requestIdToAddress[requestId] = msg.sender;
        
        bpjsStatuses[msg.sender].zkProofHash = _zkProofHash;
        bpjsStatuses[msg.sender].lastChecked = block.timestamp;
        
        emit BPJSVerificationRequested(msg.sender, requestId);
        return requestId;
    }
    
    function fulfillBPJSVerification(bytes32 _requestId, bool _hasActiveCoverage) 
        external 
        recordChainlinkFulfillment(_requestId) 
    {
        address user = requestIdToAddress[_requestId];
        
        bpjsStatuses[user].isVerified = true;
        bpjsStatuses[user].hasActiveCoverage = _hasActiveCoverage;
        
        emit BPJSVerified(user, _hasActiveCoverage);
        
        // Trigger automated alert to local health posts if uncovered
        if (!_hasActiveCoverage) {
            emit ProtectionAlarmTriggered(user, block.timestamp);
            _sendHealthPostAlert(user);
        }
    }
    
    function getBPJSStatus(address _user) external view returns (BPJSStatus memory) {
        return bpjsStatuses[_user];
    }
    
    function bytes32ToString(bytes32 _bytes32) private pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}

    
    // Health post alert system
    address[] public registeredHealthPosts;
    mapping(address => bool) public isHealthPost;
    
    function registerHealthPost(address _healthPost) external onlyOwner {
        require(!isHealthPost[_healthPost], "Already registered");
        isHealthPost[_healthPost] = true;
        registeredHealthPosts.push(_healthPost);
    }
    
    function _sendHealthPostAlert(address _mother) private {
        // Trigger automated alert to all registered health posts
        for (uint256 i = 0; i < registeredHealthPosts.length; i++) {
            emit ProtectionAlarmSent(registeredHealthPosts[i], _mother, block.timestamp);
        }
    }
