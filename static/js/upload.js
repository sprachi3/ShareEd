import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
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
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const uploadForm = document.querySelector("form");
const fileInput = document.getElementById("note-file");
const titleInput = document.getElementById("note-title");
const descriptionInput = document.getElementById("description");
const uploadButton = document.getElementById("uploadButton");

// Check authentication status before allowing file upload
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User logged in:", currentUser);
  } else {
    currentUser = null;
    console.log("No user logged in.");
  }
});

// Upload File Function
const uploadFile = async (file, userId) => {
  try {
    const fileRef = ref(storage, `notes/${userId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(fileRef);
    return fileURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Error uploading file!");
  }
};

// Save Note Metadata to Firestore
const saveNoteMetadata = async (title, description, fileURL, userId) => {
  try {
    const noteRef = collection(db, "notes");
    const docRef = await addDoc(noteRef, {
      title: title,
      description: description,
      fileURL: fileURL,
      userId: userId,
      timestamp: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error saving note metadata!");
  }
};

// Handle File Upload
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Check if the user is logged in
  if (!currentUser) {
    alert("You need to log in to upload files.");
    return;
  }

  const file = fileInput.files[0];
  const title = titleInput.value;
  const description = descriptionInput.value;

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const userId = currentUser.uid;
  const fileURL = await uploadFile(file, userId);

  if (fileURL) {
    console.log("File uploaded successfully!");
    console.log("File URL:", fileURL);
    alert("File uploaded successfully!");

    // Save metadata to Firestore
    await saveNoteMetadata(title, description, fileURL, userId);
  }
});
