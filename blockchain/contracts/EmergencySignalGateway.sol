// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EmergencySignalGateway
 * @dev External Data Verifier for disaster/climate events
 * Integrates with BMKG (Indonesian Meteorology Agency) for real-time disaster alerts
 */
contract EmergencySignalGateway is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;
    
    enum DisasterType { NONE, EARTHQUAKE, TSUNAMI, VOLCANIC, FLOOD, TYPHOON }
    
    struct DisasterEvent {
        DisasterType disasterType;
        string location;
        uint8 severity; // 1-5 scale
        uint256 timestamp;
        bool isActive;
        string[] affectedRegions;
    }
    
    struct RegionStatus {
        bool isInEmergency;
        DisasterType currentDisaster;
        uint8 severityLevel;
        uint256 emergencyStartTime;
        uint256 lastUpdate;
    }
    
    mapping(uint256 => DisasterEvent) public disasters;
    mapping(string => RegionStatus) public regionStatus;
    mapping(bytes32 => uint256) private requestIdToDisasterId;
    
    uint256 public disasterCount;
    bytes32 private jobId;
    uint256 private fee;
    
    address public impactBountyContract;
    
    event DisasterDetected(uint256 indexed disasterId, DisasterType disasterType, string location, uint8 severity);
    event EmergencyActivated(string indexed region, DisasterType disasterType);
    event EmergencyDeactivated(string indexed region);
    event PriorityProtocolTriggered(string indexed region, uint256 affectedMothers);
    
    constructor(address _link, address _oracle, bytes32 _jobId) Ownable(msg.sender) {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = 0.1 * 10**18; // 0.1 LINK
    }
    
    function setImpactBountyContract(address _contract) external onlyOwner {
        impactBountyContract = _contract;
    }
    
    function requestDisasterData(string memory _region) external returns (bytes32) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillDisasterData.selector
        );
        
        req.add("region", _region);
        req.add("endpoint", "bmkg-disaster-api");
        req.add("path", "data.disasters");
        
        bytes32 requestId = sendChainlinkRequest(req, fee);
        return requestId;
    }
    
    function fulfillDisasterData(
        bytes32 _requestId,
        uint8 _disasterType,
        string memory _location,
        uint8 _severity
    ) external recordChainlinkFulfillment(_requestId) {
        require(_severity <= 5, "Invalid severity level");
        
        uint256 disasterId = disasterCount++;
        
        string[] memory affectedRegions = new string[](1);
        affectedRegions[0] = _location;
        
        disasters[disasterId] = DisasterEvent({
            disasterType: DisasterType(_disasterType),
            location: _location,
            severity: _severity,
            timestamp: block.timestamp,
            isActive: true,
            affectedRegions: affectedRegions
        });
        
        requestIdToDisasterId[_requestId] = disasterId;
        
        emit DisasterDetected(disasterId, DisasterType(_disasterType), _location, _severity);
        
        // Activate emergency protocol for severe disasters (level 3+)
        if (_severity >= 3) {
            _activateEmergencyProtocol(_location, DisasterType(_disasterType), _severity);
        }
    }
    
    function _activateEmergencyProtocol(
        string memory _region,
        DisasterType _disasterType,
        uint8 _severity
    ) private {
        regionStatus[_region] = RegionStatus({
            isInEmergency: true,
            currentDisaster: _disasterType,
            severityLevel: _severity,
            emergencyStartTime: block.timestamp,
            lastUpdate: block.timestamp
        });
        
        emit EmergencyActivated(_region, _disasterType);
        
        // Trigger Priority Protocol in ImpactBounty contract
        if (impactBountyContract != address(0)) {
            (bool success, ) = impactBountyContract.call(
                abi.encodeWithSignature("activateDisasterMode()")
            );
            require(success, "Failed to activate disaster mode");
            
            emit PriorityProtocolTriggered(_region, 0); // Count updated by ImpactBounty
        }
    }
    
    function deactivateEmergency(string memory _region) external onlyOwner {
        regionStatus[_region].isInEmergency = false;
        regionStatus[_region].lastUpdate = block.timestamp;
        
        emit EmergencyDeactivated(_region);
    }
    
    function isRegionInEmergency(string memory _region) external view returns (bool) {
        return regionStatus[_region].isInEmergency;
    }
    
    function getRegionStatus(string memory _region) external view returns (
        bool isInEmergency,
        DisasterType currentDisaster,
        uint8 severityLevel,
        uint256 emergencyStartTime
    ) {
        RegionStatus memory status = regionStatus[_region];
        return (
            status.isInEmergency,
            status.currentDisaster,
            status.severityLevel,
            status.emergencyStartTime
        );
    }
    
    function getDisasterInfo(uint256 _disasterId) external view returns (DisasterEvent memory) {
        return disasters[_disasterId];
    }
    
    // Manual trigger for testing or government-declared emergencies
    function manualEmergencyTrigger(
        string memory _region,
        DisasterType _disasterType,
        uint8 _severity
    ) external onlyOwner {
        _activateEmergencyProtocol(_region, _disasterType, _severity);
    }
}
