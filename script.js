const pomodoro = document.getElementById("time-display");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById("task-form");
const garden = document.querySelector(".garden")

let remainingSeconds = 1500;
let isTimerRunning = false;
let timerInterval = null;
let completedSessions = 0;
let completedTasks = 0;

function calculateGardenState(){
    const grassCount = completedSessions;
    const flowerCount = Math.floor(completedTasks/2);
    const treeCount = Math.floor(completedSessions/3);
    const butterflyCount = Math.min(Math.floor(completedTasks/5),Math.floor(completedSessions/2));
    const birdCount = Math.min(Math.floor(completedTasks/10),Math.floor(completedSessions/5));

    return{
        grassCount,flowerCount,treeCount,butterflyCount,birdCount
    };
}
const GROWTH_EMOJI = {
    grass: "🌱",
    flower: "🌸",
    tree: "🌳",
    butterfly: "🦋",
    bird: "🐦"
};

function renderGrowth(type,targetCount){
    const existing = garden.querySelectorAll(`.garden-item.${type}`).length;
    const missing = targetCount - existing;
    if (missing <=0) return;
    for (let i = 0; i < missing; i++) {
        const item = document.createElement("div");
        item.className = `garden-item ${type}`;
        item.textContent = GROWTH_EMOJI[type];
        garden.appendChild(item);
    }
}
function updateGarden(){
    const state = calculateGardenState();
    renderGrowth("grass", state.grassCount);
    renderGrowth("flower", state.flowerCount);
    renderGrowth("tree", state.treeCount);
    renderGrowth("butterfly", state.butterflyCount);
    renderGrowth("bird", state.birdCount);
}


function formatTime(totalSeconds) {
    let minutes = Math.floor(totalSeconds/60);
    let seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}
function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        remainingSeconds -= 1;
        pomodoro.textContent = formatTime(remainingSeconds);
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            completedSessions += 1;
            remainingSeconds = 1500;
            pomodoro.textContent = formatTime(remainingSeconds);
            updateGarden();
            updateDayNight();
            saveState();
        }
    }, 1000);
}
function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}
function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    remainingSeconds = 1500;
    pomodoro.textContent = formatTime(remainingSeconds);
}
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

function onTaskCompleted(taskText) {
    completedTasks += 1;
    console.log(`Task completed: ${taskText}`);
    updateGarden();
}
function addTask(taskText) {
    const li = document.createElement("li");
    li.className = "task-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = taskText;
    const editBtn = document.createElement("button");
    editBtn.className = "task-edit-btn";
    editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
    editBtn.title = "Edit task";
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-delete-btn";
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    deleteBtn.title = "Delete task";
    li.append(checkbox, textSpan, editBtn, deleteBtn);
    taskList.appendChild(li);

    deleteBtn.addEventListener("click", () => {
        li.remove();
        saveState()
    });

    editBtn.addEventListener("click", () => {
        if (!checkbox.checked) {
            taskInput.value = textSpan.textContent;
            li.remove();
            saveState()
        }
    });

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            li.classList.add("completed");
            onTaskCompleted(taskText);
        } else {
            li.classList.remove("completed");
        }
        saveState();
    });
}
function updateDayNight(){
    const isNight = completedSessions % 2 === 1;
    document.body.classList.toggle("night", isNight);
}

function saveState() {
    const allTasks = [];
    document.querySelectorAll("#task-list .task-item").forEach(li => {
        const text = li.querySelector(".task-text").textContent;
        const isDone = li.querySelector(".task-checkbox").checked;
        allTasks.push({ text, completed: isDone});
    })
    const taskState = {
            completedSessions, completedTasks, tasks: allTasks
    };
    localStorage.setItem("gardenState", JSON.stringify(taskState));
}
function loadState() {
    const saved = localStorage.getItem("gardenState")
    if (!saved) return;
    const taskState = JSON.parse(saved);
    completedSessions = taskState.completedSessions || 0;
    completedTasks= taskState.completedTasks || 0;
    if(taskState.tasks) {
        taskState.tasks.forEach(task => {
            addTask(task.text);
            const lastLi = taskList.lastElementChild;
            if (task.completed) {
                lastLi.querySelector(".task-checkbox").checked = true;
                lastLi.classList.add("completed");
            }
        })
    }
}
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = "";
        saveState();
    }
});
loadState();
updateGarden();
updateDayNight();
