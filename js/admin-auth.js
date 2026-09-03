// Shared auth guard for admin/*.html pages. Include after supabase-config.js.
async function requireAdminSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    location.href = "login.html";
    return null;
  }
  return data.session;
}

function wireLogout(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    location.href = "login.html";
  });
}
