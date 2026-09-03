(async function renderWorkGrid() {
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  const { data: posts, error } = await supabaseClient
    .from("portfolio_posts")
    .select("slug, title, industry, badge, problem, direction, output, thumbnail_url")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    grid.innerHTML = '<p class="portfolio-state">작업 사례를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>';
    console.error(error);
    return;
  }

  if (!posts || posts.length === 0) {
    grid.innerHTML = '<p class="portfolio-state">준비 중입니다.</p>';
    return;
  }

  grid.innerHTML = posts
    .map(
      (post, i) => `
    <a href="/work-post.html?slug=${encodeURIComponent(post.slug)}" class="portfolio-card">
      <div class="portfolio-card__media">
        ${post.thumbnail_url ? `<img src="${escapeAttr(post.thumbnail_url)}" alt="${escapeAttr(post.title)} 썸네일" loading="lazy" />` : ""}
        ${post.badge ? `<span class="portfolio-card__badge">${escapeHtml(post.badge)}</span>` : ""}
      </div>
      <div class="portfolio-card__info">
        <div>
          <p class="portfolio-card__name">PROJECT ${String(i + 1).padStart(2, "0")} — ${escapeHtml(post.title)}</p>
          <p class="portfolio-card__type">${escapeHtml(post.industry || "")}</p>
        </div>
        ${post.problem ? `<div><p class="portfolio-card__block-label">PROBLEM</p><p class="portfolio-card__block-body">${escapeHtml(post.problem)}</p></div>` : ""}
        ${post.direction ? `<div><p class="portfolio-card__block-label">DIRECTION</p><p class="portfolio-card__block-body">${escapeHtml(post.direction)}</p></div>` : ""}
        ${post.output ? `<div><p class="portfolio-card__block-label">OUTPUT</p><p class="portfolio-card__block-body">${escapeHtml(post.output)}</p></div>` : ""}
      </div>
    </a>
  `
    )
    .join("");
})();

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
