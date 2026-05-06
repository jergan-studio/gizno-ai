const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const loginForm = document.getElementById("login-form");
const loginNameInput = document.getElementById("login-name");
const loginPassInput = document.getElementById("login-pass");
const skipLoginBtn = document.getElementById("skip-login-btn");

const messagesEl = document.getElementById("messages");
const inputForm = document.getElementById("input-form");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const userPill = document.getElementById("user-pill");

let currentUser = "Guest";

/* ---------------- AI BRAIN (FALLBACK CHATGPT STYLE) ---------------- */

function fakeAI(input) {
  const text = input.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Hey! I'm Giznoz 🤖";
  }

  if (text.includes("how are you")) {
    return "I'm running smoothly inside your GitHub site!";
  }

  if (text.includes("code")) {
    return "CODE:\nconsole.log('Hello World');\n\nEXPLAIN:\nThis prints Hello World in JavaScript.";
  }

  if (text.includes("who are you")) {
    return "I'm Giznoz, your lightweight AI assistant running fully in the browser.";
  }

  return "I don't fully understand that yet, but I'm learning!";
}

/* ---------------- UI ---------------- */

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ---------------- CHAT ---------------- */

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";

  setTimeout(() => {
    const response = fakeAI(text);
    addMessage(response, "ai");
  }, 500);
});

/* ---------------- LOGIN ---------------- */

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = loginNameInput.value.trim();
  if (!name) return;

  currentUser = name;
  userPill.textContent = name;

  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  addMessage(`Welcome ${name}!`, "ai");
});

skipLoginBtn.addEventListener("click", () => {
  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  addMessage("Welcome Guest!", "ai");
});
