import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        [data-nextjs-dev-indicator] { display: none !important; }
        .__next-dev-overlay, .__next-dev-indicator { display: none !important; }
      `;
      document.head.appendChild(style);
    });
    await use(page);
  },
});
export { expect } from "@playwright/test";
