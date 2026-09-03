(async function initEditor() {
  const session = await requireAdminSession();
  if (!session) return;
  document.getElementById("userEmail").textContent = session.user.email;
  wireLogout("logoutBtn");

  const postId = new URLSearchParams(location.search).get("id");
  let thumbnailUrl = "";
  let slugTouched = false;

  const els = {
    title: document.getElementById("fTitle"),
    slug: document.getElementById("fSlug"),
    industry: document.getElementById("fIndustry"),
    badge: document.getElementById("fBadge"),
    problem: document.getElementById("fProblem"),
    direction: document.getElementById("fDirection"),
    output: document.getElementById("fOutput"),
    blockList: document.getElementById("blockList"),
    error: document.getElementById("editorError"),
    thumbPreview: document.getElementById("thumbPreview"),
    thumbLabel: document.getElementById("thumbLabel"),
    thumbInput: document.getElementById("thumbInput"),
  };

  els.slug.addEventListener("input", () => { slugTouched = true; });
  els.title.addEventListener("input", () => {
    if (!slugTouched) els.slug.value = slugify(els.title.value);
  });

  // ---- thumbnail upload ----
  document.getElementById("thumbDropzone").addEventListener("click", (e) => {
    if (e.target === els.thumbInput) return;
  });
  els.thumbInput.addEventListener("change", async () => {
    const file = els.thumbInput.files[0];
    if (!file) return;
    els.thumbLabel.textContent = "업로드 중...";
    try {
      const resized = await resizeImage(file, 1600, 0.85);
      thumbnailUrl = await uploadFile(resized, "portfolio-thumbnails");
      els.thumbPreview.src = thumbnailUrl;
      els.thumbPreview.style.display = "block";
      els.thumbLabel.style.display = "none";
    } catch (err) {
      alert("썸네일 업로드 실패: " + err.message);
      els.thumbLabel.textContent = "클릭해서 이미지 업로드";
    }
  });

  // ---- block templates ----
  const templates = {
    text: document.getElementById("blockTextTpl"),
    image: document.getElementById("blockImageTpl"),
    pdf: document.getElementById("blockPdfTpl"),
    youtube: document.getElementById("blockYoutubeTpl"),
  };

  function addBlock(type, data) {
    const node = templates[type].content.firstElementChild.cloneNode(true);
    node._data = Object.assign({ type }, data || {});
    wireBlock(node, type);
    els.blockList.appendChild(node);
    return node;
  }

  function wireBlock(node, type) {
    node.querySelector("[data-remove]").addEventListener("click", () => node.remove());
    node.querySelector("[data-up]").addEventListener("click", () => {
      const prev = node.previousElementSibling;
      if (prev) els.blockList.insertBefore(node, prev);
    });
    node.querySelector("[data-down]").addEventListener("click", () => {
      const next = node.nextElementSibling;
      if (next) els.blockList.insertBefore(next, node);
    });

    if (type === "text") {
      const textEl = node.querySelector('[data-field="text"]');
      const sizeEl = node.querySelector('[data-field="size"]');
      const weightEl = node.querySelector('[data-field="weight"]');
      const swatches = node.querySelectorAll(".admin-swatch");
      textEl.value = node._data.text || "";
      sizeEl.value = node._data.size || "md";
      weightEl.value = String(node._data.weight || 400);
      const activeColor = node._data.color || "white";
      swatches.forEach((s) => {
        s.dataset.active = String(s.dataset.color === activeColor);
        s.addEventListener("click", () => {
          swatches.forEach((x) => (x.dataset.active = "false"));
          s.dataset.active = "true";
        });
      });
    }

    if (type === "image") {
      const preview = node.querySelector("[data-preview]");
      const altEl = node.querySelector('[data-field="alt"]');
      const statusEl = node.querySelector("[data-status]");
      const uploadEl = node.querySelector("[data-upload]");
      altEl.value = node._data.alt || "";
      if (node._data.url) {
        preview.src = node._data.url;
        preview.style.display = "block";
        statusEl.textContent = "업로드된 이미지";
      }
      uploadEl.addEventListener("change", async () => {
        const file = uploadEl.files[0];
        if (!file) return;
        statusEl.textContent = "업로드 중...";
        try {
          const resized = await resizeImage(file, 1600, 0.85);
          node._data.url = await uploadFile(resized, "portfolio-media");
          preview.src = node._data.url;
          preview.style.display = "block";
          statusEl.textContent = "업로드 완료";
        } catch (err) {
          statusEl.textContent = "업로드 실패: " + err.message;
        }
      });
    }

    if (type === "pdf") {
      const statusEl = node.querySelector("[data-status]");
      const uploadEl = node.querySelector("[data-upload]");
      if (node._data.url) statusEl.textContent = "업로드된 파일: " + (node._data.filename || "PDF");
      uploadEl.addEventListener("change", async () => {
        const file = uploadEl.files[0];
        if (!file) return;
        statusEl.textContent = "업로드 중...";
        try {
          node._data.url = await uploadFile(file, "portfolio-media");
          node._data.filename = file.name;
          statusEl.textContent = "업로드 완료: " + file.name;
        } catch (err) {
          statusEl.textContent = "업로드 실패: " + err.message;
        }
      });
    }

    if (type === "youtube") {
      const urlEl = node.querySelector('[data-field="url"]');
      urlEl.value = node._data.url || "";
      urlEl.addEventListener("input", () => {
        node._data.videoId = extractYoutubeId(urlEl.value);
      });
    }
  }

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addBlock(btn.dataset.add, {}));
  });

  function collectBlocks() {
    return Array.from(els.blockList.children).map((node) => {
      const type = node.dataset.type;
      if (type === "text") {
        return {
          type: "text",
          text: node.querySelector('[data-field="text"]').value,
          size: node.querySelector('[data-field="size"]').value,
          weight: Number(node.querySelector('[data-field="weight"]').value),
          color: node.querySelector('.admin-swatch[data-active="true"]').dataset.color,
        };
      }
      if (type === "image") {
        return { type: "image", url: node._data.url || "", alt: node.querySelector('[data-field="alt"]').value };
      }
      if (type === "pdf") {
        return { type: "pdf", url: node._data.url || "", filename: node._data.filename || "" };
      }
      if (type === "youtube") {
        return { type: "youtube", url: node.querySelector('[data-field="url"]').value, videoId: node._data.videoId || extractYoutubeId(node.querySelector('[data-field="url"]').value) };
      }
      return null;
    }).filter(Boolean);
  }

  // ---- load existing post ----
  if (postId) {
    const { data: post, error } = await supabaseClient.from("portfolio_posts").select("*").eq("id", postId).single();
    if (error || !post) {
      els.error.textContent = "글을 불러오지 못했습니다.";
      els.error.style.display = "block";
    } else {
      els.title.value = post.title || "";
      els.slug.value = post.slug || "";
      slugTouched = true;
      els.industry.value = post.industry || "";
      els.badge.value = post.badge || "";
      els.problem.value = post.problem || "";
      els.direction.value = post.direction || "";
      els.output.value = post.output || "";
      thumbnailUrl = post.thumbnail_url || "";
      if (thumbnailUrl) {
        els.thumbPreview.src = thumbnailUrl;
        els.thumbPreview.style.display = "block";
        els.thumbLabel.style.display = "none";
      }
      (post.content || []).forEach((block) => addBlock(block.type, block));
    }
  }

  // ---- save ----
  async function savePost(status) {
    els.error.style.display = "none";
    const title = els.title.value.trim();
    const slug = els.slug.value.trim();
    if (!title || !slug) {
      els.error.textContent = "제목과 슬러그는 필수입니다.";
      els.error.style.display = "block";
      return;
    }

    const payload = {
      title,
      slug,
      industry: els.industry.value.trim(),
      badge: els.badge.value.trim(),
      problem: els.problem.value.trim(),
      direction: els.direction.value.trim(),
      output: els.output.value.trim(),
      thumbnail_url: thumbnailUrl || null,
      content: collectBlocks(),
      status,
    };

    let result;
    if (postId) {
      result = await supabaseClient.from("portfolio_posts").update(payload).eq("id", postId);
    } else {
      const { data: maxRow } = await supabaseClient
        .from("portfolio_posts")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      payload.sort_order = maxRow ? maxRow.sort_order + 1 : 1;
      result = await supabaseClient.from("portfolio_posts").insert(payload);
    }

    if (result.error) {
      els.error.textContent = "저장 실패: " + result.error.message;
      els.error.style.display = "block";
      return;
    }
    location.href = "dashboard.html";
  }

  document.getElementById("saveDraftBtn").addEventListener("click", () => savePost("draft"));
  document.getElementById("publishBtn").addEventListener("click", () => savePost("published"));

  // ---- helpers ----
  function slugify(str) {
    return String(str)
      .trim()
      .toLowerCase()
      .replace(/[^\w가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function extractYoutubeId(url) {
    if (!url) return null;
    const patterns = [
      /youtube\.com\/watch\?v=([\w-]{11})/,
      /youtu\.be\/([\w-]{11})/,
      /youtube\.com\/shorts\/([\w-]{11})/,
      /youtube\.com\/embed\/([\w-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function resizeImage(file, maxDim, quality) {
    return new Promise((resolve) => {
      if (file.type === "image/gif") return resolve(file);
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim) {
          URL.revokeObjectURL(url);
          resolve(file);
          return;
        }
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(new File([blob], file.name, { type: file.type || "image/jpeg" }));
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  }

  async function uploadFile(file, bucket) {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
})();
