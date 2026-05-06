const GROQ_API_KEY = "Pgsk_3UgGBWZY1PDvMfSkc1nyWGdyb3FYI4ZLJRHjlwyCVBCFSAgVflOo";

const messagesEl = document.getElementById("messages");
const form = document.getElementById("input-form");
const input = document.getElementById("chat-input");

let history = [];

/* ---------------- MESSAGE UI ---------------- */

function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addAI(text) {
  const div = document.createElement("div");
  div.className = "msg ai";

  const parsed = parseCode(text);

  if (!parsed) {
    div.textContent = text;
    messagesEl.appendChild(div);
    return;
  }

  div.appendChild(renderCodeBox(parsed.code, parsed.explain));
  messagesEl.appendChild(div);
}

/* ---------------- CODE PARSER ---------------- */

function parseCode(text) {
  const match = text.match(/^CODE:\s*([\s\S]*?)\n{2,}EXPLAIN:\s*([\s\S]*)$/);
  if (!match) return null;

  return {
    code: match[1].trim(),
    explain: match[2].trim()
  };
}

/* ---------------- CODE UI ---------------- */

function renderCodeBox(code, explain) {
  const box = document.createElement("div");
  box.className = "code-box";

  const tabs = document.createElement("div");
  tabs.className = "tabs";

  const tabCode = document.createElement("div");
  tabCode.className = "tab active";
  tabCode.textContent = "Code";

  const tabText = document.createElement("div");
  tabText.className = "tab";
  tabText.textContent = "Explain";

  const codeDiv = document.createElement("div");
  codeDiv.className = "code";
  codeDiv.textContent = code;

  const textDiv = document.createElement("div");
  textDiv.className = "text hidden";
  textDiv.textContent = explain;

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy Code";

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(code);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy Code", 1200);
  };

  tabCode.onclick = () => {
    tabCode.classList.add("active");
    tabText.classList.remove("active");
    codeDiv.classList.remove("hidden");
    textDiv.classList.add("hidden");
  };

  tabText.onclick = () => {
    tabText.classList.add("active");
    tabCode.classList.remove("active");
    codeDiv.classList.add("hidden");
    textDiv.classList.remove("hidden");
  };

  tabs.appendChild(tabCode);
  tabs.appendChild(tabText);

  box.appendChild(tabs);
  box.appendChild(codeDiv);
  box.appendChild(textDiv);
  box.appendChild(copyBtn);

  return box;
}

/* ---------------- GROQ AI ---------------- */

async function askAI(text) {
  addAI("Thinking...");

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are Giznoz. If user asks for code, ALWAYS reply like:\nCODE:\n...\n\nEXPLAIN:\n..."
          },
          ...history,
          { role: "user", content: text }
        ]
      })
    });

    const data = await res.json();

    const reply = data?.choices?.[0]?.message?.content;

    messagesEl.lastChild.remove();

    if (!reply) {
      addAI("No response from AI.");
      return;
    }

    history.push({ role: "assistant", content: reply });
    addAI(reply);

  } catch (err) {
    console.error(err);
    messagesEl.lastChild.remove();
    addAI("Error connecting to AI.");
  }
}

/* ---------------- CHAT ---------------- */

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addUser(text);
  input.value = "";

  history.push({ role: "user", content: text });

  askAI(text);
});
