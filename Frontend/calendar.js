import { auth, db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", function () {
	const calendar = document.getElementById("calendar");
	const monthDisplay = document.getElementById("monthDisplay");
	const backButton = document.getElementById("backButton");
	const nextButton = document.getElementById("nextButton");
	const logoutButton = document.getElementById("logout-button");
	const reminderDetailsList = document.getElementById("reminder-details-list");

	let nav = 0; // To navigate between months
	let reminderDates = new Set(); // To store dates with reminders

	// --- AUTHENTICATION CHECK ---
	auth.onAuthStateChanged(user => {
		if (user) {
			loadCalendar(user.uid);
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

	// --- FETCH DATES WITH REMINDERS ---
	async function fetchReminderDates(userId) {
		reminderDates.clear();
		try {
			const querySnapshot = await db.collection("reminders").where("userId", "==", userId).get();
			querySnapshot.forEach(doc => {
				// The date is stored as YYYY-MM-DD in Firestore
				if (doc.data().date) {
					reminderDates.add(doc.data().date);
				}
			});
		} catch (error) {
			console.error("Error fetching reminder dates: ", error);
		}
	}

	// --- RENDER CALENDAR ---
	function renderCalendar() {
		const dt = new Date();

		if (nav !== 0) {
			dt.setMonth(new Date().getMonth() + nav);
		}

		const day = dt.getDate();
		const month = dt.getMonth();
		const year = dt.getFullYear();

		const firstDayOfMonth = new Date(year, month, 1);
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const dateString = firstDayOfMonth.toLocaleDateString("en-us", {
			weekday: "long",
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
		const paddingDays = new Date(year, month, 0).getDay();

		monthDisplay.innerText = `${dt.toLocaleDateString("en-us", { month: "long" })} ${year}`;
		calendar.innerHTML = "";

		for (let i = 0; i <= paddingDays; i++) {
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

			daySquare.addEventListener("click", () => showRemindersForDate(dateStr));
			calendar.appendChild(daySquare);
		}
	}

	// --- SHOW REMINDERS FOR A SPECIFIC DATE ---
	async function showRemindersForDate(dateString) {
		reminderDetailsList.innerHTML = "Loading...";
		const userId = auth.currentUser.uid;
		if (!userId) return;

		try {
			const querySnapshot = await db.collection("reminders").where("userId", "==", userId).where("date", "==", dateString).get();

			reminderDetailsList.innerHTML = "";
			if (querySnapshot.empty) {
				reminderDetailsList.innerHTML = "<p>No reminders for this date.</p>";
			} else {
				querySnapshot.forEach(doc => {
					const reminder = doc.data();
					const item = document.createElement("div");
					item.classList.add("reminder-item");
					item.innerHTML = `<h4>${reminder.title}</h4><p>${reminder.notes || ""}</p><p>Time: ${reminder.time}</p>`;
					reminderDetailsList.appendChild(item);
				});
			}
		} catch (error) {
			console.error("Error fetching reminders for date:", error);
			reminderDetailsList.innerHTML = "<p>Could not load reminders.</p>";
		}
	}

	// --- INITIALIZE AND BIND EVENTS ---
	async function loadCalendar(userId) {
		await fetchReminderDates(userId);
		renderCalendar();
	}

	function initButtons() {
		backButton.addEventListener("click", () => {
			nav--;
			loadCalendar(auth.currentUser.uid);
		});

		nextButton.addEventListener("click", () => {
			nav++;
			loadCalendar(auth.currentUser.uid);
		});
	}

	initButtons();
});
