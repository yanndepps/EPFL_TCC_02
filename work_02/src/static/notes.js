// ——————————————————————————————————————————————————
// init references
// ——————————————————————————————————————————————————
const newTaskInput = document.querySelector("#new-task input");
const tasksDiv = document.querySelector("#tasks");
let deleteTasks, editTasks, tasks;
let updateNote;
let count;

// ——————————————————————————————————————————————————
// on window load
// ——————————————————————————————————————————————————
// event triggered when window load
// init `updateNote` to an empty string
// set `count` to the num of keys in `localStorage`
// call `displayTasks` fn to display the tasks
window.onload = () => {
	updateNote = "";
	count = Object.keys(localStorage).length;
	displayTasks();
};

// ——————————————————————————————————————————————————
// display tasks fn
// ——————————————————————————————————————————————————
// check if there are any tasks in `localStorage`
// if `tasks` -> set the `taskDiv` display to `inline-block`
// if `!tasks` -> set the `taskDiv` to `none`
// clear the `taskDiv` innerHTML to rm any previous tasks
// fetch all keys from `localStorage`, sort them & iterate through them
// for each key -> create a new `div` el with the class `task` & set
// its innerHTML to the task name. add an edit btn and a delete btn to the
// task el.
// if the task is marked as completed ( value in `localStorage` is `true` ) ->
// set the edit btn visibility to `hidden`, add the class `completed` to the el.
// append the task el to `taskDiv`
// select all task el & iterate through them to apply additional logic
const displayTasks = () => {
	if (Object.keys(localStorage).length > 0) {
		tasksDiv.style.display = "inline-block";
	} else {
		tasksDiv.style.display = "none";
	}

	// clear the tasks
	tasksDiv.innerHTML = "";

	// fetch all keys in lS
	let tasks = Object.keys(localStorage);
	tasks = tasks.sort();

	for (let key of tasks) {
		// get all values
		let value = localStorage.getItem(key);
		let taskInnerDiv = document.createElement("div");
		taskInnerDiv.classList.add("task");
		taskInnerDiv.setAttribute("id", key);
		taskInnerDiv.innerHTML = `<span id="taskname">${key.split("_")[1]}</span>`;

		// parse string <-> boolean
		let editBtn = document.createElement("button");
		editBtn.classList.add("edit");
		editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
		if (!JSON.parse(value)) {
			editBtn.style.visibility = "visible";
		} else {
			editBtn.style.visibility = "hidden";
			taskInnerDiv.classList.add("completed");
		}
		taskInnerDiv.appendChild(editBtn);
		taskInnerDiv.innerHTML += `<button class="delete"><i class="fa-solid fa-trash"></button>`;
		tasksDiv.appendChild(taskInnerDiv);
	}

	// ——————————————————————————————————————————————————
	// tasks completed
	// ——————————————————————————————————————————————————
	// select all el with class `task`
	// loop over the NodeList and add the event listener
	// to each element. upd bool value.
	tasks = document.querySelectorAll(".task");
	const taskArray = [...tasks];
	taskArray.forEach((element) => {
		element.onclick = () => {
			// lS update
			if (element.classList.contains("completed")) {
				updateStorage(element.id.split("_")[0], element.innerText, false);
			} else {
				updateStorage(element.id.split("_")[0], element.innerText, true);
			}
		};
	});

	// ——————————————————————————————————————————————————
	// edit tasks
	// ——————————————————————————————————————————————————
	// get all el with class `edit` and convert the resulting
	// HTMLCollection to an array using `Array.from()`
	// loop through each el in the array and add `click` event listener
	editTasks = document.getElementsByClassName("edit");
	Array.from(editTasks).forEach((element) => {
		element.addEventListener("click", (e) => {
			// prevent the event from being propagated to parents el
			e.stopPropagation();
			// disable other btns when one task is edited
			disableBtn(true);
			// upd the `newTaskInput` value with the task name by selecting
			// `#taskname` el within the parent el and getting its inner txt.
			let parent = element.parentElement;
			newTaskInput.value = parent.querySelector("#taskname").innerText;
			// set `updateNote` to the task's ID which is stored in the parent
			// element's `id` attribute
			updateNote = parent.id;
			// rm task from DOM by calling `remove`
			parent.remove();
		});
	});

	// ——————————————————————————————————————————————————
	// delete tasks
	// ——————————————————————————————————————————————————
	// proceed with the rm of the tasks
	deleteTasks = document.getElementsByClassName("delete");
	Array.from(deleteTasks).forEach((element) => {
		element.addEventListener("click", (e) => {
			e.stopPropagation();
			// delete from lS & rm div
			let parent = element.parentElement;
			// call rm task fn
			rmTask(parent.id);
			parent.remove();
			count -= 1;
		});
	});
}

// ——————————————————————————————————————————————————
// disable edit btn
// ——————————————————————————————————————————————————
// enable/disable btn if task is edited or completed
const disableBtn = (bool) => {
	let editBtns = document.getElementsByClassName("edit");
	Array.from(editBtns).forEach((element) => {
		element.disabled = bool;
	});
};

// ——————————————————————————————————————————————————
// rm tasks from lS
// ——————————————————————————————————————————————————
const rmTask = (taskValue) => {
	localStorage.removeItem(taskValue);
	displayTasks();
};

// ——————————————————————————————————————————————————
// add tasks to lS
// ——————————————————————————————————————————————————
const updateStorage = (index, taskValue, completed) => {
	localStorage.setItem(`${index}_${taskValue}`, completed);
	displayTasks();
};

// ——————————————————————————————————————————————————
// add new task
// ——————————————————————————————————————————————————
// check if user has entered a value in the input field
// proceed to create or update task in localStorage
document.querySelector("#push").addEventListener("click", () => {
	// enable edit btn
	disableBtn(false);
	// check input value for its length
	if (newTaskInput.value.length == 0) {
		// remaind the usr to enter a task if length is 0
		alert("please enter a task!");
		// if length != 0 -> proceed to either create or update task
	} else {
		// if `updateNote` is an empty str, this means a new task should be created
		if (updateNote == "") {
			// the `updateStorage` fn is called with the current `conut` input value
			// `completed` boolean flag set to `false`
			updateStorage(count, newTaskInput.value, false);
		} else {
			// if `updateNote` is not empty, this means an existing task shoudl be
			// updated -> extract the existing task's count, rm the task using `rmTask` fn,
			// call the `updateStorage` fn with extracted count, input value and
			// `completed` boolean flag set to `false`
			let existingCount = updateNote.split("_")[0];
			rmTask(updateNote);
			updateStorage(existingCount, newTaskInput.value, false);
			// after upd the task -> reset `updateNote` to an empty str
			updateNote = "";
		}
		// upd the `count` var by 1 and clear the input field
		count += 1;
		newTaskInput.value = "";
	}
});

// ——————————————————————————————————————————————————
