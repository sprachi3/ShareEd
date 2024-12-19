import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwc8ENDzId65R0bO0bqWrTd8JdZcjdKSk",
  authDomain: "shareed-b9ed4.firebaseapp.com",
  projectId: "shareed-b9ed4",
  storageBucket: "shareed-b9ed4.appspot.com",
  messagingSenderId: "953135288757",
  appId: "1:953135288757:web:ed0d44601fc137c4d309fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const postDoubtForm = document.querySelector("form");
const doubtInput = document.getElementById("doubt-description");
const doubtsList = document.getElementById("doubt-list");
const doubtTitleInput = document.getElementById("doubt-title");

// Check authentication status before allowing posting
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

// Save Doubt Metadata to Firestore
const saveDoubtMetadata = async (doubtText, title, userId, userName) => {
  try {
    console.log("Saving doubt:", doubtText, "by user:", userName);
    const doubtsRef = collection(db, "doubts");
    const docRef = await addDoc(doubtsRef, {
      title: title,
      doubtText: doubtText,
      userId: userId,
      userName: userName,
      timestamp: new Date(),
      answers: []  // Initialize answers as an empty array
    });
    console.log("Doubt posted with ID:", docRef.id);
  } catch (error) {
    console.error("Error posting doubt:", error);
    alert("Error posting doubt!");
  }
};

// Fetch Doubts from Firestore
const fetchDoubts = async () => {
  try {
    const doubtsCollection = collection(db, "doubts");
    const doubtsQuery = query(doubtsCollection, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(doubtsQuery);

    const doubts = [];
    querySnapshot.forEach((doc) => {
      const doubt = doc.data();
      doubt.id = doc.id;  // Save the document ID
      doubts.push(doubt);
    });

    console.log("Fetched doubts:", doubts); // Debugging: Check if doubts are fetched
    displayDoubts(doubts);
  } catch (error) {
    console.error("Error fetching doubts:", error);
    alert("Error fetching doubts!");
  }
};

// Display Doubts
const displayDoubts = (doubts) => {
  doubtsList.innerHTML = ""; // Clear existing doubts
  
  if (doubts.length === 0) {
    doubtsList.innerHTML = "<li>No doubts posted yet.</li>";
    return;
  }

  doubts.forEach((doubt) => {
    // Ensure the 'answers' field is initialized to an empty array if it doesn't exist
    const answers = doubt.answers || [];

    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <p><strong>${doubt.title}</strong></p>
      <p>${doubt.doubtText}</p>
      <small>Posted by: ${doubt.userName}</small>
      <button class="answer-btn" data-doubt-id="${doubt.id}">Answer</button>
      <div class="answers-section" id="answers-${doubt.id}">
        ${answers.map(answer => `
          <div class="answer">
            <p><strong>Answer by ${answer.userName}:</strong> ${answer.text}</p>
          </div>
        `).join('')}
      </div>
      <textarea class="answer-input" id="answer-input-${doubt.id}" placeholder="Type your answer here..."></textarea>
      <button class="submit-answer-btn" data-doubt-id="${doubt.id}">Submit Answer</button>
      <hr>
    `;
    doubtsList.appendChild(listItem);

    // Event listener for submitting answers
    const answerButton = listItem.querySelector(".submit-answer-btn");
    answerButton.addEventListener("click", async (e) => {
      const doubtId = e.target.getAttribute("data-doubt-id");
      const answerText = listItem.querySelector(`#answer-input-${doubtId}`).value;

      if (answerText.trim() === "") {
        alert("Please type an answer.");
        return;
      }

      await postAnswer(doubtId, answerText);
    });
  });
};

// Post an answer to a doubt
const postAnswer = async (doubtId, answerText) => {
  try {
    const doubtRef = doc(db, "doubts", doubtId);
    const doubtSnapshot = await getDoc(doubtRef);
    if (doubtSnapshot.exists()) {
      const doubtData = doubtSnapshot.data();

      // Initialize answers as an empty array if not present
      const answers = doubtData.answers || [];

      const newAnswer = {
        userName: currentUser.displayName || "Anonymous",
        text: answerText,
        timestamp: new Date(),
      };

      // Add the new answer to the existing list of answers
      const updatedAnswers = [...answers, newAnswer];

      // Update the doubt document with the new answer
      await updateDoc(doubtRef, { answers: updatedAnswers });
      fetchDoubts();  // Reload doubts to show new answer
    }
  } catch (error) {
    console.error("Error posting answer:", error);
    alert("Error posting answer!");
  }
};

// Handle Posting Doubt
postDoubtForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("You need to log in to post a doubt.");
    return;
  }

  const doubtText = doubtInput.value;
  const title = doubtTitleInput.value;
  if (!doubtText || !title) {
    alert("Please enter a title and a doubt.");
    return;
  }

  const userId = currentUser.uid;
  const userName = currentUser.displayName || "Anonymous"; // Use displayName or default to Anonymous
  console.log("User ID for posting doubt:", userId); // Debugging: Check user ID

  await saveDoubtMetadata(doubtText, title, userId, userName);

  alert("Doubt posted successfully!");
  doubtInput.value = ""; // Clear input after posting
  doubtTitleInput.value = ""; // Clear title input

  // Fetch and display the updated list of doubts
  fetchDoubts();
});

// Initial fetch of doubts
fetchDoubts();
