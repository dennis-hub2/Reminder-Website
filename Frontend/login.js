document.addEventListener("DOMContentLoaded", function () {
	const authForm = document.getElementById("auth-form");
	const toggleAuthLink = document.getElementById("toggle-auth");
	const loginBox = document.querySelector(".login-box");
	const h2 = loginBox.querySelector("h2");
	const authButton = authForm.querySelector(".auth-button");
	const confirmPasswordGroup = document.getElementById("confirm-password-group");

	let isLogin = true;

	// Function to toggle between Login and Sign Up views
	function toggleAuthMode(event) {
		event.preventDefault(); // Prevent default link behavior
		isLogin = !isLogin;

		h2.textContent = isLogin ? "Login" : "Sign Up";
		authButton.textContent = isLogin ? "Login" : "Sign Up";

		// Update the toggle link text
		const span = toggleAuthLink.querySelector("span");
		if (isLogin) {
			toggleAuthLink.firstChild.textContent = "Don't have an account? ";
			span.textContent = "Sign Up";
		} else {
			toggleAuthLink.firstChild.textContent = "Already have an account? ";
			span.textContent = "Login";
		}

		// Show or hide the confirm password field
		confirmPasswordGroup.style.display = isLogin ? "none" : "block";
	}

	// Attach event listener to the parent <p> tag
	toggleAuthLink.addEventListener("click", toggleAuthMode);

	// Handle form submission
	authForm.addEventListener("submit", function (e) {
		e.preventDefault();

		// --- THIS IS THE KEY PART ---
		// 1. Simulate a successful authentication
		console.log("Authentication successful!");

		// 2. Set a flag in localStorage to remember the user is logged in
		localStorage.setItem("isLoggedIn", "true");

		// 3. Redirect to the main application page
		window.location.href = "index.html";
	});
});
