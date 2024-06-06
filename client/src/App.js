// src/App.js
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import Messaging from "./contracts/Messaging.json";
import "./App.css";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [contractBalance, setContractBalance] = useState("0");
  const [userBalance, setUserBalance] = useState("0");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          setWeb3(web3);

          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = Messaging.networks[networkId];

          if (deployedNetwork && deployedNetwork.address) {
            const instance = new web3.eth.Contract(
              Messaging.abi,
              deployedNetwork.address
            );
            setContract(instance);

            const messages = await instance.methods.getMessages().call();
            setMessages(messages);

            // Fetch contract balance
            const balance = await web3.eth.getBalance(deployedNetwork.address);
            setContractBalance(web3.utils.fromWei(balance, "ether"));

            // Fetch user balance
            const userBalance = await web3.eth.getBalance(accounts[0]);
            setUserBalance(web3.utils.fromWei(userBalance, "ether"));
          } else {
            console.error("Contract not deployed to detected network.");
          }
        } catch (error) {
          console.error("Error connecting to web3: ", error);
        }
      }
    };
    initWeb3();
  }, []);

  const sendMessage = async () => {
    if (contract && content) {
      try {
        await contract.methods.sendMessage(content).send({ from: account });
        const messages = await contract.methods.getMessages().call();
        setMessages(messages);
        setContent("");

        // Fetch updated balances
        const balance = await web3.eth.getBalance(contract.options.address);
        setContractBalance(web3.utils.fromWei(balance, "ether"));
        
        const userBalance = await web3.eth.getBalance(account);
        setUserBalance(web3.utils.fromWei(userBalance, "ether"));
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

  const fundContract = async () => {
    if (contract) {
      try {
        await contract.methods.fundContract().send({
          from: account,
          value: web3.utils.toWei("1", "ether"),
        });

        // Fetch updated contract balance
        const balance = await web3.eth.getBalance(contract.options.address);
        setContractBalance(web3.utils.fromWei(balance, "ether"));
      } catch (error) {
        console.error("Error funding contract: ", error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Messaging DApp</h1>
      <div>
        <p><strong>Contract Balance:</strong> {contractBalance} ETH</p>
        <p><strong>Your Balance:</strong> {userBalance} ETH</p>
      </div>
      <div>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your message"
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Messages</h2>
        {messages.map((msg, index) => (
          <div key={index}>
            <p><strong>{msg.sender}:</strong> {msg.content}</p>
          </div>
        ))}
      </div>
      <div>
        <button onClick={fundContract}>Fund Contract with 1 ETH</button>
      </div>
    </div>
  );
};

export default App;
