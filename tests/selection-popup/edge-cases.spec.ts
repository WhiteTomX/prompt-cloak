// spec: .playwright-mcp/selection-popup.plan.md
// seed: seed.spec.ts

import { test, expect, type Page } from '@playwright/test';

test.describe('Selection Popup — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Ensure localStorage is clean so persisted mappings do not bleed between tests
    await page.evaluate(() => localStorage.removeItem('pseudonymizer_mappings_v1'));
    await page.goto('http://localhost:5173');
  });

  // Programmatically set a selection range in the textarea and fire mouseup so
  // the useTextSelection hook processes it (mirrors a real mouse drag result).
  async function selectInTextarea(page: Page, start: number, end: number) {
    await page.evaluate(
      ({ s, e }) => {
        const ta = document.querySelector('textarea') as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(s, e);
        ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      },
      { s: start, e: end },
    );
  }

  test('5.1 Click-and-drag to select a partial word fragment', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });

    // 1. Navigate to http://localhost:5173 and type 'Acme Corp' in the textarea
    await textarea.fill('Acme Corp');

    // 2. Click and drag to select only 'me Co' (a cross-word partial selection)
    // 'me Co' spans indices 2–7 in 'Acme Corp'
    await selectInTextarea(page, 2, 7);

    // expect: The popup appears with 'me Co' shown as the selected text in the header
    await expect(page.locator('.selected-text')).toBeVisible();
    await expect(page.locator('.selected-text')).toHaveText('me Co');
  });

  test('5.2 Selecting a single punctuation character does not open the popup', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });

    // 1. Navigate to http://localhost:5173, type 'Hello.' in the textarea
    await textarea.fill('Hello.');

    // 2. Double-click the period '.' at the end of the text
    // '.' is at index 5 in 'Hello.'; selecting only that character simulates the double-click result
    await selectInTextarea(page, 5, 6);

    // expect: No popup appears
    // NOTE: Filtering single punctuation is NOT yet implemented — this assertion
    // is expected to fail against the current code.
    await expect(page.locator('.selection-popup')).not.toBeVisible();
  });

  test('5.3 Selecting an already-mapped word opens the popup again without pre-filling', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });

    // 1. Type 'John Smith', double-click 'John', type 'PERSON_1', click 'Add Mapping'
    await textarea.fill('John Smith');
    await selectInTextarea(page, 0, 4);
    await page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' }).fill('PERSON_1');
    await page.getByRole('button', { name: 'Add Mapping' }).click();

    // expect: Mapping 'John' -> 'PERSON_1' is created
    await expect(page.getByText('Mappings (1)')).toBeVisible();

    // 2. Double-click 'John' again in the textarea
    await selectInTextarea(page, 0, 4);

    // expect: The popup opens again with 'John' in the header
    await expect(page.locator('.selected-text')).toBeVisible();
    await expect(page.locator('.selected-text')).toHaveText('John');

    // expect: The pseudonym field is pre-filled with 'PERSON_1'
    await expect(page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' })).toHaveValue('PERSON_1');

    // expect: The right button is labeled 'Update'
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();

    // 3. Type 'PERSON_ALT' and click 'Update Mapping'
    await page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' }).fill('PERSON_ALT');
    await page.getByRole('button', { name: 'Update' }).click();

    // expect: Mapping updated (count still 1, not duplicated)
    await expect(page.getByText('Mappings (1)')).toBeVisible();
  });

  test('5.4 Popup auto-focuses the pseudonym input so typing immediately works', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });

    // 1. Navigate to http://localhost:5173, type 'John' in the textarea, double-click 'John' to open the popup
    await textarea.fill('John');
    await selectInTextarea(page, 0, 4);

    // expect: The popup opens
    await expect(page.locator('.selection-popup')).toBeVisible();

    // 2. Without clicking the pseudonym input field, immediately type 'PERSON_1'
    // The useEffect in SelectionPopup calls inputRef.current?.focus() on mount,
    // so keystrokes should go directly into the pseudonym field.
    await page.keyboard.type('PERSON_1');

    // expect: The typed text appears in the pseudonym input field, confirming auto-focus
    await expect(page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' })).toHaveValue('PERSON_1');
  });

  test('5.5 Selected text with surrounding whitespace is trimmed in the popup header and mapping', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });

    // 1. Navigate to http://localhost:5173, type 'Hello World' in the textarea
    await textarea.fill('Hello World');

    // 2. Programmatically select ' World' (with a leading space) via setSelectionRange(5, 11)
    //    and dispatch a select event
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(5, 11); // selects ' World' — includes the leading space at index 5
      ta.dispatchEvent(new Event('select', { bubbles: true }));
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    // expect: The popup header shows 'World' (trimmed), not ' World'
    await expect(page.locator('.selected-text')).toBeVisible();
    await expect(page.locator('.selected-text')).toHaveText('World');
  });

  test('5.7 Clicking inside textarea without selecting text does not open the popup', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });

    // 1. Navigate to http://localhost:5173, type 'Hello World' in the textarea
    await textarea.fill('Hello World');

    // 2. Click once inside the textarea (no drag, no double-click) to position
    //    the cursor without selecting text
    await textarea.click();

    // expect: No popup appears because the selection length is 0 and trim() produces ''
    await expect(page.locator('.selection-popup')).not.toBeVisible();
  });
});
