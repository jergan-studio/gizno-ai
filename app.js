const GROQ_API_KEY = "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";

const messagesEl = document.getElementById("messages");
const form = document.getElementById("input-form");
const input = document.getElementById("chat-input");

let history = [];

/* ---------------- UI ---------------- */

function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addAI(content) {
  const div = document.createElement("div");
  div.className = "msg ai";

  const parsed = parseCode(content);

  if (!parsed) {
    div.textContent = content;
    messagesEl.appendChild(div);
    return;
  }

  div.appendChild(createCodeBox(parsed.code, parsed.explain));
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

function createCodeBox(code, explain) {
  const box = document.createElement("div");
  box.className = "code-box";

  const tabs = document.createElement("div");
  tabs.className = "tabs";

  const tab1 = document.createElement("div");
  tab1.className = "tab active";
  tab1.textContent = "Code";

  const tab2 = document.createElement("div");
  tab2.className = "tab";
  tab2.textContent = "Explain";

  const codeDiv = document.createElement("div");
  codeDiv.className = "code";
  codeDiv.textContent = code;

  const textDiv = document.createElement("div");
  textDiv.className = "text hidden";
  textDiv.textContent = explain;

  const copy = document.createElement("button");
  copy.className = "copy-btn";
  copy.textContent = "Copy";

  copy.onclick = () => {
    navigator.clipboard.writeText(code);
    copy.textContent = "Copied!";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  };

  tab1.onclick = () => {
    tab1.classList.add("active");
    tab2.classList.remove("active");
    codeDiv.classList.remove("hidden");
    textDiv.classList.add("hidden");
  };

  tab2.onclick = () => {
    tab2.classList.add("active");
    tab1.classList.remove("active");
    textDiv.classList.remove("hidden");
    codeDiv.classList.add("hidden");
  };

  tabs.appendChild(tab1);
  tabs.appendChild(tab2);

  box.appendChild(tabs);
  box.appendChild(codeDiv);
  box.appendChild(textDiv);
  box.appendChild(copy);

  return box;
}

/* ---------------- GROQ AI (FIXED + DEBUG) ---------------- */

async function askAI(text) {
  addAI("Thinking...");

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
                "You are Giznoz AI. If code is needed, ALWAYS use:\nCODE:\n...\n\nEXPLAIN:\n... you are made by jergan studio "
            },
            ...history,
            { role: "user", content: text }
          ]
        })
      }
    );

    const data = await res.json();

    console.log("GROQ RESPONSE:", data);

    messagesEl.lastChild.remove();

    // 🔴 SHOW REAL ERROR
    if (!res.ok) {
      addAI("HTTP ERROR: " + (data.error?.message || res.statusText));
      return;
    }

    if (data.error) {
      addAI("GROQ ERROR: " + data.error.message);
      return;
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      addAI("No response. Check console (F12).");
      return;
    }

    history.push({ role: "assistant", content: reply });
    addAI(reply);

  } catch (err) {
    console.error(err);
    messagesEl.lastChild.remove();
    addAI("Network error (fetch failed).");
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
