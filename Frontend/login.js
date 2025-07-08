import { auth } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", function () {
	const authForm = document.getElementById("auth-form");
	const toggleAuthLink = document.getElementById("toggle-auth");
	const loginBox = document.querySelector(".login-box");
	const h2 = loginBox.querySelector("h2");
	const authButton = authForm.querySelector(".auth-button");
	const confirmPasswordGroup = document.getElementById("confirm-password-group");
	const googleButton = document.querySelector(".google-button");
	const outlookButton = document.querySelector(".outlook-button");

	let isLogin = true;

	// Function to toggle between Login and Sign Up views
	function toggleAuthMode(event) {
		event.preventDefault(); // Prevent default link behavior
		isLogin = !isLogin;

		h2.textContent = isLogin ? "Login" : "Sign Up";
		authButton.textContent = isLogin ? "Login" : "Sign Up";

		const span = toggleAuthLink.querySelector("span");
		if (isLogin) {
			toggleAuthLink.firstChild.textContent = "Don't have an account? ";
			span.textContent = "Sign Up";
		} else {
			toggleAuthLink.firstChild.textContent = "Already have an account? ";
			span.textContent = "Login";
		}

		confirmPasswordGroup.style.display = isLogin ? "none" : "block";
	}

	toggleAuthLink.addEventListener("click", toggleAuthMode);

	// Handle form submission for email/password
	authForm.addEventListener("submit", function (e) {
		e.preventDefault();
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		if (isLogin) {
			// Login user
			auth
				.signInWithEmailAndPassword(email, password)
				.then(userCredential => {
					window.location.href = "index.html";
				})
				.catch(error => {
					alert(error.message);
				});
		} else {
			// Sign up user
			const confirmPassword = document.getElementById("confirm-password").value;
			if (password !== confirmPassword) {
				alert("Passwords do not match.");
				return;
			}
			auth
				.createUserWithEmailAndPassword(email, password)
				.then(userCredential => {
					window.location.href = "index.html";
				})
				.catch(error => {
					alert(error.message);
				});
		}
	});

	// Handle Google Sign-In
	googleButton.addEventListener("click", () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth
			.signInWithPopup(provider)
			.then(result => {
				window.location.href = "index.html";
			})
			.catch(error => {
				alert(error.message);
			});
	});

	// Handle Outlook/Microsoft Sign-In
	outlookButton.addEventListener("click", () => {
		const provider = new firebase.auth.OAuthProvider("microsoft.com");
		auth
			.signInWithPopup(provider)
			.then(result => {
				window.location.href = "index.html";
			})
			.catch(error => {
				alert(error.message);
			});
	});
});
