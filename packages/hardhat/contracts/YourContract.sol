// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract ToDoList {
    struct Task {
        uint id;
        string content;
        bool completed;
    }

    uint public taskCount = 0;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed);
    event TaskCompleted(uint id, bool completed);
    event AllTasksCleared();  // Событие для уведомления о сбросе задач

    // Функция для создания задачи
    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    // Функция для получения задачи по ID
    function getTask(uint _id) public view returns (uint, string memory, bool) {
        Task memory task = tasks[_id];
        return (task.id, task.content, task.completed);
    }

    // Функция для переключения статуса задачи (выполнена/не выполнена)
    function toggleCompleted(uint _id) public {
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskCompleted(_id, task.completed);
    }

    // Функция для удаления всех задач
    function clearTasks() public {
        for (uint i = 1; i <= taskCount; i++) {
            delete tasks[i];  // Удаляем задачу по каждому ID
        }
        taskCount = 0;  // Сбрасываем счётчик задач
        emit AllTasksCleared();  // Генерируем событие
    }
}