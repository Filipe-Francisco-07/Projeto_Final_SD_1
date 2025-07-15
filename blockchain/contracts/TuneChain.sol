// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TuneChain {
    struct RevenueRecord {
        string title;
        string artist;
        uint plays;
        uint revenue;
        uint timestamp;
    }

    RevenueRecord[] public records;
    address public owner;

    event RevenueRegistered(string title, string artist, uint plays, uint revenue, uint timestamp);

    constructor() {
        owner = msg.sender;
    }

    function registerRevenue(string memory _title, string memory _artist, uint _plays, uint _revenue) public {
        require(msg.sender == owner, "Only owner can register revenue");

        RevenueRecord memory record = RevenueRecord({
            title: _title,
            artist: _artist,
            plays: _plays,
            revenue: _revenue,
            timestamp: block.timestamp
        });

        records.push(record);
        emit RevenueRegistered(_title, _artist, _plays, _revenue, block.timestamp);
    }

    function getRecordCount() public view returns (uint) {
        return records.length;
    }
}
