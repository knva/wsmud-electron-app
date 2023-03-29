const { ipcRenderer } = require('electron')

function showButtons() {
    document.getElementById('tasks-container').style.display = 'none'
    document.getElementById('add-task-form').style.display = 'none'
}

function showTasks() {
    document.getElementById('tasks-container').style.display = 'block'
    document.getElementById('add-task-form').style.display = 'none'
}

function addTask() {
    const name = document.getElementById('task-name').value
    const cron = document.getElementById('task-cron').value
    const action = document.getElementById('task-action').value
    ipcRenderer.send('add-task', { name, cron, action })
}

function createTask(id, name, cron, action) {
    const task = document.createElement('div');
    task.classList.add('task');
    task.dataset.id = id;

    const nameEl = document.createElement('div');
    nameEl.classList.add('task-name');
    nameEl.innerText = name;
    task.appendChild(nameEl);

    const cronEl = document.createElement('div');
    cronEl.classList.add('task-cron');
    cronEl.innerText = cron;
    task.appendChild(cronEl);

    // const actionEl = document.createElement('div');
    // actionEl.classList.add('task-action');
    // actionEl.innerText = action;
    // task.appendChild(actionEl);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '删除';
    deleteButton.addEventListener('click', () => { ipcRenderer.send('delete-task', { id }) });
    deleteButton.classList.add('task-delete');
    deleteButton.style.float = 'right';
    task.appendChild(deleteButton);

    document.getElementById('tasks-container').appendChild(task);
}

ipcRenderer.on('tasks-loaded', (event, tasks) => {
    tasks.forEach(task => {
        createTask(task.id, task.name, task.cron, task.action)
    })
})

ipcRenderer.on('task-added', (event, task) => {
    createTask(task.id, task.name, task.cron, task.action)
})

ipcRenderer.on('task-deleted', (event, { id }) => {
    const taskEl = document.querySelector(`.task[data-id="${id}"]`)
    if (taskEl) {
        taskEl.remove()
    }
})

ipcRenderer.send('load-tasks')
