// spec: Selection Popup — Happy Path
// seed: default (navigate to http://localhost:5173)

import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

/** Helper: select a word in the textarea by name and fire mouseup so the popup appears. */
async function selectWordInTextarea(page: import('@playwright/test').Page, word: string) {
  await page.evaluate((w) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const text = textarea.value;
    const start = text.indexOf(w);
    const end = start + w.length;
    textarea.focus();
    textarea.setSelectionRange(start, end);
    textarea.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }, word);
}

test.describe('Selection Popup — Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    // Clear any persisted mappings from localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByText('No mappings yet').waitFor({ state: 'visible' });
  });

  test('1.1 Double-click a single word to open the selection popup', async ({ page }) => {
    // 1. Verify the app loads with the textarea empty and 'No mappings yet'
    await expect(page.getByRole('textbox', { name: 'Paste your text here. Select' })).toBeVisible();
    await expect(page.getByText('No mappings yet')).toBeVisible();

    // 2. Click the input textarea and type the test sentence
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.pressSequentially('My name is John Smith and I work at Acme Corp');

    // Verify textarea has text
    await expect(textarea).toHaveValue('My name is John Smith and I work at Acme Corp');

    // Verify char count updates
    await expect(page.getByText('45 chars')).toBeVisible();

    // Verify Pseudonymized panel mirrors the input (no mappings exist)
    await expect(page.locator('.panel-body').filter({ hasText: 'My name is John Smith' }).first()).toBeVisible();

    // 3. Double-click the word 'John' inside the input textarea to open the popup
    await selectWordInTextarea(page, 'John');

    // Verify a floating popup appears with the selected text 'John' in the header
    await expect(page.getByText('John').first()).toBeVisible();

    // Verify the category dropdown defaults to 'Name'
    const categorySelect = page.locator('form').filter({
      hasText: 'NameEmailAddressPhoneDate of BirthID NumberCompanyOtherCancelAdd Mapping',
    }).getByRole('combobox');
    await expect(categorySelect).toHaveValue('name');

    // Verify the pseudonym input is empty with correct placeholder
    const pseudonymInput = page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' });
    await expect(pseudonymInput).toBeVisible();
    await expect(pseudonymInput).toHaveValue('');
    await expect(pseudonymInput).toBeFocused();

    // Verify 'Add Mapping' button is disabled
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeDisabled();

    // Verify 'Cancel' button is enabled
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  test('1.2 Create a mapping using the selection popup and verify pseudonymization', async ({ page }) => {
    // 1. Navigate to the app and type text
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.pressSequentially('My name is John Smith and I work at Acme Corp');
    await expect(textarea).toHaveValue('My name is John Smith and I work at Acme Corp');

    // 2. Double-click the word 'John' to open the selection popup
    await selectWordInTextarea(page, 'John');
    await expect(page.getByText('John').first()).toBeVisible();

    // 3. Leave category as 'Name' and type 'PERSON_1' into the pseudonym input
    const pseudonymInput = page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' });
    await pseudonymInput.fill('PERSON_1');
    await expect(pseudonymInput).toHaveValue('PERSON_1');

    // Verify 'Add Mapping' becomes enabled
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeEnabled();

    // 4. Click the 'Add Mapping' button
    await page.getByRole('button', { name: 'Add Mapping' }).click();

    // Verify popup closes (pseudonym input no longer visible)
    await expect(page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' })).not.toBeVisible();

    // Verify the Mappings panel heading updates to 'Mappings (1)'
    await expect(page.getByText('Mappings (1)')).toBeVisible();

    // Verify a mapping row shows 'John' | 'PERSON_1' with 'Name' badge and '×' button
    const mappingRow = page.locator('.mapping-row').first();
    await expect(mappingRow.getByRole('textbox', { name: 'Real value' })).toHaveValue('John');
    await expect(mappingRow.getByRole('textbox', { name: 'Pseudonym' })).toHaveValue('PERSON_1');
    await expect(mappingRow.getByText('Name')).toBeVisible();
    await expect(mappingRow.getByRole('button', { name: /Remove mapping/ })).toBeVisible();

    // Verify Pseudonymized output replaces 'John' with 'PERSON_1'
    await expect(page.locator('.panel-body').filter({ hasText: 'PERSON_1' }).first()).toBeVisible();

    // Verify 'Clear all' becomes enabled
    await expect(page.getByRole('button', { name: 'Clear all' })).toBeEnabled();

    // Verify 'Export JSON' becomes enabled
    await expect(page.getByRole('button', { name: 'Export JSON' })).toBeEnabled();
  });

  test('1.3 Submit the popup form using the Enter key', async ({ page }) => {
    // 1. Type text into the textarea
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.pressSequentially('Contact Smith for details');
    await expect(textarea).toHaveValue('Contact Smith for details');

    // 2. Double-click 'Smith' to open the popup
    await selectWordInTextarea(page, 'Smith');
    await expect(page.getByText('Smith').first()).toBeVisible();

    // Verify pseudonym input is auto-focused
    const pseudonymInput = page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' });
    await expect(pseudonymInput).toBeFocused();

    // 3. Type 'PERSON_2' in the pseudonym field
    await pseudonymInput.fill('PERSON_2');

    // Verify 'Add Mapping' button becomes enabled
    await expect(page.getByRole('button', { name: 'Add Mapping' })).toBeEnabled();

    // 4. Press the Enter key
    await page.keyboard.press('Enter');

    // Verify popup closes
    await expect(page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' })).not.toBeVisible();

    // Verify mapping 'Smith' -> 'PERSON_2' is added
    await expect(page.getByText('Mappings (1)')).toBeVisible();
    const mappingRow = page.locator('.mapping-row').first();
    await expect(mappingRow.getByRole('textbox', { name: 'Real value' })).toHaveValue('Smith');
    await expect(mappingRow.getByRole('textbox', { name: 'Pseudonym' })).toHaveValue('PERSON_2');

    // Verify Pseudonymized panel updates to replace 'Smith' with 'PERSON_2'
    await expect(page.locator('.panel-body').filter({ hasText: 'PERSON_2' }).first()).toBeVisible();
  });

  test('1.4 Select a different category before adding a mapping', async ({ page }) => {
    // 1. Type text into the textarea
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.pressSequentially('I work at Acme Corp');
    await expect(textarea).toHaveValue('I work at Acme Corp');

    // 2. Double-click 'Acme' to open the popup
    await selectWordInTextarea(page, 'Acme');
    await expect(page.getByText('Acme').first()).toBeVisible();

    // Verify category defaults to 'Name'
    const categorySelect = page.locator('form').filter({
      hasText: 'NameEmailAddressPhoneDate of BirthID NumberCompanyOtherCancelAdd Mapping',
    }).getByRole('combobox');
    await expect(categorySelect).toHaveValue('name');

    // 3. Change the category dropdown from 'Name' to 'Company'
    await categorySelect.selectOption('company');
    await expect(categorySelect).toHaveValue('company');

    // 4. Type 'COMPANY_1' in the pseudonym field and click 'Add Mapping'
    const pseudonymInput = page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' });
    await pseudonymInput.fill('COMPANY_1');
    await page.getByRole('button', { name: 'Add Mapping' }).click();

    // Verify the mapping row shows 'Company' category badge instead of 'Name'
    const mappingRow = page.locator('.mapping-row').first();
    await expect(mappingRow.getByText('Company')).toBeVisible();
    await expect(mappingRow.getByRole('textbox', { name: 'Real value' })).toHaveValue('Acme');
    await expect(mappingRow.getByRole('textbox', { name: 'Pseudonym' })).toHaveValue('COMPANY_1');
  });

  test('1.5 Create multiple mappings sequentially via selection popup', async ({ page }) => {
    // 1. Type text into the textarea
    const textarea = page.getByRole('textbox', { name: 'Paste your text here. Select' });
    await textarea.click();
    await textarea.pressSequentially('John Smith works at Acme Corp');
    await expect(textarea).toHaveValue('John Smith works at Acme Corp');

    // 2. Double-click 'John', type 'PERSON_1', and click 'Add Mapping'
    await selectWordInTextarea(page, 'John');
    await expect(page.getByText('John').first()).toBeVisible();
    await page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' }).fill('PERSON_1');
    await page.getByRole('button', { name: 'Add Mapping' }).click();

    // Verify mappings count shows 1
    await expect(page.getByText('Mappings (1)')).toBeVisible();

    // Verify Pseudonymized output shows 'PERSON_1 Smith works at Acme Corp'
    await expect(page.locator('.panel-body').filter({ hasText: 'PERSON_1 Smith works at Acme Corp' }).first()).toBeVisible();

    // 3. Double-click 'Smith', type 'PERSON_2', and click 'Add Mapping'
    await selectWordInTextarea(page, 'Smith');
    await expect(page.getByText('Smith').first()).toBeVisible();
    await page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' }).fill('PERSON_2');
    await page.getByRole('button', { name: 'Add Mapping' }).click();

    // Verify mappings count shows 2
    await expect(page.getByText('Mappings (2)')).toBeVisible();

    // Verify Pseudonymized output shows 'PERSON_1 PERSON_2 works at Acme Corp'
    await expect(page.locator('.panel-body').filter({ hasText: 'PERSON_1 PERSON_2 works at Acme Corp' }).first()).toBeVisible();

    // 4. Double-click 'Acme', change category to 'Company', type 'COMPANY_1', and click 'Add Mapping'
    await selectWordInTextarea(page, 'Acme');
    await expect(page.getByText('Acme').first()).toBeVisible();
    const categorySelect = page.locator('form').filter({
      hasText: 'NameEmailAddressPhoneDate of BirthID NumberCompanyOtherCancelAdd Mapping',
    }).getByRole('combobox');
    await categorySelect.selectOption('company');
    await page.getByRole('textbox', { name: 'Pseudonym (e.g. PERSON_1)' }).fill('COMPANY_1');
    await page.getByRole('button', { name: 'Add Mapping' }).click();

    // Verify mappings count shows 3
    await expect(page.getByText('Mappings (3)')).toBeVisible();

    // Verify Pseudonymized output shows 'PERSON_1 PERSON_2 works at COMPANY_1 Corp'
    await expect(page.locator('.panel-body').filter({ hasText: 'PERSON_1 PERSON_2 works at COMPANY_1 Corp' }).first()).toBeVisible();
  });
});
