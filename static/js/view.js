import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwc8ENDzId65R0bO0bqWrTd8JdZcjdKSk",
  authDomain: "shareed-b9ed4.firebaseapp.com",
  projectId: "shareed-b9ed4",
  storageBucket: "shareed-b9ed4.firebasestorage.app",
  messagingSenderId: "953135288757",
  appId: "1:953135288757:web:ed0d44601fc137c4d309fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchClearButton = document.getElementById("search-clear-button");
const availableNotesList = document.getElementById("availableNotesList");
const uploadedNotesList = document.getElementById("uploadedNotesList");

// Fetch Notes from Firestore
const fetchNotes = async () => {
  try {
    const notesCollection = collection(db, "notes");
    const notesQuery = query(notesCollection, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(notesQuery);

    const notes = [];
    querySnapshot.forEach((doc) => {
      const note = doc.data();
      console.log("Fetched Note:", note);  // Debugging output to check the notes data
      notes.push(note);
    });

    // If notes are fetched successfully, display them
    if (notes.length > 0) {
      displayNotes(notes);
    } else {
      availableNotesList.innerHTML = "<li>No notes available</li>";
    }

  } catch (error) {
    console.error("Error fetching notes:", error);
    alert("Error fetching notes!");
  }
};

// Display Notes
const displayNotes = (notes) => {
  availableNotesList.innerHTML = ""; // Clear existing notes

  if (notes.length === 0) {
    availableNotesList.innerHTML = "<li>No notes found</li>";
    return;
  }

  notes.forEach((note) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.description}</p>
      <a href="${note.fileURL}" target="_blank">Download Note</a>
      <hr>
    `;
    availableNotesList.appendChild(listItem);
  });
};

// Fetch Uploaded Notes (for logged-in user)
const fetchUploadedNotes = async (userId) => {
  try {
    console.log("Fetching uploaded notes for userId:", userId); // Debugging userId
    const notesCollection = collection(db, "notes");
    const notesQuery = query(notesCollection, where("userId", "==", userId), orderBy("timestamp", "desc"));
    console.log("Firestore query for uploaded notes:", notesQuery); // Debugging Firestore query
    const querySnapshot = await getDocs(notesQuery);

    const notes = [];
    querySnapshot.forEach((doc) => {
      const note = doc.data();
      notes.push(note);
    });

    // If notes are fetched successfully, display them
    if (notes.length > 0) {
      displayUploadedNotes(notes);
    } else {
      uploadedNotesList.innerHTML = "<li>You haven't uploaded any notes yet.</li>";
    }

  } catch (error) {
    console.error("Error fetching uploaded notes:", error);
    alert("Error fetching uploaded notes!");
  }
};

// Display Uploaded Notes
const displayUploadedNotes = (notes) => {
  uploadedNotesList.innerHTML = ""; // Clear existing uploaded notes

  if (notes.length === 0) {
    uploadedNotesList.innerHTML = "<li>No notes uploaded yet.</li>";
    return;
  }

  notes.forEach((note) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.description}</p>
      <a href="${note.fileURL}" target="_blank">Download Note</a>
      <hr>
    `;
    uploadedNotesList.appendChild(listItem);
  });
};

// Search Notes
const searchNotes = async (searchTerm) => {
  try {
    console.log("Searching for notes with term:", searchTerm); // Debugging search term
    const notesCollection = collection(db, "notes");
    const notesQuery = query(
      notesCollection,
      orderBy("title"),
      orderBy("timestamp", "desc"), // Adding orderBy for timestamp after title
      //where("title", ">=", searchTerm),
      //where("title", "<=", searchTerm + "\uf8ff")
    );
    console.log("Firestore query for search:", notesQuery); // Debugging Firestore query
    const querySnapshot = await getDocs(notesQuery);

    /*const notes = [];
    querySnapshot.forEach((doc) => {
      const note = doc.data();
      notes.push(note);
    });

    displayNotes(notes);
  } catch (error) {
    console.error("Error searching notes:", error);
    alert("Error searching notes!");
  }
};*/
const notes = [];
    querySnapshot.forEach((doc) => {
      const note = doc.data();
      const normalizedTitle = note.title.toLowerCase(); // Normalize title to lower case
      const normalizedSearchTerm = searchTerm.toLowerCase();

      // Check if the normalized title matches the search term
      if (normalizedTitle.includes(normalizedSearchTerm)) {
        notes.push(note);
      }
    });

    console.log("Filtered search notes:", notes); // Debugging the filtered notes

    displayNotes(notes);
  } catch (error) {
    console.error("Error searching notes:", error);
    alert("Error searching notes!");
  }
};

// Event Listeners
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    searchNotes(searchTerm);
  } else {
    fetchNotes();
  }
});

searchClearButton.addEventListener("click", () => {
  searchInput.value = "";
  fetchNotes();
});

// Initial Fetch for Notes and User Info
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    fetchUploadedNotes(userId); // Fetch uploaded notes for the logged-in user
  } else {
    alert("You need to log in to see your uploaded notes.");
  }
});

// Fetch available notes
fetchNotes();
