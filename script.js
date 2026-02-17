let workouts = JSON.parse(localStorage.getItem("armforce_workouts")) || [];

// Элементы
const screens = {
  main: document.getElementById("mainScreen"),
  workout: document.getElementById("workoutScreen"),
  history: document.getElementById("historyScreen"),
  viewWorkout: document.getElementById("viewWorkoutScreen"),
};

// Инициализация
function init() {
  // Главный экран
  document
    .getElementById("startWorkoutBtn")
    .addEventListener("click", startNewWorkout);
  document
    .getElementById("viewHistoryBtn")
    .addEventListener("click", showHistory);

  // Кнопки назад
  document
    .getElementById("backToMainBtn")
    .addEventListener("click", () => showScreen("main"));
  document
    .getElementById("backFromHistoryBtn")
    .addEventListener("click", () => showScreen("main"));
  document
    .getElementById("backFromViewBtn")
    .addEventListener("click", () => showScreen("history"));

  // Форма
  document
    .getElementById("addExerciseBtn")
    .addEventListener("click", addExercise);
  document
    .getElementById("saveWorkoutBtn")
    .addEventListener("click", saveWorkout);
}

// Показать экран
function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[screenName].classList.add("active");
}

// Начать новую тренировку
function startNewWorkout() {
  const form = document.getElementById("workoutForm");
  form.innerHTML = "";
  addExercise();
  showScreen("workout");
}

// Добавить упражнение
function addExercise() {
  const form = document.getElementById("workoutForm");
  const exerciseTemplate = document.getElementById("exerciseTemplate");
  const exerciseClone = exerciseTemplate.content.cloneNode(true);

  const exerciseBlock = exerciseClone.querySelector(".exercise-block");
  const setsContainer = exerciseBlock.querySelector(".sets-container");

  // Добавляем 2 подхода
  for (let i = 1; i <= 2; i++) {
    addSetToContainer(setsContainer, i);
  }

  // Добавляем кнопку для добавления подходов
  const addSetBtn = document.createElement("button");
  addSetBtn.className = "add-set-btn";
  addSetBtn.textContent = "+ Добавить подход";
  addSetBtn.addEventListener("click", function () {
    const currentSets = setsContainer.querySelectorAll(".set-row").length;
    addSetToContainer(setsContainer, currentSets + 1);
    updateSetNumbers(setsContainer);
  });

  // Добавляем кнопку под контейнером подходов
  exerciseBlock.appendChild(addSetBtn);

  // Удаление упражнения (только если это не первое упражнение)
  const removeBtn = exerciseBlock.querySelector(".remove-exercise");
  removeBtn.addEventListener("click", function () {
    if (form.children.length > 1) {
      exerciseBlock.remove();
    }
  });

  // Убираем крестик у первого упражнения
  if (form.children.length === 0) {
    removeBtn.style.display = "none";
  }

  form.appendChild(exerciseBlock);
}

// Добавить подход в контейнер
function addSetToContainer(container, setNumber) {
  const setTemplate = document.getElementById("setTemplate");
  const setClone = setTemplate.content.cloneNode(true);
  const setRow = setClone.querySelector(".set-row");

  setRow.querySelector(".set-number").textContent = `Подход ${setNumber}`;

  // Добавляем кнопку удаления подхода
  const removeSetBtn = document.createElement("button");
  removeSetBtn.className = "remove-set-btn";
  removeSetBtn.textContent = "×";
  removeSetBtn.title = "Удалить подход";
  removeSetBtn.addEventListener("click", function () {
    if (container.querySelectorAll(".set-row").length > 1) {
      setRow.remove();
      updateSetNumbers(container);
    }
  });

  setRow.appendChild(removeSetBtn);
  container.appendChild(setRow);
}

// Обновить номера подходов
function updateSetNumbers(container) {
  const sets = container.querySelectorAll(".set-row");
  sets.forEach((set, index) => {
    set.querySelector(".set-number").textContent = `Подход ${index + 1}`;
  });
}

// Сохранить тренировку
function saveWorkout() {
  const exerciseBlocks = document.querySelectorAll(".exercise-block");
  const exercises = [];

  exerciseBlocks.forEach((block) => {
    const name = block.querySelector(".exercise-name").value.trim();
    if (!name) return;

    const sets = [];
    const setRows = block.querySelectorAll(".set-row");

    setRows.forEach((row, index) => {
      const reps = row.querySelector(".reps-input").value;
      const weight = row.querySelector(".weight-input").value;

      if (reps && weight) {
        sets.push({
          set: index + 1,
          reps: parseInt(reps),
          weight: parseInt(weight),
        });
      }
    });

    if (sets.length > 0) {
      exercises.push({
        name: name,
        sets: sets,
      });
    }
  });

  if (exercises.length === 0) {
    alert("Добавьте хотя бы одно упражнение");
    return;
  }

  const workout = {
    id: Date.now(),
    date: new Date().toLocaleDateString("ru-RU"),
    timestamp: new Date().toISOString(),
    exercises: exercises,
  };

  workouts.push(workout);
  localStorage.setItem("armforce_workouts", JSON.stringify(workouts));

  alert("Тренировка сохранена!");
  showScreen("main");
}

// Показать историю
function showHistory() {
  const historyList = document.getElementById("historyList");

  if (workouts.length === 0) {
    historyList.innerHTML =
      '<div class="empty-history">История тренировок пуста</div>';
  } else {
    let html = "";

    [...workouts].reverse().forEach((workout) => {
      const exerciseNames = workout.exercises.map((ex) => ex.name).join(", ");
      html += `
        <div class="history-item">
          <div class="history-item-content" onclick="showWorkoutDetails(${workout.id})">
            <div class="history-date">${workout.date}</div>
            <div class="history-exercises">${exerciseNames || "Без названия"}</div>
          </div>
          <div class="history-actions">
            <button class="edit-workout-btn" onclick="editWorkout(${workout.id})" title="Редактировать">✎</button>
            <button class="delete-workout-btn" onclick="deleteWorkout(${workout.id})" title="Удалить тренировку">×</button>
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;
  }

  showScreen("history");
}

// Показать детали тренировки
function showWorkoutDetails(id) {
  const workout = workouts.find((w) => w.id === id);
  if (!workout) return;

  const workoutDetails = document.getElementById("workoutDetails");
  let html = `<div class="workout-details-header">
                <div class="workout-date">${workout.date}</div>
              </div>`;

  workout.exercises.forEach((exercise) => {
    html += `<div class="workout-exercise">
                <div class="workout-exercise-name">${exercise.name}</div>
                <div class="workout-sets">`;

    exercise.sets.forEach((set) => {
      html += `<div class="workout-set">
                  <div class="set-info">
                    <span class="set-number">Подход ${set.set}</span>
                    <span class="set-data">${set.weight} кг × ${set.reps} повт.</span>
                  </div>
                </div>`;
    });

    html += `</div></div>`;
  });

  workoutDetails.innerHTML = html;
  showScreen("viewWorkout");
}

// Редактировать тренировку
function editWorkout(id) {
  const workout = workouts.find(w => w.id === id);
  if (!workout) return;

  startNewWorkout();

  const exerciseBlocks = document.querySelectorAll('.exercise-block');
  exerciseBlocks.forEach(block => block.remove());

  workout.exercises.forEach(exercise => {
    addExercise();

    const lastBlock = document.querySelector('.exercise-block:last-child');
    const nameInput = lastBlock.querySelector('.exercise-name');
    const setsContainer = lastBlock.querySelector('.sets-container');

    nameInput.value = exercise.name;
    setsContainer.innerHTML = '';

    exercise.sets.forEach((set, index) => {
      addSetToContainer(setsContainer, index + 1);
      const setRows = setsContainer.querySelectorAll('.set-row');
      const lastSet = setRows[setRows.length - 1];
      
      const repsInput = lastSet.querySelector('.reps-input');
      const weightInput = lastSet.querySelector('.weight-input');
      
      repsInput.value = set.reps;
      weightInput.value = set.weight;
    });

    const removeBtn = lastBlock.querySelector('.remove-exercise');
    if (workout.exercises.length === 1) {
      removeBtn.style.display = 'none';
    }
  });

  showScreen('workout');
}

// Удалить тренировку
function deleteWorkout(id) {
  if (confirm("Удалить эту тренировку?")) {
    workouts = workouts.filter((w) => w.id !== id);
    localStorage.setItem("armforce_workouts", JSON.stringify(workouts));
    showHistory();
  }
}

// Запуск
document.addEventListener("DOMContentLoaded", init);
