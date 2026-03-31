// spec: .playwright-mcp/selection-popup.plan.md
// seed: (none)

import { test, expect } from '@playwright/test';

/** Helper to open the selection popup by selecting 'John' in the textarea. */
async function openPopupWithJohn(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const ta = document.querySelector('textarea') as HTMLTextAreaElement;
    ta.focus();
    const start = ta.value.indexOf('John');
    ta.setSelectionRange(start, start + 4);
    ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
}

test.describe('Selection Popup — Dismissal Behaviors', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('pseudonymizer_mappings_v1');
    });
    await page.goto('http://localhost:5173');
    // 1. Type 'John Smith' in the textarea
    await page.getByRole('textbox', { name: 'Paste your text here. Select' }).fill('John Smith');
  });

  test('Dismiss popup using the Cancel button', async ({ page }) => {
    const inputTextarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    const pseudonymizedOutput = page.locator('.output-text').first();

    // 1. Double-click 'John' to open the popup
    await openPopupWithJohn(page);

    // expect: Popup appears with 'John'
    await expect(page.locator('.selection-popup')).toBeVisible();
    await expect(page.locator('.selected-text')).toHaveText('John');

    // 2. Click the 'Cancel' button
    await page.getByRole('button', { name: 'Cancel' }).click();

    // expect: The popup closes immediately
    await expect(page.locator('.selection-popup')).not.toBeVisible();

    // expect: No new mapping is added to the Mappings panel
    await expect(page.getByText('No mappings yet')).toBeVisible();

    // expect: The Mappings count remains 0
    await expect(page.getByRole('heading', { name: 'Mappings (0)' })).toBeVisible();
  });

  test('Dismiss popup using the Escape key', async ({ page }) => {
    // 1. Double-click 'John' to open the popup
    await openPopupWithJohn(page);

    // expect: Popup appears with 'John' and pseudonym input is focused
    await expect(page.locator('.selection-popup')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' })).toBeFocused();

    // 2. Press the Escape key
    await page.keyboard.press('Escape');

    // expect: The popup closes without adding any mapping
    await expect(page.locator('.selection-popup')).not.toBeVisible();

    // expect: Mappings count remains 0
    await expect(page.getByRole('heading', { name: 'Mappings (0)' })).toBeVisible();
  });

  test('Dismiss popup by clicking outside', async ({ page }) => {
    // 1. Double-click 'John' to open the popup
    await openPopupWithJohn(page);

    // expect: Popup appears
    await expect(page.locator('.selection-popup')).toBeVisible();

    // 2. Click on the page heading 'Prompt Cloak' — an element outside the popup and textarea
    await page.getByRole('heading', { name: 'Prompt Cloak', level: 1 }).click();

    // expect: The popup closes
    await expect(page.locator('.selection-popup')).not.toBeVisible();

    // expect: No mapping is added
    await expect(page.getByText('No mappings yet')).toBeVisible();

    // expect: Mappings count remains 0
    await expect(page.getByRole('heading', { name: 'Mappings (0)' })).toBeVisible();
  });

  test('Dismiss popup with empty pseudonym field via Cancel', async ({ page }) => {
    // 1. Double-click 'John' to open popup
    await openPopupWithJohn(page);

    // expect: Popup appears with empty pseudonym field
    await expect(page.locator('.selection-popup')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' })).toHaveValue('');

    // 2. Without typing anything in the pseudonym field, click 'Cancel'
    await page.getByRole('button', { name: 'Cancel' }).click();

    // expect: The popup closes
    await expect(page.locator('.selection-popup')).not.toBeVisible();

    // expect: No mapping is added
    await expect(page.getByRole('heading', { name: 'Mappings (0)' })).toBeVisible();
  });
});
