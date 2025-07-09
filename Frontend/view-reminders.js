import { auth, db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", function () {
	const remindersGrid = document.getElementById("reminders-grid");
	const logoutButton = document.getElementById("logout-button");

	// --- Edit Modal elements ---
	const editModal = document.getElementById("edit-reminder-modal");
	const editForm = document.getElementById("edit-reminder-form");
	const closeModalButton = document.querySelector(".close-button");

	// --- AUTHENTICATION CHECK ---
	auth.onAuthStateChanged(user => {
		if (user) {
			fetchAndDisplayReminders(user.uid);
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

	// --- FETCH AND DISPLAY REMINDERS ---
	function fetchAndDisplayReminders(userId) {
		db.collection("reminders")
			.where("userId", "==", userId)
			.orderBy("createdAt", "desc")
			.onSnapshot(
				querySnapshot => {
					remindersGrid.innerHTML = ""; // Clear existing list
					if (querySnapshot.empty) {
						remindersGrid.innerHTML = "<p>You have no reminders.</p>";
						return;
					}
					querySnapshot.forEach(doc => {
						const reminder = doc.data();
						const reminderId = doc.id;
						const card = document.createElement("div");
						card.classList.add("reminder-card");
						card.setAttribute("data-id", reminderId);

						// Using full notes here, not a snippet, for the detailed view
						const notes = reminder.notes || "No description provided.";

						card.innerHTML = `
                    <div>
                        <h4>${reminder.title}</h4>
                        <p>${notes}</p>
                    </div>
                    <div class="reminder-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
						remindersGrid.appendChild(card);
					});
				},
				error => {
					console.error("Error fetching reminders: ", error);
					remindersGrid.innerHTML = "<p>Could not load reminders.</p>";
				},
			);
	}

	// --- EDIT AND DELETE ACTIONS ---
	remindersGrid.addEventListener("click", e => {
		const card = e.target.closest(".reminder-card");
		if (!card) return;
		const reminderId = card.getAttribute("data-id");

		if (e.target.classList.contains("delete-btn")) {
			db.collection("reminders").doc(reminderId).delete();
		}
		if (e.target.classList.contains("edit-btn")) {
			openEditModal(reminderId);
		}
	});

	// --- EDIT MODAL LOGIC ---
	function openEditModal(reminderId) {
		const docRef = db.collection("reminders").doc(reminderId);
		docRef.get().then(doc => {
			if (doc.exists) {
				const data = doc.data();
				document.getElementById("edit-reminder-id").value = reminderId;
				document.getElementById("edit-reminder-title").value = data.title;
				document.getElementById("edit-reminder-notes").value = data.notes;
				document.getElementById("edit-reminder-date").value = data.date;
				document.getElementById("edit-reminder-time").value = data.time;
				document.getElementById("edit-reminder-priority").value = data.priority;
				document.getElementById("edit-reminder-category").value = data.category;
				editModal.style.display = "block";
			}
		});
	}

	if (closeModalButton) {
		closeModalButton.addEventListener("click", () => (editModal.style.display = "none"));
	}
	window.addEventListener("click", e => {
		if (e.target == editModal) {
			editModal.style.display = "none";
		}
	});

	if (editForm) {
		editForm.addEventListener("submit", e => {
			e.preventDefault();
			const reminderId = document.getElementById("edit-reminder-id").value;
			const updatedData = {
				title: document.getElementById("edit-reminder-title").value,
				notes: document.getElementById("edit-reminder-notes").value,
				date: document.getElementById("edit-reminder-date").value,
				time: document.getElementById("edit-reminder-time").value,
				priority: document.getElementById("edit-reminder-priority").value,
				category: document.getElementById("edit-reminder-category").value,
			};
			db.collection("reminders")
				.doc(reminderId)
				.update(updatedData)
				.then(() => {
					editModal.style.display = "none";
				});
		});
	}
});
