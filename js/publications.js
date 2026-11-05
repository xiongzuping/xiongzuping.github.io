/* Keep the published totals and year labels in step with the paper cards. */
(() => {
  const list = document.getElementById("publications");
  const tabs = Array.from(list.querySelectorAll(".pub-tab[data-tab]"));
  let total = 0;

  for (const tab of tabs) {
    const group = document.getElementById(tab.dataset.tab);
    const papers = group.querySelectorAll("article.paper").length;
    total += papers;
    tab.querySelector(".cnt").textContent = String(papers);

    for (const heading of group.querySelectorAll(".pub-year")) {
      let yearCount = 0;
      for (let item = heading.nextElementSibling; item && !item.matches(".pub-year"); item = item.nextElementSibling) {
        if (item.matches("article.paper")) yearCount++;
      }
      heading.querySelector("span").textContent = yearCount + (yearCount === 1 ? " paper" : " papers");
    }

    tab.addEventListener("click", () => {
      for (const button of tabs) button.setAttribute("aria-pressed", String(button === tab));
    });
  }

  for (const label of document.querySelectorAll("[data-publication-total]")) {
    label.textContent = String(total);
  }

  // Expose a hidden year before the browser follows a paper-specific link.
  function revealPaper(id) {
    const paper = document.getElementById(id);
    const group = paper && paper.closest(".pub-group");
    if (!group) return;
    const tab = tabs.find(button => button.dataset.tab === group.id);
    if (tab && !group.classList.contains("active")) tab.click();
    paper.scrollIntoView({ behavior: "instant", block: "start" });
  }
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      revealPaper(link.hash.slice(1));
    }
  });
  window.addEventListener("hashchange", () => revealPaper(location.hash.slice(1)));
  // The initial fragment can be positioned before media above it has a size.
  const initialHash = location.hash;
  if (initialHash) {
    revealPaper(initialHash.slice(1));
    window.addEventListener("load", () => {
      if (location.hash === initialHash) revealPaper(initialHash.slice(1));
    }, { once: true });
  }
})();
