import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

test.describe('Pseudonymized pane — no mappings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByText('No mappings yet').waitFor({ state: 'visible' });
  });

  test('shows empty state instead of input text when no mappings exist', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.fill('Alice and Bob went to the park');
    await expect(textarea).toHaveValue('Alice and Bob went to the park');

    // The pseudonymized pane should NOT show the raw input text
    const pseudoPanel = page.locator('.result-panel-wrapper .panel').first();
    await expect(pseudoPanel.locator('.output-text')).not.toContainText('Alice and Bob');

    // It should show the empty state instead
    await expect(pseudoPanel.getByText('Pseudonymized output')).toBeVisible();
    await expect(pseudoPanel.getByText('Your text with sensitive values replaced will appear here.')).toBeVisible();

    // The Copy button should be disabled
    await expect(pseudoPanel.getByRole('button', { name: 'Copy' })).toBeDisabled();
  });

  test('shows pseudonymized text after a mapping is added', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.fill('Alice and Bob');
    await expect(textarea).toHaveValue('Alice and Bob');

    // Pseudonymized pane starts with empty state
    const pseudoPanel = page.locator('.result-panel-wrapper .panel').first();
    await expect(pseudoPanel.locator('.result-empty-state')).toBeVisible();

    // add a mapping
    const realValueInput = page.getByPlaceholder('Real value');
    const pseudonymInput = page.getByPlaceholder('Pseudonym', { exact: true });
    await realValueInput.fill('Alice');
    await pseudonymInput.fill('PERSON_1');
    await page.getByRole('button', { name: 'Add' }).click();

    // Now the pseudonymized pane should show the replaced text
    await expect(pseudoPanel.locator('.output-text')).toContainText('PERSON_1 and Bob');
    await expect(pseudoPanel.locator('.result-empty-state')).not.toBeVisible();
  });
});
