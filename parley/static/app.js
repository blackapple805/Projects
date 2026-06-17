// app.js — chat logic: keep the conversation in memory, render messages,
// and POST the full history each turn so the model has context.

const messagesEl = document.getElementById("messages");
const emptyState = document.getElementById("empty-state");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const providerMeta = document.getElementById("provider-meta");
const clearBtn = document.getElementById("clear-btn");

// The conversation: [{role: 'user'|'assistant', content: '...'}]
let history = [];

// --- Provider info in the header ---
fetch("/api/config")
  .then((r) => r.json())
  .then((c) => {
    providerMeta.textContent = c.configured
      ? `${c.provider} · ${c.model}`
      : "no API key set — see README";
  })
  .catch(() => (providerMeta.textContent = ""));

// --- Rendering ---
function addBubble(role, text, { markdown = false, error = false } = {}) {
  if (emptyState) emptyState.remove();
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble" + (error ? " error" : "");
  if (markdown && window.marked) {
    bubble.innerHTML = marked.parse(text);
  } else {
    bubble.textContent = text;
  }
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function addTyping() {
  if (emptyState) emptyState.remove();
  const wrap = document.createElement("div");
  wrap.className = "msg assistant";
  wrap.id = "typing-row";
  wrap.innerHTML =
    '<div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>';
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function removeTyping() {
  const t = document.getElementById("typing-row");
  if (t) t.remove();
}

// --- Sending ---
async function send(text) {
  history.push({ role: "user", content: text });
  addBubble("user", text);
  sendBtn.disabled = true;
  addTyping();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    removeTyping();

    if (!res.ok) {
      addBubble("assistant", data.error || "Something went wrong.", { error: true });
      return;
    }
    history.push({ role: "assistant", content: data.reply });
    addBubble("assistant", data.reply, { markdown: true });
  } catch (err) {
    removeTyping();
    addBubble("assistant", "Network error: " + err.message, { error: true });
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

// --- Events ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  send(text);
});

// Enter to send, Shift+Enter for newline. Auto-grow the textarea.
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 180) + "px";
});

clearBtn.addEventListener("click", () => {
  history = [];
  messagesEl.innerHTML =
    '<div class="empty" id="empty-state"><h1>Start a conversation</h1>' +
    "<p>Ask anything. Parley runs on a free LLM provider of your choice.</p></div>";
});
