// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LandRegistry {
    uint256 public nextLandId = 1;

    struct Land {
        uint256 id;
        string title;
        string location;
        uint256 area; // in square meters
        address owner;
        bool exists;
    }

    // landId => Land
    mapping(uint256 => Land) public lands;
    // landId => history of owners
    mapping(uint256 => address[]) public ownershipHistory;

    event LandRegistered(uint256 indexed landId, address indexed owner, string title);
    event OwnershipTransferred(uint256 indexed landId, address indexed from, address indexed to);

    modifier onlyOwner(uint256 landId) {
        require(lands[landId].exists, "Land not found");
        require(msg.sender == lands[landId].owner, "Only owner allowed");
        _;
    }

    function registerLand(string calldata title, string calldata location, uint256 area) external returns (uint256) {
        uint256 landId = nextLandId++;
        lands[landId] = Land({
            id: landId,
            title: title,
            location: location,
            area: area,
            owner: msg.sender,
            exists: true
        });
        ownershipHistory[landId].push(msg.sender);
        emit LandRegistered(landId, msg.sender, title);
        return landId;
    }

    function transferOwnership(uint256 landId, address newOwner) external onlyOwner(landId) {
        address oldOwner = lands[landId].owner;
        require(newOwner != address(0), "Invalid new owner");
        lands[landId].owner = newOwner;
        ownershipHistory[landId].push(newOwner);
        emit OwnershipTransferred(landId, oldOwner, newOwner);
    }

    function getLand(uint256 landId) external view returns (Land memory) {
        require(lands[landId].exists, "Land not found");
        return lands[landId];
    }

    function getOwnershipHistory(uint256 landId) external view returns (address[] memory) {
        require(lands[landId].exists, "Land not found");
        return ownershipHistory[landId];
    }
}
