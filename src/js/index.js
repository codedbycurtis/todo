class Task {
    constructor(title, description, dueDate, dueTime, colourKey) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.colourKey = colourKey;
        this.completed = false;
    }
}

const monthStrings = new Map([
    ['01', 'January'],
    ['02', 'February'],
    ['03', 'March'],
    ['04', 'April'],
    ['05', 'May'],
    ['06', 'June'],
    ['07', 'July'],
    ['08', 'August'],
    ['09', 'September'],
    ['10', 'October'],
    ['11', 'November'],
    ['12', 'December']
]);

const tasksPage = document.getElementById('tasks-page');
const taskList = document.getElementById('task-list');
const taskPage = document.getElementById('task-page');
const taskForm = document.getElementById('task-page__form');
var currentPage = 'tasks';
var tasks = loadData();
rebuildList();

document.getElementById('current-year').textContent = new Date().getFullYear();
document.getElementById('add-button').addEventListener('click', () => displayTaskPage(null));
document.getElementById('back-button').addEventListener('click', previousPage);
document.getElementById('task-page__form').addEventListener('submit', validateTask);

function loadData() {
    let json = localStorage.data;
    if (json == null)
        return [];
    return JSON.parse(json);
}

function saveData(data) {
    let json = JSON.stringify(data);
    localStorage.data = json;
}

function createListItem(task) {
    let item = document.createElement('li');
    item.classList.add('list-item');
    item.style.background = `linear-gradient(to right, ${task.colourKey} -100%, transparent)`;

    let titleElement = document.createElement('h3');
    titleElement.textContent = task.title;

    let descriptionElement = document.createElement('p');
    descriptionElement.textContent = task.description;

    let dateTimeElement = document.createElement('p');
    dateTimeElement.innerHTML = `${formatDate(task.dueDate)} &bullet; ${task.dueTime}`;

    let deleteButton = document.createElement('span');
    deleteButton.classList.add('material-symbols-sharp', 'symbol-button', 'list-item-button');
    deleteButton.innerHTML = 'delete';
    deleteButton.title = 'Delete';
    deleteButton.addEventListener('click', () => removeTask(task));

    let editButton = document.createElement('span');
    editButton.classList.add('material-symbols-sharp', 'symbol-button', 'list-item-button');
    editButton.innerHTML = 'edit';
    editButton.title = 'Edit';
    editButton.addEventListener('click', () => displayTaskPage(task));

    let markTaskButton = document.createElement('span');
    markTaskButton.classList.add('material-symbols-sharp', 'symbol-button', 'list-item-button');
    markTaskButton.innerHTML = 'done';
    markTaskButton.title = 'Mark done';
    markTaskButton.addEventListener('click', () => {
        if (!task.completed) {
            markTaskButton.innerHTML = 'close';
            markTaskButton.title = 'Mark undone';
            markDone(item);
        } else {
            markTaskButton.innerHTML = 'done';
            markTaskButton.title = 'Mark done';
            markUndone(item);
        }
        task.completed = !task.completed;
        saveData(tasks);
    });

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('task-edit-controls');
    buttonContainer.appendChild(markTaskButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    let titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.justifyContent = 'space-between';
    titleContainer.appendChild(titleElement);
    titleContainer.appendChild(buttonContainer);

    item.appendChild(titleContainer);
    item.appendChild(descriptionElement);
    item.appendChild(dateTimeElement);
    taskList.appendChild(item);

    if (task.completed) {
        markDone(item);
        markTaskButton.innerHTML = 'close';
        markTaskButton.title = 'Mark undone';
    }
}

function rebuildList() {
    taskList.innerHTML = null;
    tasks.forEach(task => createListItem(task));
}

function markDone(item) {
    item.style.textDecoration = 'line-through';
    item.style.opacity = 0.5;
}

function markUndone(item) {
    item.style.textDecoration = 'initial';
    item.style.opacity = 1;
}

function displayTasksPage() {
    tasksPage.style.display = 'block';
    taskPage.style.display = 'none';
    currentPage = 'tasks';
}

function displayTaskPage(task) {
    tasksPage.style.display = 'none';
    taskPage.style.display = 'block';
    currentPage = 'task';

    if (task == null) {
        taskForm.dataset.inputType = 'add';
        document.querySelector('#task-page .page-header-heading').textContent = 'Add a New Task';
        document.getElementById('task-submit').value = 'Add Task';
    } else {
        taskForm.dataset.inputType = 'update';
        taskForm.dataset.updateIndex = tasks.indexOf(task);
        document.querySelector('#task-page .page-header-heading').textContent = 'Edit Task';
        document.getElementById('task-submit').value = 'Save Task';
    }

    document.getElementById('task-title').value = task?.title ?? null;
    document.getElementById('task-description').value = task?.description ?? null;
    document.getElementById('task-date').value = task?.dueDate ?? null;
    document.getElementById('task-time').value = task?.dueTime ?? null;
    document.getElementById('task-colour').value = task?.colourKey ?? null;
}

function previousPage() {
    switch (currentPage) {
        case 'task':
            displayTasksPage();
            break;
    }
}

function validateTask() {
    let formData = new FormData(taskForm);
    let title = formData.get('task-title');
    let description = formData.get('task-description');
    let date = formData.get('task-date');
    let time = formData.get('task-time');
    let colour = formData.get('task-colour');

    if (taskForm.dataset.inputType == 'update') {
        let task = tasks[taskForm.dataset.updateIndex];
        task.title = title;
        task.description = description;
        task.dueDate = date;
        task.dueTime = time;
        task.colourKey = colour;
        saveData(tasks);
        rebuildList();
        return;
    }

    let task = new Task(title, description, date, time, colour);
    tasks.push(task);
    saveData(tasks);
    createListItem(task);
}

function formatDate(date) {
    let elements = date.split('-');
    let sup = '';
    switch (elements[2]) {
        case '1':
        case '21':
        case '31':
            sup = 'st';
            break;
        case '2':
        case '22':
            sup = 'nd';
            break;
        case '3':
        case '23':
            sup = 'rd';
            break;
        default:
            sup = 'th';
            break;
    }
    return `${elements[2]}<sup>${sup}</sup> ${monthStrings.get(elements[1])} ${elements[0]}`;
}

function removeTask(task) {
    tasks = tasks.filter(t => t != task);
    saveData(tasks);
    rebuildList();
}