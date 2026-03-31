# Mapping (Pseudonymization) Feature Test Plan

## Application Overview

Prompt Cloak is a fully static React SPA that pseudonymizes personally identifiable information (PII) before the user sends text to an AI assistant. The core workflow is: (1) the user types or pastes text into the Input panel, (2) the user creates PII mappings that map real values to pseudonyms, (3) the Pseudonymized panel shows the input text with all mapped real values replaced by their pseudonyms, and (4) the user can paste the AI response back to have pseudonyms replaced with the original real values. Mappings can be created either by selecting text in the input textarea (triggering an inline SelectionPopup) or by filling in the AddMappingForm in the sidebar. All mappings are listed in the MappingSidebar and persisted to localStorage.

## Test Scenarios

### 1. Mapping creation and pseudonymization

**Seed:** `seed.spec.ts`

#### 1.1. Add input text containing two words and create a mapping for one of them via the sidebar form

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and confirm the page loads with an empty state: the Input textarea is empty, the sidebar shows 'No mappings yet', and the Pseudonymized output panel shows its placeholder text.
    - expect: The page heading 'Prompt Cloak' is visible.
    - expect: The Input textarea contains no text.
    - expect: The MappingSidebar shows 'No mappings yet' and 'Mappings (0)' in the header.
    - expect: The Pseudonymized output panel shows the placeholder 'Pseudonymized output will appear here once you add mappings and type in the input.'
  2. Click inside the Input textarea (labelled 'Input — Your Text') and type the text: 'Alice and Bob'.
    - expect: The textarea contains the text 'Alice and Bob'.
    - expect: The character count at the bottom of the panel updates to '13 chars'.
    - expect: The Pseudonymized output panel still shows the placeholder (no mappings have been added yet).
  3. In the MappingSidebar AddMappingForm, click the 'Real value' input field and type 'Alice'.
    - expect: The Real value input contains 'Alice'.
    - expect: The Add button remains disabled because the Pseudonym field is still empty.
  4. Click the 'Pseudonym' input field in the AddMappingForm and type 'Person1'.
    - expect: The Pseudonym input contains 'Person1'.
    - expect: The Add button becomes enabled because both required fields are now filled.
  5. Leave the category dropdown set to its default value ('Name') and click the 'Add' button.
    - expect: The AddMappingForm clears both the Real value and Pseudonym input fields after submission.
    - expect: The MappingSidebar header now reads 'Mappings (1)'.
    - expect: The mapping list shows one row with 'Alice' in the real-value column, 'Person1' in the pseudonym column, and a category badge labelled 'Name'.
    - expect: The 'No mappings yet' empty state is no longer visible.
  6. Inspect the Pseudonymized output panel (labelled 'Pseudonymized — Send to AI').
    - expect: The output text reads 'Person1 and Bob'.
    - expect: 'Alice' has been replaced by 'Person1'.
    - expect: 'Bob' is unchanged because no mapping exists for it.
    - expect: The placeholder text is no longer visible in this panel.

#### 1.2. Create a mapping for 'Alice' via the inline SelectionPopup by selecting text in the textarea

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ to start with a fresh, empty state.
    - expect: The input textarea is empty.
    - expect: The sidebar shows 'Mappings (0)' and 'No mappings yet'.
  2. Click inside the Input textarea and type 'Alice and Bob'.
    - expect: The textarea contains 'Alice and Bob'.
  3. Using the mouse, click and drag to select only the word 'Alice' inside the textarea.
    - expect: The word 'Alice' is highlighted/selected in the textarea.
    - expect: A SelectionPopup appears near the selection, showing the selected text 'Alice' at the top.
    - expect: The popup contains a category dropdown (defaulting to 'Name'), a pseudonym text input, a 'Cancel' button, and a disabled 'Add Mapping' button.
  4. In the SelectionPopup pseudonym input (placeholder 'Pseudonym (e.g. PERSON_1)'), type 'Person1'.
    - expect: The pseudonym input contains 'Person1'.
    - expect: The 'Add Mapping' button becomes enabled.
  5. Click the 'Add Mapping' button in the SelectionPopup.
    - expect: The SelectionPopup closes.
    - expect: The MappingSidebar header now reads 'Mappings (1)'.
    - expect: The sidebar mapping list shows one row: real value 'Alice', pseudonym 'Person1', category badge 'Name'.
    - expect: The Pseudonymized output panel shows 'Person1 and Bob', with 'Alice' replaced and 'Bob' unchanged.

#### 1.3. Verify 'Bob' is not replaced when only 'Alice' has a mapping

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ to start fresh.
    - expect: The page is in a clean state with no mappings and empty input.
  2. Type 'Alice and Bob' into the Input textarea.
    - expect: The textarea contains 'Alice and Bob'.
  3. Add a mapping with real value 'Alice' and pseudonym 'Person1' using the AddMappingForm in the sidebar.
    - expect: The sidebar shows 'Mappings (1)' with the Alice -> Person1 mapping row.
  4. Read the text content of the Pseudonymized output panel.
    - expect: The output text is exactly 'Person1 and Bob'.
    - expect: The substring 'Bob' appears verbatim and is not altered in any way.
    - expect: The substring 'Alice' does not appear anywhere in the output.
    - expect: The substring 'Person1' appears exactly once.
  5. Add a second mapping with real value 'Bob' and pseudonym 'Person2' using the AddMappingForm.
    - expect: The sidebar header updates to 'Mappings (2)'.
    - expect: The Pseudonymized output panel now shows 'Person1 and Person2'.
    - expect: Neither 'Alice' nor 'Bob' appears in the output.

#### 1.4. Mapping appears correctly in the mappings list after creation

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ to start fresh.
    - expect: The sidebar shows 'Mappings (0)' and the empty state message.
  2. In the AddMappingForm, fill in 'Alice' as the real value, 'Person1' as the pseudonym, and leave the category as 'Name'. Click Add.
    - expect: The form fields clear after submission.
  3. Inspect the mapping row that appears in the sidebar list.
    - expect: The mapping row contains an input field with value 'Alice' (the real value).
    - expect: The mapping row contains an input field with value 'Person1' (the pseudonym).
    - expect: The mapping row displays a category badge reading 'Name'.
    - expect: The mapping row contains a remove button (labelled '×' with title 'Remove mapping').
    - expect: The sidebar header reads 'Mappings (1)'.
  4. Add a second mapping with real value 'Bob', pseudonym 'Person2', and category 'Name'. Click Add.
    - expect: The sidebar header updates to 'Mappings (2)'.
    - expect: Two mapping rows are visible in the list: one for Alice/Person1 and one for Bob/Person2.
    - expect: Each row is independently editable and has its own remove button.

#### 1.5. Remove a mapping and verify the pseudonymized output reverts

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ to start fresh.
    - expect: The page is in a clean empty state.
  2. Type 'Alice and Bob' into the Input textarea.
    - expect: The textarea contains 'Alice and Bob'.
  3. Add a mapping: real value 'Alice', pseudonym 'Person1', category 'Name'.
    - expect: The Pseudonymized panel shows 'Person1 and Bob'.
  4. Click the '×' remove button on the Alice/Person1 mapping row in the sidebar.
    - expect: The mapping row disappears from the list.
    - expect: The sidebar header reverts to 'Mappings (0)'.
    - expect: The 'No mappings yet' empty state reappears.
    - expect: The Pseudonymized output panel reverts to its placeholder text (or shows the original unaltered input if mappings are required for output to appear).

#### 1.6. Inline SelectionPopup can be cancelled without creating a mapping

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and type 'Alice and Bob' in the Input textarea.
    - expect: The textarea contains 'Alice and Bob'.
  2. Select the word 'Alice' in the textarea with the mouse.
    - expect: The SelectionPopup appears showing 'Alice' and the pseudonym input.
  3. Click the 'Cancel' button inside the SelectionPopup.
    - expect: The SelectionPopup closes without creating a mapping.
    - expect: The sidebar still shows 'Mappings (0)' and 'No mappings yet'.
    - expect: The Pseudonymized output panel still shows its placeholder.

#### 1.7. Inline SelectionPopup dismisses on Escape key

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and type 'Alice and Bob' in the Input textarea.
    - expect: The textarea contains 'Alice and Bob'.
  2. Select the word 'Alice' in the textarea with the mouse.
    - expect: The SelectionPopup appears.
  3. Press the Escape key on the keyboard.
    - expect: The SelectionPopup closes without creating any mapping.
    - expect: The sidebar still shows 'Mappings (0)' and 'No mappings yet'.

#### 1.8. AddMappingForm 'Add' button is disabled when fields are empty or partially filled

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ to start fresh.
    - expect: The Add button in the AddMappingForm is disabled because both Real value and Pseudonym fields are empty.
  2. Type 'Alice' into the Real value field only, leaving Pseudonym empty.
    - expect: The Add button remains disabled.
  3. Clear the Real value field and type 'Person1' into the Pseudonym field only.
    - expect: The Add button remains disabled.
  4. Type 'Alice' back into the Real value field (so both fields are filled).
    - expect: The Add button becomes enabled.

#### 1.9. Pseudonymization is case-sensitive by default — 'alice' (lowercase) is not replaced when mapping is for 'Alice'

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ to start fresh.
    - expect: The page is in a clean empty state.
  2. Type 'alice and Alice' into the Input textarea.
    - expect: The textarea contains 'alice and Alice'.
  3. Add a mapping with real value 'Alice' (capital A), pseudonym 'Person1', category 'Name'.
    - expect: The sidebar shows 'Mappings (1)' with the Alice -> Person1 row.
  4. Inspect the Pseudonymized output panel.
    - expect: The output contains 'Person1' where 'Alice' (capital A) appeared.
    - expect: The lowercase 'alice' is preserved unchanged (case-sensitive replacement is the default per the PiiMapping caseSensitive field).

#### 1.10. Clear all mappings removes every mapping at once

**File:** `specs/mapping-pseudonymization.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and type 'Alice and Bob' into the Input textarea.
    - expect: The textarea contains 'Alice and Bob'.
  2. Add a mapping for Alice -> Person1 and a second mapping for Bob -> Person2 using the AddMappingForm.
    - expect: The sidebar header reads 'Mappings (2)'.
    - expect: The Pseudonymized output shows 'Person1 and Person2'.
  3. Click the 'Clear all' button in the sidebar header.
    - expect: All mapping rows are removed from the list.
    - expect: The sidebar header reverts to 'Mappings (0)'.
    - expect: The 'No mappings yet' empty state is shown.
    - expect: The 'Clear all' button becomes disabled.
    - expect: The Pseudonymized output panel reverts to its placeholder or shows unmodified input text.
