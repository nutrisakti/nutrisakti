// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BGNQualityAuditor
 * @dev Nutritional Balance Validator for government-provided food (BGN/SPPG)
 * Allows mothers to log provided food and audits provider performance on-chain
 */
contract BGNQualityAuditor is Ownable {
    
    struct FoodProvider {
        string name;
        address providerAddress;
        uint256 totalDeliveries;
        uint256 totalRating;
        uint256 averageRating; // Out of 100
        bool isActive;
        uint256 registrationDate;
    }
    
    struct FoodLog {
        address mother;
        address provider;
        string foodType;
        uint256 quantity; // in grams
        uint256 nutritionalScore; // 0-100
        uint256 qualityRating; // 0-100
        string[] deficiencies; // e.g., ["protein", "iron"]
        uint256 timestamp;
        bool verified;
    }
    
    struct NutritionalStandard {
        string foodType;
        uint256 minProtein; // grams per 100g
        uint256 minCarbs;
        uint256 minFat;
        uint256 minCalories;
        bool isActive;
    }
    
    mapping(address => FoodProvider) public providers;
    mapping(uint256 => FoodLog) public foodLogs;
    mapping(string => NutritionalStandard) public standards;
    mapping(address => uint256[]) public motherLogs;
    mapping(address => uint256[]) public providerLogs;
    
    uint256 public logCount;
    uint256 public providerCount;
    
    event ProviderRegistered(address indexed provider, string name);
    event FoodLogged(uint256 indexed logId, address indexed mother, address indexed provider, uint256 qualityRating);
    event QualityAlertTriggered(address indexed provider, uint256 averageRating);
    event ProviderRankingUpdated(address indexed provider, uint256 newRating);
    event StandardUpdated(string foodType, uint256 minProtein, uint256 minCarbs);
    
    constructor() Ownable(msg.sender) {
        _initializeStandards();
    }
    
    function _initializeStandards() private {
        // Indonesian maternal nutrition standards
        standards["rice"] = NutritionalStandard("rice", 7, 77, 1, 365, true);
        standards["egg"] = NutritionalStandard("egg", 13, 1, 11, 155, true);
        standards["fish"] = NutritionalStandard("fish", 20, 0, 5, 120, true);
        standards["vegetables"] = NutritionalStandard("vegetables", 3, 7, 0, 40, true);
        standards["moringa"] = NutritionalStandard("moringa", 9, 8, 1, 64, true);
    }
    
    function registerProvider(address _providerAddress, string memory _name) external onlyOwner {
        require(!providers[_providerAddress].isActive, "Provider already registered");
        
        providers[_providerAddress] = FoodProvider({
            name: _name,
            providerAddress: _providerAddress,
            totalDeliveries: 0,
            totalRating: 0,
            averageRating: 100, // Start with perfect score
            isActive: true,
            registrationDate: block.timestamp
        });
        
        providerCount++;
        emit ProviderRegistered(_providerAddress, _name);
    }
    
    function logFood(
        address _provider,
        string memory _foodType,
        uint256 _quantity,
        uint256 _actualProtein,
        uint256 _actualCarbs,
        uint256 _actualFat,
        uint256 _actualCalories,
        uint256 _qualityRating
    ) external returns (uint256) {
        require(providers[_provider].isActive, "Provider not registered");
        require(_qualityRating <= 100, "Rating must be 0-100");
        
        // Calculate nutritional score against standards
        uint256 nutritionalScore = _calculateNutritionalScore(
            _foodType,
            _actualProtein,
            _actualCarbs,
            _actualFat,
            _actualCalories
        );
        
        // Identify deficiencies
        string[] memory deficiencies = _identifyDeficiencies(
            _foodType,
            _actualProtein,
            _actualCarbs,
            _actualFat,
            _actualCalories
        );
        
        uint256 logId = logCount++;
        foodLogs[logId] = FoodLog({
            mother: msg.sender,
            provider: _provider,
            foodType: _foodType,
            quantity: _quantity,
            nutritionalScore: nutritionalScore,
            qualityRating: _qualityRating,
            deficiencies: deficiencies,
            timestamp: block.timestamp,
            verified: true
        });
        
        motherLogs[msg.sender].push(logId);
        providerLogs[_provider].push(logId);
        
        // Update provider rating
        _updateProviderRating(_provider, _qualityRating);
        
        emit FoodLogged(logId, msg.sender, _provider, _qualityRating);
        
        return logId;
    }
    
    function _calculateNutritionalScore(
        string memory _foodType,
        uint256 _actualProtein,
        uint256 _actualCarbs,
        uint256 _actualFat,
        uint256 _actualCalories
    ) private view returns (uint256) {
        NutritionalStandard memory standard = standards[_foodType];
        if (!standard.isActive) return 50; // Default score if no standard
        
        uint256 proteinScore = _actualProtein >= standard.minProtein ? 25 : (_actualProtein * 25) / standard.minProtein;
        uint256 carbsScore = _actualCarbs >= standard.minCarbs ? 25 : (_actualCarbs * 25) / standard.minCarbs;
        uint256 fatScore = _actualFat >= standard.minFat ? 25 : (_actualFat * 25) / standard.minFat;
        uint256 calorieScore = _actualCalories >= standard.minCalories ? 25 : (_actualCalories * 25) / standard.minCalories;
        
        return proteinScore + carbsScore + fatScore + calorieScore;
    }
    
    function _identifyDeficiencies(
        string memory _foodType,
        uint256 _actualProtein,
        uint256 _actualCarbs,
        uint256 _actualFat,
        uint256 _actualCalories
    ) private view returns (string[] memory) {
        NutritionalStandard memory standard = standards[_foodType];
        string[] memory tempDeficiencies = new string[](4);
        uint256 count = 0;
        
        if (_actualProtein < standard.minProtein) {
            tempDeficiencies[count] = "protein";
            count++;
        }
        if (_actualCarbs < standard.minCarbs) {
            tempDeficiencies[count] = "carbohydrates";
            count++;
        }
        if (_actualFat < standard.minFat) {
            tempDeficiencies[count] = "fat";
            count++;
        }
        if (_actualCalories < standard.minCalories) {
            tempDeficiencies[count] = "calories";
            count++;
        }
        
        string[] memory deficiencies = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            deficiencies[i] = tempDeficiencies[i];
        }
        
        return deficiencies;
    }
    
    function _updateProviderRating(address _provider, uint256 _newRating) private {
        FoodProvider storage provider = providers[_provider];
        provider.totalDeliveries++;
        provider.totalRating += _newRating;
        provider.averageRating = provider.totalRating / provider.totalDeliveries;
        
        emit ProviderRankingUpdated(_provider, provider.averageRating);
        
        // Trigger alert if quality drops below 60%
        if (provider.averageRating < 60 && provider.totalDeliveries >= 5) {
            emit QualityAlertTriggered(_provider, provider.averageRating);
        }
    }
    
    function getProviderRanking(address _provider) external view returns (
        string memory name,
        uint256 totalDeliveries,
        uint256 averageRating,
        bool isActive
    ) {
        FoodProvider memory provider = providers[_provider];
        return (
            provider.name,
            provider.totalDeliveries,
            provider.averageRating,
            provider.isActive
        );
    }
    
    function getMotherFoodHistory(address _mother) external view returns (uint256[] memory) {
        return motherLogs[_mother];
    }
    
    function getProviderFoodHistory(address _provider) external view returns (uint256[] memory) {
        return providerLogs[_provider];
    }
    
    function getFoodLog(uint256 _logId) external view returns (FoodLog memory) {
        return foodLogs[_logId];
    }
    
    function updateNutritionalStandard(
        string memory _foodType,
        uint256 _minProtein,
        uint256 _minCarbs,
        uint256 _minFat,
        uint256 _minCalories
    ) external onlyOwner {
        standards[_foodType] = NutritionalStandard(
            _foodType,
            _minProtein,
            _minCarbs,
            _minFat,
            _minCalories,
            true
        );
        
        emit StandardUpdated(_foodType, _minProtein, _minCarbs);
    }
    
    function deactivateProvider(address _provider) external onlyOwner {
        providers[_provider].isActive = false;
    }
}
