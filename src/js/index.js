import Notiflix from "notiflix";

const refs = {
  tasksBoxPlanned: document.querySelector(".task__box--planned"),
  tasksBoxCurrent: document.querySelector(".task__box--current"),
  wrapperBox: document.querySelector(".task__wrapper--box"),
  textareaEl: document.querySelector(".form__search"),
  form: document.querySelector(".form"),
  formBtn: document.querySelector(".form__submit"),
  modalBtn: document.querySelector(".modal__btn"),
  modalBackdrop: document.querySelector(".backdrop"),
};

refs.form.addEventListener("submit", (e) => {
  e.preventDefault();
});
refs.modalBtn.addEventListener("click", () =>
  refs.modalBackdrop.classList.add("hidden")
);
refs.textareaEl.addEventListener("input", onChangeHeight);
refs.formBtn.addEventListener("click", onCreateTask);
refs.wrapperBox.addEventListener("click", deleteTask);

let tasks = JSON.parse(localStorage.getItem("tasks"));
let planedTasks = null;
let currentTask = null;

if (tasks === null) tasks = [];

sortTasks();

if (currentTask.length >= 1) startTimer(refs.tasksBoxCurrent);
if (planedTasks.length >= 1) startTimer(refs.tasksBoxPlanned);

function sortTasks() {
  currentTask = [];
  planedTasks = [];

  tasks.forEach((el) => {
    if (el.time <= Date.now()) {
      currentTask.push(el);
      return;
    }
    planedTasks.push(el);
  });
}

function startTimer(container) {
  const tasksList = container.classList.contains("task__box--planned")
    ? planedTasks
    : currentTask;

  container.innerHTML = tasksList.map(createCards).join(" ");

  [...container.children].forEach((el) => {
    let time = el.querySelector(".time").textContent;
    el.querySelector(".time").textContent = changeTime(time);
    if (container.classList.contains("task__box--planned")) {
      el.dataset.timerId = setInterval(() => {
        time -= 1000;

        if (time <= 0) {
          clearInterval(el.dataset.timerId);
          clearIntervals(refs.tasksBoxPlanned);
          clearIntervals(refs.tasksBoxCurrent);
          sortTasks();
          startTimer(refs.tasksBoxPlanned);
          startTimer(refs.tasksBoxCurrent);

          return;
        }
        el.querySelector(".time").textContent = changeTime(time);
      }, 1000);
    } else {
      el.dataset.timerId = setInterval(() => {
        time = Number(time) + 1000;
        el.querySelector(".time").textContent = changeTime(time);
      }, 1000);
    }
  });
}

function clearIntervals(container) {
  [...container.children].forEach((el) => clearInterval(el.dataset.timerId));
}

function onChangeHeight() {
  if (refs.textareaEl.scrollHeight <= 71) {
    return;
  }

  refs.textareaEl.style.height = "auto";
  refs.textareaEl.style.height = refs.textareaEl.scrollHeight + "px";
}

function onCreateTask() {
  if (refs.textareaEl.value.length === 0) {
    Notiflix.Notify.warning("Enter a task consisting of more than one letter");
    return;
  }

  sendDataOnLocalStorage(refs.textareaEl.value);

  refs.textareaEl.value = "";
  refs.textareaEl.style.height = "auto";
  clearIntervals(refs.tasksBoxPlanned);
  clearIntervals(refs.tasksBoxCurrent);
  startTimer(refs.tasksBoxPlanned);
  startTimer(refs.tasksBoxCurrent);
}

function deleteTask(e) {
  if (!e.target.closest(".card__button")) {
    return;
  }
  const card = e.target.closest(".card");
  const id = Number(card.dataset.id);

  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  sortTasks();
  clearIntervals(refs.tasksBoxPlanned);
  clearIntervals(refs.tasksBoxCurrent);

  refs.tasksBoxPlanned.innerHTML = planedTasks.map(createCards).join(" ");
  refs.tasksBoxCurrent.innerHTML = currentTask.map(createCards).join(" ");

  startTimer(refs.tasksBoxPlanned);
  startTimer(refs.tasksBoxCurrent);
}

function sendDataOnLocalStorage(value) {
  tasks.push(...createData(value));
  tasks.sort((a, b) => a.time - b.time);
  sortTasks();

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createData(value) {
  return [
    {
      name: value,
      time: Date.now() + 3600000,
      id: Date.now() + 1,
    },
    {
      name: value,
      time: Date.now() + 86400000,
      id: Date.now() + 2,
    },
    {
      name: value,
      time: Date.now() + 604800000,
      id: Date.now() + 3,
    },
    {
      name: value,
      time: Date.now() + 2592000000,
      id: Date.now() + 4,
    },
  ];
}

function createCards(value) {
  let currentTime = value.time - Date.now();

  if (currentTime.toString()[0] === "-") {
    currentTime = currentTime.toString().slice(1);
  }

  return `
  <div data-id="${value.id}" class="card">
    <p class="card__subtitle">${value.name}</p>
    <span class="time">${currentTime}</span>
    <button type="button" class="card__button">
      <svg class="card__svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 6L18 18M6 18L18 6" stroke="#fff" stroke-width="3"/>
      </svg>
    </button>
  </div>
  `;
}

{
  /* <svg class="card__svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 6L18 18M6 18L18 6" stroke="#fff" stroke-width="3"/>
      </svg> */
}

function changeTime(ms) {
  let sec = Math.floor(ms / 1000) % 60;
  let min = Math.floor(ms / (1000 * 60)) % 60;
  let hrs = Math.floor(ms / (1000 * 60 * 60)) % 24;
  let days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${String(days).padStart(2, "0")}:${String(hrs).padStart(
    2,
    "0"
  )}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
