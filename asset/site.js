"use strict";

document.querySelectorAll("[data-tabs]").forEach((group) => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const activate = (selected, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
    });
    if (focus) selected.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      const moves = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (Object.hasOwn(moves, event.key)) {
        event.preventDefault();
        activate(tabs[moves[event.key]], true);
      }
    });
  });
});

const dialog = document.getElementById("figure-dialog");
const previewImage = document.getElementById("expanded-figure");
if (typeof dialog.showModal === "function") {
  document.querySelectorAll("[data-lightbox]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const image = link.querySelector("img");
      previewImage.src = link.href;
      previewImage.alt = image.alt;
      document.getElementById("expanded-caption").textContent = link.closest("figure").querySelector("figcaption").textContent;
      dialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });
  document.getElementById("close-figure").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
}

const copyButton = document.getElementById("copy-citation");
copyButton.addEventListener("click", async () => {
  const code = document.getElementById("bibtex");
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText(code.textContent);
    copyButton.textContent = "Copied!";
    status.textContent = "Citation copied to clipboard.";
    window.setTimeout(() => { copyButton.textContent = "Copy BibTeX"; status.textContent = ""; }, 3000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "Citation selected. Press Ctrl+C or Command+C to copy.";
  }
});

if ("IntersectionObserver" in window) {
  const links = [...document.querySelectorAll("nav a")];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting);
    if (!visible.length) return;
    const id = visible[0].target.id;
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
  document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
}
