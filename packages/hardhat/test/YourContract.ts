import { expect } from "chai";
import { ethers } from "hardhat";
import { ToDoList } from "../typechain-types"; // Путь к сгенерированным типам

describe("ToDoList", function () {
  let toDoList: ToDoList;
  let owner: any;

  before(async () => {
    [owner] = await ethers.getSigners();
    const ToDoListFactory = await ethers.getContractFactory("ToDoList");
    toDoList = (await ToDoListFactory.deploy()) as ToDoList;
    //await toDoList.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy with an empty task list", async function () {
      expect(await toDoList.taskCount()).to.equal(0);
    });
  });

  describe("Task Management", function () {
    it("Should create a new task", async function () {
      const taskContent = "My first task";
      await toDoList.createTask(taskContent);

      const task = await toDoList.getTask(1n);
      expect(task[0]).to.equal(1n);
      expect(task[1]).to.equal(taskContent);
      expect(task[2]).to.equal(false);
    });

    it("Should toggle task completion", async function () {
      await toDoList.toggleCompleted(1);

      const task = await toDoList.getTask(1);
      expect(task[2]).to.equal(true);

      await toDoList.toggleCompleted(1);

      const updatedTask = await toDoList.getTask(1);
      expect(updatedTask[2]).to.equal(false);
    });

    it("Should clear all tasks", async function () {
      await toDoList.createTask("Task 2");
      await toDoList.createTask("Task 3");

      await toDoList.clearTasks();

      const taskCount = await toDoList.taskCount();
      expect(taskCount).to.equal(0);

      // Проверяем, что задачи больше не существуют
      const task1 = await toDoList.getTask(1n);
      expect(task1[1]).to.equal(""); // Проверяем, что контент пустой
      expect(task1[2]).to.equal(false); // Проверяем, что задача не завершена

      const task2 = await toDoList.getTask(2n);
      expect(task2[1]).to.equal(""); // Проверяем, что контент пустой
      expect(task2[2]).to.equal(false);
    });

    it("Should emit TaskCreated event when a task is created", async function () {
      const taskContent = "Task with event";
      await expect(toDoList.createTask(taskContent)).to.emit(toDoList, "TaskCreated").withArgs(1, taskContent, false);
    });

    it("Should emit TaskCompleted event when a task is completed", async function () {
      await toDoList.createTask("Task to complete");

      await expect(toDoList.toggleCompleted(1)).to.emit(toDoList, "TaskCompleted").withArgs(1, true);
    });

    it("Should emit AllTasksCleared event when all tasks are cleared", async function () {
      await toDoList.createTask("Task to be cleared");

      await expect(toDoList.clearTasks()).to.emit(toDoList, "AllTasksCleared");
    });
  });
});
