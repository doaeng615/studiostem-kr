(async function initDashboard() {
  const session = await requireAdminSession();
  if (!session) return;

  document.getElementById("userEmail").textContent = session.user.email;
  wireLogout("logoutBtn");

  const listEl = document.getElementById("postList");

  async function loadPosts() {
    listEl.innerHTML = '<p class="admin-hint">불러오는 중...</p>';
    const { data: posts, error } = await supabaseClient
      .from("portfolio_posts")
      .select("id, slug, title, industry, status, thumbnail_url, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      listEl.innerHTML = `<p class="admin-error">불러오기 실패: ${error.message}</p>`;
      return;
    }
    if (!posts || posts.length === 0) {
      listEl.innerHTML = '<p class="admin-hint">아직 작성된 글이 없습니다.</p>';
      return;
    }

    listEl.innerHTML = posts
      .map(
        (post, i) => `
      <div class="admin-post-row" data-id="${post.id}">
        <div class="admin-post-row__order">
          <button data-move="up" data-id="${post.id}" ${i === 0 ? "disabled" : ""}>▲</button>
          <button data-move="down" data-id="${post.id}" ${i === posts.length - 1 ? "disabled" : ""}>▼</button>
        </div>
        <div class="admin-post-row__thumb">
          ${post.thumbnail_url ? `<img src="${post.thumbnail_url}" alt="" />` : ""}
        </div>
        <div class="admin-post-row__info">
          <p class="admin-post-row__title">${escapeHtml(post.title)}<span class="admin-status-pill admin-status-pill--${post.status}">${post.status === "published" ? "발행됨" : "초안"}</span></p>
          <p class="admin-post-row__meta">${escapeHtml(post.industry || "")} · /${escapeHtml(post.slug)}</p>
        </div>
        <div class="admin-post-row__actions">
          <a class="admin-btn admin-btn--ghost admin-btn--sm" href="editor.html?id=${post.id}">수정</a>
          <button class="admin-btn admin-btn--danger admin-btn--sm" data-delete="${post.id}">삭제</button>
        </div>
      </div>
    `
      )
      .join("");

    listEl.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => deletePost(btn.dataset.delete));
    });
    listEl.querySelectorAll("[data-move]").forEach((btn) => {
      btn.addEventListener("click", () => movePost(btn.dataset.id, btn.dataset.move, posts));
    });
  }

  async function deletePost(id) {
    if (!confirm("이 글을 정말 삭제하시겠어요? 되돌릴 수 없습니다.")) return;
    const { error } = await supabaseClient.from("portfolio_posts").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
      return;
    }
    loadPosts();
  }

  async function movePost(id, direction, posts) {
    const idx = posts.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= posts.length) return;

    const a = posts[idx];
    const b = posts[swapIdx];
    await Promise.all([
      supabaseClient.from("portfolio_posts").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabaseClient.from("portfolio_posts").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    loadPosts();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  loadPosts();
})();
