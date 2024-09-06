import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const TokenModule = buildModule("TokenModule", (m) => {
  const name = m.getParameter("name", "MyToken");
  const symbol = m.getParameter("symbol", "MTK");
  const initialSupply = m.getParameter("initialSupply", parseEther("1000000")); // 1 million tokens
  const owner = "0xYourStaticAddressHere"; // Replace with your static address

  const token = m.contract("Token", [name, symbol, initialSupply, owner]);

  return { token };
});

export default TokenModule;