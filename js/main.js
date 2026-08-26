// Scroll state for nav pill shadow
const nav = document.getElementById("siteNav");
if (nav) {
  const onScroll = () => nav.classList.toggle("nav--scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---- Mobile nav menu ----
(function initMobileNav() {
  const hamburger = document.getElementById("navHamburger");
  const closeBtn = document.getElementById("navMenuClose");
  const menu = document.getElementById("navMobileMenu");
  if (!hamburger || !menu) return;

  function openMenu() {
    menu.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    menu.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  menu.querySelectorAll(".nav-menu__item, .nav-menu__cta").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });
})();

// ---- Services: tab -> detail panel switch ----
(function initServiceTabs() {
  const tabs = document.querySelectorAll(".services__tab");
  const panelTag = document.getElementById("panelTag");
  const panelTitle = document.getElementById("panelTitle");
  const panelDesc = document.getElementById("panelDesc");
  const panelWorkLabel = document.querySelector("#servicePanel .services__panel-block-label");
  const panelWork = document.getElementById("panelWork");
  const panelFits = document.getElementById("panelFits");
  if (!tabs.length || !panelTag) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-pressed", "false"));
      tab.setAttribute("aria-pressed", "true");
      panelTag.textContent = tab.dataset.tag;
      panelTitle.innerHTML = tab.dataset.title;
      panelDesc.textContent = tab.dataset.desc;
      if (panelWorkLabel) panelWorkLabel.textContent = tab.dataset.workLabel;
      panelWork.textContent = tab.dataset.work;
      panelFits.textContent = tab.dataset.fits;

      if (typeof gtag === "function") {
        gtag("event", "select_service_tab", { service: tab.dataset.tag });
      }
    });
  });
})();

// ---- Reviews: ghost-peek carousel ----
(function initReviewCarousel() {
  const stage = document.querySelector(".reviews__stage");
  if (!stage) return;

  const reviews = [
    {
      tag: "Branding",
      quote:
        "카페 오픈을 준비하면서 로고, 메뉴판, 포장 스티커까지 필요한 게 너무 많았어요. 예산도 정해져 있어서 걱정했는데, 당장 필요한 것과 나중에 추가해도 되는 것을 나눠주셔서 결정하기가 훨씬 쉬웠습니다.",
      source: "J 카페 오픈 프로젝트 · Opening Kit 후기",
    },
    {
      tag: "Brand Identity",
      quote:
        "처음엔 로고만 있으면 될 줄 알았는데, 포스터랑 인스타그램 디자인이 계속 따로 노는 게 고민이었어요. 톤앤매너를 하나로 잡아주셔서 이제는 뭘 만들어도 브랜드답게 나옵니다.",
      source: "B 브랜드 리브랜딩 · Brand Identity 후기",
    },
    {
      tag: "Identity Refresh",
      quote:
        "오래된 브랜드라 어디서부터 손대야 할지 막막했는데, 기존 자산을 존중하면서도 지금 시대에 맞게 다듬어주셔서 놀랐습니다. 직원들도 새 로고를 자랑스러워해요.",
      source: "주흥 브랜드 리뉴얼 · Identity Refresh 후기",
    },
  ];

  const card = document.querySelector(".reviews__card");
  const counter = document.getElementById("reviewCounter");
  const tagEl = document.getElementById("reviewTag");
  const quoteEl = document.getElementById("reviewQuote");
  const sourceEl = document.getElementById("reviewSource");
  const ghostLeft = document.getElementById("reviewGhostLeft");
  const ghostRight = document.getElementById("reviewGhostRight");
  const prevBtn = document.getElementById("reviewPrev");
  const nextBtn = document.getElementById("reviewNext");

  let index = 0;
  let isAnimating = false;
  const SLIDE_DISTANCE = 40;
  const SLIDE_DURATION = 320;

  function render() {
    const total = reviews.length;
    const current = reviews[index];
    const prev = reviews[(index - 1 + total) % total];
    const next = reviews[(index + 1) % total];

    counter.textContent = `REVIEW ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    tagEl.textContent = current.tag;
    quoteEl.textContent = `“${current.quote}”`;
    sourceEl.textContent = current.source;
    ghostLeft.textContent = prev.quote;
    ghostRight.textContent = next.quote;
  }

  function goTo(nextIndex, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const outOffset = direction === "next" ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
    card.style.setProperty("--slide", outOffset + "px");
    card.style.opacity = "0";

    window.setTimeout(() => {
      index = nextIndex;
      render();

      card.style.transition = "none";
      card.style.setProperty("--slide", -outOffset + "px");
      card.style.opacity = "0";
      void card.offsetWidth;
      card.style.transition = "";
      card.style.setProperty("--slide", "0px");
      card.style.opacity = "1";

      window.setTimeout(() => {
        isAnimating = false;
      }, SLIDE_DURATION);
    }, SLIDE_DURATION);
  }

  const AUTO_ADVANCE_MS = 5000;
  let autoTimer = null;

  function stopAuto() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }
  function startAuto() {
    stopAuto();
    autoTimer = window.setInterval(() => {
      goTo((index + 1) % reviews.length, "next");
    }, AUTO_ADVANCE_MS);
  }

  prevBtn.addEventListener("click", () => {
    goTo((index - 1 + reviews.length) % reviews.length, "prev");
    if (typeof gtag === "function") gtag("event", "review_prev");
    startAuto();
  });
  nextBtn.addEventListener("click", () => {
    goTo((index + 1) % reviews.length, "next");
    if (typeof gtag === "function") gtag("event", "review_next");
    startAuto();
  });

  stage.addEventListener("mouseenter", stopAuto);
  stage.addEventListener("mouseleave", startAuto);

  render();
  startAuto();
})();

// ---- FAQ accordion ----
(function initFaqAccordion() {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector(".faq__question");
    question.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => other.classList.remove("is-open"));
      if (willOpen) item.classList.add("is-open");
    });
  });
})();

// ---- Contact form ----
(function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (typeof gtag === "function") {
      gtag("event", "generate_lead", { form_id: "contact" });
    }

    const submitBtn = form.querySelector(".contact__submit");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "문의가 접수되었습니다";
    submitBtn.disabled = true;

    window.setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 3000);
  });
})();
