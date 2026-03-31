// spec: .playwright-mcp/selection-popup.plan.md
// seed: (none)

import { test, expect } from '@playwright/test';

/** Re-implements the mirror-div technique from useTextSelection.ts to get
 *  the on-screen bounding rect of a text selection within the textarea. */
const GET_SELECTION_RECT_JS = `(function getSelectionRect(wordToFind) {
  const MIRROR_STYLES = [
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
    'letterSpacing', 'wordSpacing', 'paddingTop', 'paddingRight',
    'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth',
    'borderBottomWidth', 'borderLeftWidth', 'boxSizing', 'whiteSpace',
    'wordWrap', 'overflowWrap', 'tabSize',
  ];
  const ta = document.querySelector('textarea');
  const computed = window.getComputedStyle(ta);
  const mirror = document.createElement('div');
  mirror.style.position = 'fixed';
  mirror.style.visibility = 'hidden';
  mirror.style.pointerEvents = 'none';
  mirror.style.overflow = 'auto';
  mirror.style.whiteSpace = 'pre-wrap';
  for (const prop of MIRROR_STYLES) {
    mirror.style[prop] = computed[prop];
  }
  const taRect = ta.getBoundingClientRect();
  mirror.style.top = \`\${taRect.top}px\`;
  mirror.style.left = \`\${taRect.left}px\`;
  mirror.style.width = \`\${taRect.width}px\`;
  mirror.style.height = \`\${taRect.height}px\`;
  const text = ta.value;
  const start = text.indexOf(wordToFind);
  const end = start + wordToFind.length;
  const before = document.createTextNode(text.slice(0, start));
  const selected = document.createElement('span');
  selected.textContent = text.slice(start, end) || '\\u200b';
  const after = document.createTextNode(text.slice(end));
  mirror.appendChild(before);
  mirror.appendChild(selected);
  mirror.appendChild(after);
  document.body.appendChild(mirror);
  mirror.scrollTop = ta.scrollTop;
  const rect = selected.getBoundingClientRect();
  document.body.removeChild(mirror);
  return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
})`;

test.describe('Selection Popup — Positioning', () => {
  test('Popup appears below the selected text by default', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 and type text, then double-click a word
    //    in the first visible line of the textarea
    await page.goto('http://localhost:5173');
    await page.getByRole('textbox', { name: 'Paste your text here. Select any sensitive word or phrase to pseudonymize it.' }).fill('My name is John Smith and I work at Acme Corp');

    // Select word "John" via script to trigger the popup
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      const start = ta.value.indexOf('John');
      ta.setSelectionRange(start, start + 4);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    await expect(page.locator('.selection-popup')).toBeVisible();

    // expect: The popup top edge is positioned approximately 8px below the bottom
    //         edge of the selection bounding rect (anchorRect.bottom + 8)
    const positions = await page.evaluate((getSelectionRectSrc: string) => {
      const getSelectionRect = eval(getSelectionRectSrc + "('John')");
      const anchorRect = getSelectionRect;
      const popup = document.querySelector('.selection-popup') as HTMLElement;
      const popupTop = parseFloat(popup.style.top);
      return {
        anchorBottom: anchorRect.bottom,
        anchorTop: anchorRect.top,
        popupTop,
        innerHeight: window.innerHeight,
      };
    }, GET_SELECTION_RECT_JS);

    const expectedPopupTop = positions.anchorBottom + 8;
    expect(positions.popupTop).toBeCloseTo(expectedPopupTop, -1); // within ±10px
  });

  test('Popup flips above the selection when placement below would overflow viewport', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 and set the viewport height to a small value
    //    so that the textarea selection rect's bottom + 8 + 160 (popup height) exceeds window.innerHeight
    await page.goto('http://localhost:5173');

    // Set a small viewport height so the popup cannot fit below the selection
    await page.setViewportSize({ width: 1280, height: 300 });

    await page.getByRole('textbox', { name: 'Paste your text here. Select any sensitive word or phrase to pseudonymize it.' }).fill('My name is John Smith and I work at Acme Corp');

    // Select word "John" to trigger popup
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      const start = ta.value.indexOf('John');
      ta.setSelectionRange(start, start + 4);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    await expect(page.locator('.selection-popup')).toBeVisible();

    // 2. Observe the popup vertical position
    //    expect: The popup appears above the selected text (top = anchorRect.top - 160 - 8)
    const positions = await page.evaluate((getSelectionRectSrc: string) => {
      const anchorRect = eval(getSelectionRectSrc + "('John')");
      const popup = document.querySelector('.selection-popup') as HTMLElement;
      const popupTop = parseFloat(popup.style.top);
      const popupHeight = 160;
      const innerHeight = window.innerHeight;
      const fitsBelow = anchorRect.bottom + 8 + popupHeight < innerHeight;
      const expectedTopIfAbove = anchorRect.top - popupHeight - 8;
      return {
        anchorBottom: anchorRect.bottom,
        anchorTop: anchorRect.top,
        popupTop,
        innerHeight,
        fitsBelow,
        expectedTopIfAbove,
      };
    }, GET_SELECTION_RECT_JS);

    // Verify the popup does NOT fit below (confirming the flip condition)
    expect(positions.fitsBelow).toBe(false);

    // Verify the popup is positioned above the selection
    expect(positions.popupTop).toBeCloseTo(positions.expectedTopIfAbove, -1); // within ±10px
  });

  test('Popup is horizontally clamped to stay within viewport', async ({ page }) => {
    // 1. Navigate to http://localhost:5173, type text, and select a word near the right edge
    //    of the textarea so that anchorRect.left would place the 260px-wide popup beyond
    //    the viewport right edge
    await page.goto('http://localhost:5173');

    // Use a narrow viewport so the textarea is near the right edge
    await page.setViewportSize({ width: 400, height: 720 });

    await page.getByRole('textbox', { name: 'Paste your text here. Select any sensitive word or phrase to pseudonymize it.' }).fill('My name is John Smith and I work at Acme Corp');

    // Select a word that would be near the right side of the textarea
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      // Select "Acme" which appears later in the text
      const start = ta.value.indexOf('Acme');
      ta.setSelectionRange(start, start + 4);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    await expect(page.locator('.selection-popup')).toBeVisible();

    // 2. Observe the popup's left position
    //    expect: The popup left edge is clamped to Math.min(anchorRect.left, window.innerWidth - 260 - 8)
    const positions = await page.evaluate((getSelectionRectSrc: string) => {
      const anchorRect = eval(getSelectionRectSrc + "('Acme')");
      const popup = document.querySelector('.selection-popup') as HTMLElement;
      const popupLeft = parseFloat(popup.style.left);
      const popupWidth = 260;
      const innerWidth = window.innerWidth;
      const expectedLeft = Math.min(anchorRect.left, innerWidth - popupWidth - 8);
      return {
        anchorLeft: anchorRect.left,
        popupLeft,
        innerWidth,
        expectedLeft,
        wouldOverflow: anchorRect.left + popupWidth + 8 > innerWidth,
      };
    }, GET_SELECTION_RECT_JS);

    // Verify clamped left matches the formula
    expect(positions.popupLeft).toBeCloseTo(positions.expectedLeft, -1); // within ±10px

    // Also verify the popup doesn't extend beyond the viewport
    expect(positions.popupLeft + 260).toBeLessThanOrEqual(positions.innerWidth);
  });

  test('Popup position is accurate when textarea is scrolled', async ({ page }) => {
    // 1. Navigate to http://localhost:5173, enter enough text lines to make the textarea scroll,
    //    then scroll the textarea downward
    await page.goto('http://localhost:5173');

    // Build a long text with many lines so the textarea scrolls
    const manyLines = Array.from({ length: 30 }, (_, i) => `Line ${i + 1}: My name is Person${i} and I work at Company${i}`).join('\n');
    await page.getByRole('textbox', { name: 'Paste your text here. Select any sensitive word or phrase to pseudonymize it.' }).fill(manyLines);

    // Scroll the textarea down so early lines are no longer visible
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.scrollTop = 200;
    });

    // expect: The textarea is scrolled and early lines are no longer visible
    const scrollTop = await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      return ta.scrollTop;
    });
    expect(scrollTop).toBeGreaterThan(0);

    // 2. Double-click a word that is currently visible (near the bottom of the viewport)
    //    Select "Person20" which appears around line 20 (visible after scrolling)
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      const start = ta.value.indexOf('Person20');
      if (start === -1) return;
      ta.setSelectionRange(start, start + 8);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    await expect(page.locator('.selection-popup')).toBeVisible();

    // expect: The popup appears at a position that matches the on-screen location of
    //         the selected text (mirror div's scrollTop is synced from textarea's scrollTop)
    const positions = await page.evaluate((getSelectionRectSrc: string) => {
      const anchorRect = eval(getSelectionRectSrc + "('Person20')");
      const popup = document.querySelector('.selection-popup') as HTMLElement;
      const popupTop = parseFloat(popup.style.top);
      const popupLeft = parseFloat(popup.style.left);
      const popupHeight = 160;
      const innerHeight = window.innerHeight;
      const fitsBelow = anchorRect.bottom + 8 + popupHeight < innerHeight;
      const expectedTop = fitsBelow
        ? anchorRect.bottom + 8
        : anchorRect.top - popupHeight - 8;
      return {
        anchorTop: anchorRect.top,
        anchorBottom: anchorRect.bottom,
        anchorLeft: anchorRect.left,
        popupTop,
        popupLeft,
        expectedTop,
        innerHeight,
      };
    }, GET_SELECTION_RECT_JS);

    // The popup should be within viewport (confirming the word is visible)
    expect(positions.anchorTop).toBeGreaterThan(0);
    expect(positions.anchorBottom).toBeLessThan(positions.innerHeight);

    // Popup vertical position should match the computed expected top based on the anchor
    expect(positions.popupTop).toBeCloseTo(positions.expectedTop, -1); // within ±10px
  });
});
