"use client";

import { useEffect, useState } from "react";
// Импортируем ethers
import deployedContracts from "../contracts/deployedContracts";
import { ethers } from "ethers";

const contractAddress = deployedContracts[31337].ToDoList.address;
const contractABI = deployedContracts[31337].ToDoList.abi;

const Home = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [taskContent, setTaskContent] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      provider.getSigner().then(signer => {
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
      });
    }
  }, []);

  useEffect(() => {
    if (provider) {
      provider
        .send("eth_requestAccounts", [])
        .then((accounts: string[]) => setConnectedAddress(accounts[0]))
        .catch(err => console.error("Failed to connect account", err));
    }
  }, [provider]);

  // Получаем список задач
  const fetchTasks = async () => {
    if (contract) {
      try {
        const tasksList = [];
        // Загрузим только существующие задачи (не все 10)
        for (let i = 1; i <= 10; i++) {
          const task = await getTask(i);
          console.log(task);
          if (task.id != 0n) {
            tasksList.push(task);
          }
        }
        setTasks(tasksList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  const getTask = async (id: number) => {
    if (contract) {
      try {
        const task = await contract.getTask(id);
        return {
          id: task[0],
          content: task[1],
          completed: task[2],
        };
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    }
  };

  // Добавить задачу
  const addTask = async () => {
    if (contract && taskContent) {
      try {
        const tx = await contract.createTask(taskContent, {
          from: connectedAddress, // Указываем адрес отправителя
        });
        await tx.wait(); // Ждем подтверждения транзакции
        alert("Task added!");
        setTaskContent(""); // Очистить поле ввода
        fetchTasks(); // Перезагружаем задачи
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  // Переключить статус задачи
  const toggleTaskCompleted = async (id: number) => {
    if (contract) {
      try {
        const tx = await contract.toggleCompleted(id, {
          gasLimit: 1000000,
          gasPrice: ethers.parseUnits("10", "gwei"),
        });
        await tx.wait(); // Ждем подтверждения транзакции
        alert("Task status updated!");
        fetchTasks(); // Перезагружаем задачи
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  // Удалить все задачи
  const clearAllTasks = async () => {
    if (contract) {
      try {
        const tx = await contract.clearTasks({
          gasLimit: 1000000,
          gasPrice: ethers.parseUnits("10", "gwei"),
        });
        await tx.wait(); // Ждем подтверждения транзакции
        alert("All tasks deleted!");
        setTasks([]); // Очищаем локальный список задач
      } catch (error) {
        console.error("Error deleting all tasks:", error);
      }
    }
  };

  return (
    <div className="flex items-center flex-col pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">ToDo List</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Connected Address:</p>
          <span>{connectedAddress}</span>
        </div>
      </div>

      <div className="bg-base-300 w-full mt-16 px-8 py-12">
        {/* Форма для добавления задачи */}
        <div className="flex flex-col items-center mb-8">
          <input
            type="text"
            value={taskContent}
            onChange={e => setTaskContent(e.target.value)}
            className="p-2 border rounded mb-2"
            placeholder="Enter task"
          />
          <button onClick={addTask} disabled={!taskContent} className="btn btn-primary">
            Add Task
          </button>
        </div>

        {/* Кнопка для загрузки задач */}
        <div className="flex justify-center mb-8">
          <button onClick={fetchTasks} className="btn btn-secondary">
            Load Tasks
          </button>
        </div>

        {/* Кнопка для удаления всех задач */}
        <div className="flex justify-center mb-8">
          <button onClick={clearAllTasks} className="btn btn-danger">
            Delete All Tasks
          </button>
        </div>

        {/* Список задач */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">Task List</h3>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between w-full max-w-sm mb-3 bg-white p-4 rounded-xl shadow-md"
              >
                <p style={{ color: "black" }}>{task.content}</p>
                <span
                  className={task.completed ? "text-green-500" : "text-red-500"}
                  onClick={() => toggleTaskCompleted(task.id)}
                  style={{ cursor: "pointer" }}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </div>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
