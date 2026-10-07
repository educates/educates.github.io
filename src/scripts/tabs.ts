// Tab groups rendered by src/components/Tabs.astro, following the WAI-ARIA
// tabs pattern with automatic activation: a click selects a tab; Left and
// Right move to the previous and next tab and select it, wrapping around,
// and Home and End move to the first and last. Only the selected tab is in
// the Tab order, so Tab moves on to its panel.

export function setUpTabs(): void {
  for (const group of document.querySelectorAll<HTMLElement>("[data-tabs]")) {
    const tabs = [
      ...group.querySelectorAll<HTMLButtonElement>(
        ':scope > [role="tablist"] > [role="tab"]',
      ),
    ];

    const select = (selected: HTMLButtonElement) => {
      for (const tab of tabs) {
        const isSelected = tab === selected;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
        const panelId = tab.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        if (panel) panel.hidden = !isSelected;
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        const last = tabs.length - 1;
        const target: number | undefined = {
          ArrowLeft: index === 0 ? last : index - 1,
          ArrowRight: index === last ? 0 : index + 1,
          Home: 0,
          End: last,
        }[event.key];
        if (target === undefined) return;
        event.preventDefault();
        select(tabs[target]);
        tabs[target].focus();
      });
    });
  }
}
