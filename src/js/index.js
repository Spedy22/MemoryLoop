import Notiflix from "notiflix";

const refs = {
  card: document.querySelectorAll(".card"),
  // delete: document.querySelector(".modal__btn--delete"),
  // cancel: document.querySelector(".modal__btn--cancel"),
  tasksBoxPlanned: document.querySelector(".task__box--planned"),
  tasksBoxCurrent: document.querySelector(".task__box--current"),
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
refs.tasksBoxPlanned.addEventListener("click", onDeleteTaskOnPlanned);
refs.tasksBoxCurrent.addEventListener("click", onDeleteTaskOnCurrent);

let tasks = JSON.parse(localStorage.getItem("tasks"));
let planedTasks = null;
let currentTask = null;
let timerPlanned = false;

if (tasks === null) {
  tasks = [];
}

sortTasks();

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

function paintTasksPlanned() {
  refs.tasksBoxPlanned.innerHTML = planedTasks.map(createCards).join(" ");
}

function paintTasksCurrent() {
  refs.tasksBoxCurrent.innerHTML = currentTask.map(createCards).join(" ");
}

function go() {
  startCurrentTimer();
  startPlannedTimer();
}

if (currentTask.length >= 1) {
  startCurrentTimer();
}

if (planedTasks.length >= 1) {
  startPlannedTimer();
}

function startCurrentTimer() {
  paintTasksCurrent();
  [...refs.tasksBoxCurrent.children].forEach((el) => {
    let time = el.querySelector(".time").textContent;
    el.querySelector(".time").textContent = changeTime(time);
    el.dataset.timerId = setInterval(() => {
      console.log("startCurrentTimer");
      time = Number(time) + 1000;

      el.querySelector(".time").textContent = changeTime(time);
    }, 1000);
  });
}

function startPlannedTimer() {
  paintTasksPlanned();
  [...refs.tasksBoxPlanned.children].forEach((el) => {
    let time = el.querySelector(".time").textContent;
    el.querySelector(".time").textContent = changeTime(time);
    el.dataset.timerId = setInterval(() => {
      time -= 1000;
      console.log("startPlannedTimer");

      if (time <= 0) {
        clearInterval(el.dataset.timerId);
        clearIntervalByIdCurrent();
        clearIntervalByIdPlanned();
        sortTasks();
        go();
        return;
      }
      el.querySelector(".time").textContent = changeTime(time);
    }, 1000);
  });
}

function clearIntervalByIdPlanned() {
  [...refs.tasksBoxPlanned.children].forEach((el) => {
    clearInterval(el.dataset.timerId);
    console.log("я удалил интервал planned");
  });
}

function clearIntervalByIdCurrent() {
  [...refs.tasksBoxCurrent.children].forEach((el) => {
    clearInterval(el.dataset.timerId);
    console.log("я удалил интервал current");
  });
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
  clearIntervalByIdCurrent();
  clearIntervalByIdPlanned();
  go();
}

function onDeleteTaskOnPlanned(e) {
  if (!e.target.closest(".card__button")) {
    return;
  }

  for (let i = 0; i < tasks.length; i++) {
    if (
      tasks[i].id === Number(e.target.closest(".card").children[2].textContent)
    ) {
      tasks.splice(i, 1);

      localStorage.setItem("tasks", JSON.stringify(tasks));
      sortTasks();
      clearIntervalByIdPlanned();
      refs.tasksBoxPlanned.innerHTML = planedTasks.map(createCards).join(" ");

      startPlannedTimer();
      return;
    }
  }
}

function onDeleteTaskOnCurrent(e) {
  if (!e.target.closest(".card__button")) {
    return;
  }

  for (let i = 0; i < tasks.length; i++) {
    if (
      tasks[i].id === Number(e.target.closest(".card").children[2].textContent)
    ) {
      tasks.splice(i, 1);

      localStorage.setItem("tasks", JSON.stringify(tasks));
      sortTasks();
      clearIntervalByIdCurrent();
      refs.tasksBoxCurrent.innerHTML = currentTask.map(createCards).join(" ");

      startCurrentTimer();
      return;
    }
  }
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
      // time: Date.now() + 3600000,
      time: Date.now() + 4000,

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
  <div class="card">
    <p class="card__subtitle">${value.name}</p>
    <span class="time">${currentTime}</span>
    <span class="visually-hidden">${value.id}</span>
    <button type="button" class="card__button">
      <svg class="card__svg">
        <use href="./img/symbol-defs.svg#icon-x-close"></use>
      </svg>
    </button>
  </div>
  `;
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
