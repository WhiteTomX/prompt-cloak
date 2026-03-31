// spec: specs/mapping-pseudonymization.plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Mapping creation and pseudonymization', () => {
  test('Add input text containing two words and create a mapping for one of them via the sidebar form', async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.addInitScript(() => {
      localStorage.removeItem('pseudonymizer_mappings_v1');
    });

    // 1. Navigate to http://localhost:5173/ and confirm the page loads with an empty state
    await page.goto('http://localhost:5173/');

    // expect: The page heading 'Prompt Cloak' is visible
    await expect(page.getByRole('heading', { name: 'Prompt Cloak', level: 1 })).toBeVisible();

    // expect: The Input textarea contains no text
    await expect(page.getByPlaceholder('Paste your text here. Select any sensitive word or phrase to pseudonymize it.')).toHaveValue('');

    // expect: The MappingSidebar shows 'No mappings yet' and 'Mappings (0)' in the header
    await expect(page.getByRole('heading', { name: 'Mappings (0)' })).toBeVisible();
    await expect(page.getByText('No mappings yet')).toBeVisible();

    // expect: The Pseudonymized output panel shows the placeholder
    await expect(page.getByText('Pseudonymized output will appear here once you add mappings and type in the input.')).toBeVisible();

    // 2. Click inside the Input textarea and type the text: 'Alice and Bob'
    const inputTextarea = page.getByPlaceholder('Paste your text here. Select any sensitive word or phrase to pseudonymize it.');
    await inputTextarea.click();
    await inputTextarea.fill('Alice and Bob');

    // expect: The textarea contains the text 'Alice and Bob'
    await expect(inputTextarea).toHaveValue('Alice and Bob');

    // 3. In the MappingSidebar AddMappingForm, click the 'Real value' input field and type 'Alice'
    const addMappingForm = page.locator('form');
    const realValueInput = addMappingForm.getByPlaceholder('Real value');
    await realValueInput.click();
    await realValueInput.fill('Alice');

    // expect: The Real value input contains 'Alice'
    await expect(realValueInput).toHaveValue('Alice');

    // expect: The Add button remains disabled because the Pseudonym field is still empty
    await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled();

    // 4. Click the 'Pseudonym' input field in the AddMappingForm and type 'Person1'
    const pseudonymInput = addMappingForm.getByPlaceholder('Pseudonym', { exact: true });
    await pseudonymInput.click();
    await pseudonymInput.fill('Person1');

    // expect: The Pseudonym input contains 'Person1'
    await expect(pseudonymInput).toHaveValue('Person1');

    // expect: The Add button becomes enabled because both required fields are now filled
    await expect(page.getByRole('button', { name: 'Add' })).toBeEnabled();

    // 5. Leave the category dropdown set to its default value ('Name') and click the 'Add' button
    await page.getByRole('button', { name: 'Add' }).click();

    // expect: The AddMappingForm clears both the Real value and Pseudonym input fields after submission
    await expect(realValueInput).toHaveValue('');
    await expect(pseudonymInput).toHaveValue('');

    // expect: The MappingSidebar header now reads 'Mappings (1)'
    await expect(page.getByRole('heading', { name: 'Mappings (1)' })).toBeVisible();

    // expect: The mapping list shows one row with 'Alice' in the real-value column, 'Person1' in the pseudonym column, and a category badge labelled 'Name'
    await expect(page.getByTitle('Real value')).toHaveValue('Alice');
    await expect(page.getByTitle('Pseudonym')).toHaveValue('Person1');
    await expect(page.locator('.category-badge').filter({ hasText: 'Name' })).toBeVisible();

    // expect: The 'No mappings yet' empty state is no longer visible
    await expect(page.getByText('No mappings yet')).not.toBeVisible();

    // 6. Inspect the Pseudonymized output panel (labelled 'Pseudonymized — Send to AI')
    await expect(page.getByRole('heading', { name: 'Pseudonymized — Send to AI' })).toBeVisible();

    // expect: The output text reads 'Person1 and Bob'
    await expect(page.locator('.output-text').first()).toHaveText('Person1 and Bob');

    // expect: 'Alice' has been replaced by 'Person1'
    await expect(page.locator('.output-text').first()).not.toContainText('Alice');

    // expect: 'Bob' is unchanged because no mapping exists for it
    await expect(page.locator('.output-text').first()).toContainText('Bob');

    // expect: The placeholder text is no longer visible in this panel
    await expect(page.getByText('Pseudonymized output will appear here once you add mappings and type in the input.')).not.toBeVisible();
  });
});
