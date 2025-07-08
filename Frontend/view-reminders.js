import { auth, db } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", function () {
    const remindersGrid = document.getElementById('reminders-grid');
    const logoutButton = document.getElementById('logout-button');

    // --- AUTHENTICATION CHECK ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, fetch their reminders.
            fetchAndDisplayReminders(user.uid);
        } else {
            // No user is signed in, redirect to the login page.
            window.location.href = 'loginPage.html';
        }
    });

    // --- LOGOUT FUNCTIONALITY ---
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'loginPage.html';
            }).catch(error => {
                console.error('Logout error:', error);
            });
        });
    }

    // --- FETCH AND DISPLAY REMINDERS ---
    async function fetchAndDisplayReminders(userId) {
        if (!remindersGrid) return;

        remindersGrid.innerHTML = ''; // Clear any existing content

        try {
            const querySnapshot = await db.collection('reminders')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            if (querySnapshot.empty) {
                remindersGrid.innerHTML = '<p>You have no reminders.</p>';
                return;
            }

            querySnapshot.forEach(doc => {
                const reminder = doc.data();
                const reminderId = doc.id;

                const card = document.createElement('div');
                card.classList.add('reminder-card');
                card.setAttribute('data-id', reminderId);

                // Create a short snippet of the notes
                const notesSnippet = reminder.notes && reminder.notes.length > 100 
                    ? `${reminder.notes.substring(0, 100)}...` 
                    : reminder.notes || 'No description.';

                // Updated card HTML to show only title and notes snippet
                card.innerHTML = `
                    <div>
                        <h4>${reminder.title}</h4>
                        <p>${notesSnippet}</p>
                    </div>
                    <div class="reminder-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
                remindersGrid.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching reminders: ", error);
            remindersGrid.innerHTML = '<p>Could not load reminders.</p>';
        }
    }
});
