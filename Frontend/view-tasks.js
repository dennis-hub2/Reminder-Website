import { auth, db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", function () {
	const tasksList = document.getElementById("tasks-list");
	const logoutButton = document.getElementById("logout-button");
	const filterContainer = document.querySelector(".filter-container");

	let currentUserId = null;
	let currentFilter = "all"; // Default filter

	// --- AUTHENTICATION CHECK ---
	auth.onAuthStateChanged(user => {
		if (user) {
			currentUserId = user.uid;
			fetchAndDisplayTasks();
		} else {
			window.location.href = "loginPage.html";
		}
	});

	// --- LOGOUT FUNCTIONALITY ---
	if (logoutButton) {
		logoutButton.addEventListener("click", () => {
			auth.signOut().then(() => {
				window.location.href = "loginPage.html";
			});
		});
	}

	// --- FILTERING LOGIC ---
	if (filterContainer) {
		filterContainer.addEventListener("click", e => {
			if (e.target.classList.contains("filter-btn")) {
				// Update active button style
				filterContainer.querySelector(".active").classList.remove("active");
				e.target.classList.add("active");

				// Update filter and re-fetch tasks
				currentFilter = e.target.getAttribute("data-filter");
				fetchAndDisplayTasks();
			}
		});
	}

	// --- FETCH AND DISPLAY TASKS ---
	function fetchAndDisplayTasks() {
		if (!currentUserId) return;

		let query = db.collection("tasks").where("userId", "==", currentUserId);

		// Apply filter based on completion status
		if (currentFilter === "completed") {
			query = query.where("completed", "==", true);
		} else if (currentFilter === "incomplete") {
			query = query.where("completed", "==", false);
		}

		query = query.orderBy("createdAt", "desc");

		query.onSnapshot(
			querySnapshot => {
				tasksList.innerHTML = ""; // Clear existing list
				if (querySnapshot.empty) {
					tasksList.innerHTML = "<p>No tasks found for this filter.</p>";
					return;
				}

				querySnapshot.forEach(doc => {
					const task = doc.data();
					const taskId = doc.id;
					const card = document.createElement("div");
					card.classList.add("task-card");
					if (task.completed) {
						card.classList.add("completed");
					}
					card.setAttribute("data-id", taskId);

					card.innerHTML = `
                    <div class="task-content">
                        <input type="checkbox" id="task-${taskId}" ${task.completed ? "checked" : ""}>
                        <div class="task-details">
                            <p class="task-description">${task.description}</p>
                            <p class="task-meta">Category: ${task.category} | Priority: ${task.priority}</p>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
					tasksList.appendChild(card);
				});
			},
			error => {
				console.error("Error fetching tasks: ", error);
				tasksList.innerHTML = "<p>Could not load tasks.</p>";
			},
		);
	}

	// --- TASK ACTIONS (COMPLETE/DELETE) ---
	tasksList.addEventListener("click", e => {
		const card = e.target.closest(".task-card");
		if (!card) return;

		const taskId = card.getAttribute("data-id");

		// Handle checkbox change to update completion status
		if (e.target.type === "checkbox") {
			const isCompleted = e.target.checked;
			db.collection("tasks").doc(taskId).update({ completed: isCompleted });
		}

		// Handle delete button click
		if (e.target.classList.contains("delete-btn")) {
			db.collection("tasks").doc(taskId).delete();
		}
	});
});
