async function ask() {
  const message = document.getElementById("msg").value;
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await res.json();
  document.getElementById("reply").innerText = data.reply;
}