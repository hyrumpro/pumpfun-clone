// ignition/modules/TokenFactoryModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenFactory", (m) => {
    const tokenFactory = m.contract("TokenFactory");
    return { tokenFactory };
});
