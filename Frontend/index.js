document.addEventListener("DOMContentLoaded", function () {
	// --- THIS IS THE KEY PART ---
	// 1. Check if the 'isLoggedIn' flag exists in localStorage.
	const userIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";

	// 2. If the user is NOT logged in, redirect them to the login page immediately.
	if (!userIsLoggedIn) {
		window.location.href = "loginPage.html";
		return; // Stop executing the rest of the script
	}

	// If the script reaches here, the user is logged in.
	// The rest of your dashboard functionality can run.
	console.log("User is authenticated. Welcome to the dashboard!");

	// --- LOGOUT FUNCTIONALITY ---
	const logoutButton = document.getElementById("logout-button");

	if (logoutButton) {
		logoutButton.addEventListener("click", function () {
			// 1. Remove the flag from localStorage
			localStorage.removeItem("isLoggedIn");

			// 2. Redirect back to the login page
			window.location.href = "loginPage.html";
		});
	}
});
