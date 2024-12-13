import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployToDoList: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Деплой контракта
  await deploy("ToDoList", {
    // Используйте правильное имя контракта с заглавной буквой "D"
    from: deployer,
    args: [], // Конструктор не принимает аргументов
    log: true,
    autoMine: true, // Для локальных сетей
  });

  const toDoList = await hre.ethers.getContract<Contract>("ToDoList", deployer);
  console.log("✅ ToDoList контракт развернут:", toDoList.address);
};

export default deployToDoList;

deployToDoList.tags = ["ToDoList"];
