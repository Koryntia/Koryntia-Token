import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const PresaleModule = buildModule("PresaleModule", (m) => {
  const presaleRate = m.getParameter("presaleRate", 500); // Example rate
  const wallet = "0xYourStaticAddressHere"; // Replace with your static address
  const tokenAddress = "0xYourTokenAddressHere"; // Replace with your deployed token address

  console.log("Deploying Presale contract with the following parameters:");
  console.log(`Presale Rate: ${presaleRate}`);
  console.log(`Wallet Address: ${wallet}`);
  console.log(`Token Address: ${tokenAddress}`);

  const presale = m.contract("Presale", [presaleRate, wallet, tokenAddress]);

  return { presale };
});

export default PresaleModule;