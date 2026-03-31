// spec: .playwright-mcp/selection-popup.plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Selection Popup — Validation', () => {
  test('Add Mapping button is disabled when pseudonym field is empty', async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.addInitScript(() => {
      localStorage.removeItem('pseudonymizer_mappings_v1');
    });

    // 1. Navigate to http://localhost:5173, type 'John Smith' into the textarea, then double-click 'John'
    await page.goto('http://localhost:5173');
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.fill('John Smith');

    // Programmatically select 'John' (indices 0–4) to open the popup reliably
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(0, 4);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    // expect: Popup appears with a word selected
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeVisible();

    // 2. Observe the 'Add Mapping' button state without typing anything in the pseudonym field
    // expect: The 'Add Mapping' button is disabled and cannot be clicked
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeDisabled();
  });

  test('Add Mapping button is disabled when pseudonym contains only whitespace', async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.addInitScript(() => {
      localStorage.removeItem('pseudonymizer_mappings_v1');
    });

    // 1. Navigate to http://localhost:5173, type 'John Smith' into the textarea, then double-click 'John'
    await page.goto('http://localhost:5173');
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.fill('John Smith');

    // Programmatically select 'John' (indices 0–4) to open the popup reliably
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(0, 4);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    // expect: Popup appears
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeVisible();

    // 2. Type three or more space characters into the pseudonym field
    const pseudonymInput = page.getByPlaceholder('Pseudonym (e.g. PERSON_1)');
    await pseudonymInput.fill('   ');

    // expect: The 'Add Mapping' button remains disabled despite the field appearing to have content
    // (the disabled={!pseudonym.trim()} check trims before validating)
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeDisabled();
  });

  test('Add Mapping button enables as soon as a non-whitespace character is typed', async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.addInitScript(() => {
      localStorage.removeItem('pseudonymizer_mappings_v1');
    });

    // 1. Navigate to http://localhost:5173, type 'John Smith' in the textarea, double-click 'John'
    await page.goto('http://localhost:5173');
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.fill('John Smith');

    // Programmatically select 'John' (indices 0–4) to open the popup reliably
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(0, 4);
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    // expect: Popup appears, 'Add Mapping' button is disabled
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeDisabled();

    // 2. Type a single non-whitespace character (e.g. 'A') into the pseudonym field
    const pseudonymInput = page.getByPlaceholder('Pseudonym (e.g. PERSON_1)');
    await pseudonymInput.fill('A');

    // expect: The 'Add Mapping' button immediately becomes enabled
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeEnabled();

    // 3. Clear the field so it is empty again
    await pseudonymInput.fill('');

    // expect: The 'Add Mapping' button becomes disabled again
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeDisabled();
  });

  test('Selecting only whitespace in the textarea does not open the popup', async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.addInitScript(() => {
      localStorage.removeItem('pseudonymizer_mappings_v1');
    });

    // 1. Navigate to http://localhost:5173, type 'John Smith' in the textarea
    await page.goto('http://localhost:5173');
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.fill('John Smith');

    // expect: Text is present
    await expect(textarea).toHaveValue('John Smith');

    // 2. Programmatically select a single space character between 'John' and 'Smith'
    // via setSelectionRange(4, 5) and dispatch a select event on the textarea
    await textarea.evaluate((el: HTMLTextAreaElement) => {
      el.setSelectionRange(4, 5);
      el.dispatchEvent(new Event('mouseup', { bubbles: true }));
    });

    // expect: The selection popup does NOT appear because the selection text after trimming is empty
    // (the handleSelect callback trims and guards against empty strings)
    await expect(page.getByRole('button', { name: 'Add Mapping' })).not.toBeVisible();
  });
});
