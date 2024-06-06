// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Messaging {
    struct Message {
        address sender;
        string content;
    }

    Message[] public messages;
    address public owner;

    event MessageSent(address indexed sender, string content);
    event UserRewarded(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function sendMessage(string memory _content) public payable {
        messages.push(Message(msg.sender, _content));
        emit MessageSent(msg.sender, _content);

        if (bytes(_content).length == 2) {
            require(address(this).balance >= 1 ether, "Contract does not have enough balance to reward");
            payable(msg.sender).transfer(1 ether);
            emit UserRewarded(msg.sender, 1 ether);
        }
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }

    function fundContract() public payable {
        require(msg.value > 0, "Must send some ether to fund the contract");
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}
