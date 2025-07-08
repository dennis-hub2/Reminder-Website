import { auth, db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", function () {
	// --- Main page elements ---
	const logoutButton = document.getElementById("logout-button");
	const addReminderForm = document.getElementById("add-reminder-form");
	const remindersList = document.querySelector(".reminders-list");

	// --- Calendar elements ---
	const calendar = document.getElementById("calendar");
	const monthDisplay = document.getElementById("monthDisplay");
	const backButton = document.getElementById("backButton");
	const nextButton = document.getElementById("nextButton");
	let nav = 0; // To navigate between months
	let reminderDates = new Set(); // To store dates with reminders

	// --- Edit Modal elements ---
	const editModal = document.getElementById("edit-reminder-modal");
	const editForm = document.getElementById("edit-reminder-form");
	const closeModalButton = document.querySelector(".close-button");

	// --- AUTHENTICATION ---
	auth.onAuthStateChanged(user => {
		if (user) {
			console.log("User is authenticated. Welcome to the dashboard!", user.uid);
			loadDashboard(user.uid);
			initButtons(user.uid);
		} else {
			window.location.href = "loginPage.html";
		}
	});

	// --- INITIALIZE DASHBOARD ---
	async function loadDashboard(userId) {
		await fetchReminderDates(userId);
		renderCalendar();
		fetchAndRenderReminders(userId);
	}

	// --- CALENDAR LOGIC ---
	async function fetchReminderDates(userId) {
		reminderDates.clear();
		try {
			const querySnapshot = await db.collection("reminders").where("userId", "==", userId).get();
			querySnapshot.forEach(doc => {
				if (doc.data().date) {
					reminderDates.add(doc.data().date);
				}
			});
		} catch (error) {
			console.error("Error fetching reminder dates: ", error);
		}
	}

	function renderCalendar() {
		const dt = new Date();
		if (nav !== 0) {
			dt.setMonth(new Date().getMonth() + nav);
		}
		const day = dt.getDate();
		const month = dt.getMonth();
		const year = dt.getFullYear();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const paddingDays = new Date(year, month, 1).getDay();

		monthDisplay.innerText = `${dt.toLocaleDateString("en-us", { month: "long" })} ${year}`;
		calendar.innerHTML = "";

		for (let i = 1; i <= paddingDays; i++) {
			const daySquare = document.createElement("div");
			daySquare.classList.add("day", "padding");
			calendar.appendChild(daySquare);
		}

		for (let i = 1; i <= daysInMonth; i++) {
			const daySquare = document.createElement("div");
			daySquare.classList.add("day");
			daySquare.innerText = i;
			const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

			if (i === day && nav === 0) {
				daySquare.classList.add("current-day");
			}
			if (reminderDates.has(dateStr)) {
				daySquare.classList.add("reminder-day");
			}
			daySquare.addEventListener("click", () => fetchAndRenderReminders(auth.currentUser.uid, dateStr));
			calendar.appendChild(daySquare);
		}
	}

	function initButtons(userId) {
		backButton.addEventListener("click", () => {
			nav--;
			loadDashboard(userId);
		});
		nextButton.addEventListener("click", () => {
			nav++;
			loadDashboard(userId);
		});
	}

	// --- REMINDER LIST LOGIC ---
	function fetchAndRenderReminders(userId, forDate = null) {
		let query = db.collection("reminders").where("userId", "==", userId);

		if (forDate) {
			query = query.where("date", "==", forDate);
		} else {
			query = query.orderBy("createdAt", "desc");
		}

		query.onSnapshot(
			querySnapshot => {
				remindersList.innerHTML = "";
				if (querySnapshot.empty) {
					remindersList.innerHTML = `<p>No reminders ${forDate ? `for ${forDate}` : "found"}.</p>`;
					return;
				}
				querySnapshot.forEach(doc => {
					const reminder = doc.data();
					const reminderId = doc.id;
					const reminderEl = document.createElement("div");
					reminderEl.classList.add("reminder-item");
					reminderEl.setAttribute("data-id", reminderId);
					const notesSnippet =
						reminder.notes && reminder.notes.length > 50 ? `${reminder.notes.substring(0, 50)}...` : reminder.notes || "No description.";
					reminderEl.innerHTML = `
                    <div class="reminder-content">
                        <h4>${reminder.title}</h4>
                        <p>${notesSnippet}</p>
                    </div>
                    <div class="reminder-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
					remindersList.appendChild(reminderEl);
				});
			},
			error => {
				console.error("Error fetching reminders: ", error);
			},
		);
	}

	// --- OTHER FUNCTIONALITY (Logout, Add, Edit, Delete) ---
	if (logoutButton) {
		logoutButton.addEventListener("click", () => auth.signOut().then(() => (window.location.href = "loginPage.html")));
	}

	if (addReminderForm) {
		addReminderForm.addEventListener("submit", e => {
			e.preventDefault();
			const user = auth.currentUser;
			if (user) {
				db.collection("reminders")
					.add({
						title: document.getElementById("reminder-title").value,
						notes: document.getElementById("reminder-notes").value,
						date: document.getElementById("reminder-date").value,
						time: document.getElementById("reminder-time").value,
						priority: document.getElementById("reminder-priority").value,
						category: document.getElementById("reminder-category").value,
						userId: user.uid,
						createdAt: firebase.firestore.FieldValue.serverTimestamp(),
					})
					.then(() => {
						addReminderForm.reset();
						loadDashboard(user.uid); // Reload dashboard to show new reminder on calendar
					})
					.catch(error => console.error("Error adding document: ", error));
			}
		});
	}

	remindersList.addEventListener("click", e => {
		const reminderItem = e.target.closest(".reminder-item");
		if (!reminderItem) return;
		const reminderId = reminderItem.getAttribute("data-id");
		if (e.target.classList.contains("delete-btn")) {
			db.collection("reminders")
				.doc(reminderId)
				.delete()
				.then(() => loadDashboard(auth.currentUser.uid));
		}
		if (e.target.classList.contains("edit-btn")) {
			openEditModal(reminderId);
		}
	});

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

	closeModalButton.addEventListener("click", () => (editModal.style.display = "none"));
	window.addEventListener("click", e => {
		if (e.target == editModal) {
			editModal.style.display = "none";
		}
	});

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
				loadDashboard(auth.currentUser.uid);
			});
	});
});
