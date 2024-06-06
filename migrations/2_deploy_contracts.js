// migrations/2_deploy_contracts.js
const Messaging = artifacts.require("Messaging");

module.exports = function (deployer) {
  deployer.deploy(Messaging);
};
