(async function renderPost() {
  const root = document.getElementById("postRoot");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) {
    root.innerHTML = '<p class="portfolio-state">잘못된 주소입니다.</p>';
    return;
  }

  const { data: post, error } = await supabaseClient
    .from("portfolio_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    root.innerHTML = '<p class="portfolio-state">해당 작업 사례를 찾을 수 없습니다.</p>';
    return;
  }

  document.title = `${post.title} | 스튜디오 스템 Studio Stem`;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta && post.problem) descMeta.setAttribute("content", post.problem);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${post.title} | Studio Stem`);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && post.problem) ogDesc.setAttribute("content", post.problem);

  const blocksHtml = (post.content || []).map(renderBlock).join("");

  root.innerHTML = `
    <div class="post-hero">
      ${post.badge ? `<span class="post-hero__badge">${escapeHtml(post.badge)}</span>` : ""}
      <h1 class="post-hero__title">${escapeHtml(post.title)}</h1>
      ${post.industry ? `<p class="post-hero__type">${escapeHtml(post.industry)}</p>` : ""}
    </div>

    ${post.thumbnail_url ? `<div class="post-thumb"><img src="${escapeAttr(post.thumbnail_url)}" alt="${escapeAttr(post.title)}" /></div>` : ""}

    <div class="post-meta-grid">
      ${post.problem ? metaBlock("PROBLEM", post.problem) : ""}
      ${post.direction ? metaBlock("DIRECTION", post.direction) : ""}
      ${post.output ? metaBlock("OUTPUT", post.output) : ""}
    </div>

    <div class="post-body">${blocksHtml}</div>

    <div class="work-hero__cta">
      <p class="work-hero__cta-text">찾는 스타일이나 궁금한 점이 있다면 편하게 문의해주세요.</p>
      <a href="/index.html#contact" class="btn btn--primary">내 브랜드 작업 상담하기</a>
    </div>
  `;
})();

function metaBlock(label, body) {
  return `<div class="post-meta-block"><p class="post-meta-block__label">${label}</p><p class="post-meta-block__body">${escapeHtml(body)}</p></div>`;
}

function renderBlock(block) {
  if (!block || !block.type) return "";
  switch (block.type) {
    case "text":
      return `<p class="post-block--text" data-size="${escapeAttr(block.size || "md")}" data-color="${escapeAttr(block.color || "white")}" style="font-weight:${Number(block.weight) || 400}">${escapeHtml(block.text || "")}</p>`;
    case "image":
      return `<div class="post-block--image"><img src="${escapeAttr(block.url)}" alt="${escapeAttr(block.alt || "")}" loading="lazy" /></div>`;
    case "pdf":
      return `<div class="post-block--pdf"><iframe src="${escapeAttr(block.url)}" title="${escapeAttr(block.filename || "PDF")}"></iframe><a href="${escapeAttr(block.url)}" target="_blank" rel="noopener">PDF 새 창에서 열기 / 다운로드 ↗</a></div>`;
    case "youtube":
      return block.videoId
        ? `<div class="post-block--youtube"><iframe src="https://www.youtube.com/embed/${escapeAttr(block.videoId)}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        : "";
    default:
      return "";
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
