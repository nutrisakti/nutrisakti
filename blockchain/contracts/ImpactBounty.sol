// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title ImpactBounty
 * @dev Smart contract for USDC disbursement based on maternal health milestones
 */
contract ImpactBounty is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    
    struct Mother {
        address walletAddress;
        bytes32 didHash; // W3C DID hash
        uint256 registrationDate;
        uint256 totalDisbursed;
        bool isActive;
        uint8 priorityLevel; // 0=normal, 1=high, 2=disaster
    }
    
    struct Milestone {
        string name;
        uint256 rewardAmount;
        bool isActive;
    }
    
    struct KitRequest {
        address requester;
        uint256 amount;
        string kitType;
        bool fulfilled;
        uint256 timestamp;
    }
    
    mapping(address => Mother) public mothers;
    mapping(uint256 => Milestone) public milestones;
    mapping(address => mapping(uint256 => bool)) public milestoneCompleted;
    mapping(uint256 => KitRequest) public kitRequests;
    
    uint256 public milestoneCount;
    uint256 public kitRequestCount;
    bool public disasterMode;
    
    event MotherRegistered(address indexed mother, bytes32 didHash);
    event MilestoneCompleted(address indexed mother, uint256 milestoneId, uint256 reward);
    event KitRequested(uint256 indexed requestId, address indexed mother, string kitType);
    event KitFulfilled(uint256 indexed requestId, address indexed vendor);
    event DisasterModeActivated(uint256 timestamp);
    event PriorityElevated(address indexed mother, uint8 newPriority);
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        _initializeMilestones();
    }
    
    function _initializeMilestones() private {
        milestones[0] = Milestone("First Prenatal Visit", 10 * 10**6, true); // 10 USDC
        milestones[1] = Milestone("BPJS Verification", 5 * 10**6, true); // 5 USDC
        milestones[2] = Milestone("Second Trimester Checkup", 15 * 10**6, true);
        milestones[3] = Milestone("Birth Registration", 20 * 10**6, true);
        milestones[4] = Milestone("First Vaccination", 10 * 10**6, true);
        milestones[5] = Milestone("6-Month Growth Check", 15 * 10**6, true);
        milestoneCount = 6;
    }
    
    function registerMother(bytes32 _didHash) external {
        require(!mothers[msg.sender].isActive, "Already registered");
        
        mothers[msg.sender] = Mother({
            walletAddress: msg.sender,
            didHash: _didHash,
            registrationDate: block.timestamp,
            totalDisbursed: 0,
            isActive: true,
            priorityLevel: 0
        });
        
        emit MotherRegistered(msg.sender, _didHash);
    }
    
    function completeMilestone(address _mother, uint256 _milestoneId) external onlyOwner nonReentrant {
        require(mothers[_mother].isActive, "Mother not registered");
        require(_milestoneId < milestoneCount, "Invalid milestone");
        require(milestones[_milestoneId].isActive, "Milestone inactive");
        require(!milestoneCompleted[_mother][_milestoneId], "Already completed");
        
        uint256 reward = milestones[_milestoneId].rewardAmount;
        
        // Apply disaster mode multiplier
        if (disasterMode && mothers[_mother].priorityLevel >= 1) {
            reward = reward * 150 / 100; // 50% bonus
        }
        
        milestoneCompleted[_mother][_milestoneId] = true;
        mothers[_mother].totalDisbursed += reward;
        
        require(usdcToken.transfer(_mother, reward), "Transfer failed");
        
        emit MilestoneCompleted(_mother, _milestoneId, reward);
    }
    
    function requestKit(string memory _kitType, uint256 _amount) external returns (uint256) {
        require(mothers[msg.sender].isActive, "Not registered");
        
        uint256 requestId = kitRequestCount++;
        kitRequests[requestId] = KitRequest({
            requester: msg.sender,
            amount: _amount,
            kitType: _kitType,
            fulfilled: false,
            timestamp: block.timestamp
        });
        
        emit KitRequested(requestId, msg.sender, _kitType);
        return requestId;
    }
    
    function fulfillKit(uint256 _requestId, address _vendor) external onlyOwner nonReentrant {
        KitRequest storage request = kitRequests[_requestId];
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        require(usdcToken.transfer(_vendor, request.amount), "Transfer failed");
        
        emit KitFulfilled(_requestId, _vendor);
    }
    
    function activateDisasterMode() external onlyOwner {
        disasterMode = true;
        emit DisasterModeActivated(block.timestamp);
    }
    
    function elevatePriority(address _mother, uint8 _priority) external onlyOwner {
        require(mothers[_mother].isActive, "Mother not registered");
        require(_priority <= 2, "Invalid priority");
        
        mothers[_mother].priorityLevel = _priority;
        emit PriorityElevated(_mother, _priority);
    }
    
    function fundContract(uint256 _amount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    }
    
    function getMotherInfo(address _mother) external view returns (Mother memory) {
        return mothers[_mother];
    }
}
