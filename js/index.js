import Notiflix from "notiflix";

const refs = {
  // delete: document.querySelector(".modal__btn--delete"),
  // cancel: document.querySelector(".modal__btn--cancel"),
  tasksBoxPlanned: document.querySelector(".task__box--planned"),
  taskBoxCurrent: document.querySelector(".task__box--current"),
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
refs.tasksBoxPlanned.addEventListener("click", onDeleteTask);
// refs.cancel.addEventListener("click", (e) =>
//   e.currentTarget.closest(".backdrop").classList.add("hidden")
// );

let tasks = JSON.parse(localStorage.getItem("userTask"));

if (!tasks) {
  tasks = [];
} else {
  refs.tasksBoxPlanned.innerHTML = tasks.map(createCards).join(" ");
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
  refs.tasksBoxPlanned.innerHTML = tasks.map(createCards).join(" ");
}

function onDeleteTask(e) {
  if (!e.target.closest(".card__button")) {
    return;
  }

  for (let i = 0; i < tasks.length; i++) {
    if (
      tasks[i].name === e.target.closest(".card").children[0].textContent &&
      tasks[i].time ===
        Number(e.target.closest(".card").children[1].textContent)
    ) {
      tasks.splice(i, 1);
      localStorage.setItem("userTask", JSON.stringify(tasks));
      refs.tasksBoxPlanned.innerHTML = tasks.map(createCards).join(" ");
      return;
    }
  }
}

function sendDataOnLocalStorage(value) {
  tasks.push(...createData(value));

  tasks.sort((a, b) => a.time - b.time);
  localStorage.setItem("userTask", JSON.stringify(tasks));
}

function createData(value) {
  return [
    {
      name: value,
      time: 3600,
    },
    {
      name: value,
      time: 86400,
    },
    {
      name: value,
      time: 604800,
    },
    {
      name: value,
      time: 2592000,
    },
  ];
}

function createCards(value) {
  return `
  <div class="card">
    <p class="card__subtitle">${value.name}</p>
    <span class="time">${value.time}</span>
    <button type="button" class="card__button">
      <svg class="card__svg">
        <use href="./img/symbol-defs.svg#icon-x-close"></use>
      </svg>
    </button>
  </div>
  `;
}
