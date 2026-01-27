/**
 * =============================================================================
 * CHECKLIST SYSTEM - TYPESCRIPT TYPE DEFINITIONS
 * =============================================================================
 *
 * This file contains all TypeScript types for the Checklist System.
 * See docs/CHECKLIST_SYSTEM_SPEC.md for full documentation.
 *
 * Two main parts:
 * 1. Checklist Template - Created by Checklist Creator (Admin)
 * 2. Checklist Answer - Submitted by Checklist Surveyor (Field Worker)
 */

// =============================================================================
// PART 1: CHECKLIST TEMPLATE TYPES
// =============================================================================

/**
 * Choice - A selectable option in a question
 *
 * @field value - The value stored in the answer (e.g., "Item 1")
 * @field text  - The display text shown to user (e.g., "Yes")
 */
export interface Choice {
  value: string;
  text: string;
}

/**
 * RadioGroupQuestion - Single selection question
 *
 * User can select ONLY ONE option from the choices.
 *
 * @field type          - Fixed: "radiogroup"
 * @field name          - Unique question ID (used as key in answer)
 * @field title         - Question text shown to user
 * @field description   - Additional instructions
 * @field isRequired    - Must answer before submit
 * @field choices       - Available options
 * @field showOtherItem - (Optional) Add "Other" option with comment input
 */
export interface RadioGroupQuestion {
  type: 'radiogroup';
  name: string;
  title: string;
  description: string;
  isRequired: boolean;
  choices: Choice[];
  showOtherItem?: boolean;
}

/**
 * CheckboxQuestion - Multiple selection question
 *
 * User can select MULTIPLE options from the choices.
 *
 * @field type            - Fixed: "checkbox"
 * @field name            - Unique question ID (used as key in answer)
 * @field title           - Question text shown to user
 * @field description     - Additional instructions
 * @field isRequired      - Must answer before submit
 * @field choices         - Available options
 * @field showOtherItem   - (Optional) Add "Other" option with comment input
 * @field showImageUpload - (Optional) Allow image attachments
 */
export interface CheckboxQuestion {
  type: 'checkbox';
  name: string;
  title: string;
  description: string;
  isRequired: boolean;
  choices: Choice[];
  showOtherItem?: boolean;
  showImageUpload?: boolean;
}

/**
 * Question - Union of all question types
 */
export type Question = RadioGroupQuestion | CheckboxQuestion;

/**
 * PanelElement - Container to group related questions
 *
 * NOTE: Panels can only contain RadioGroup or Checkbox questions.
 *       Nested panels are NOT allowed.
 *
 * @field type        - Fixed: "panel"
 * @field name        - Unique panel ID
 * @field title       - Panel header text
 * @field description - Panel description
 * @field elements    - Array of questions inside this panel
 */
export interface PanelElement {
  type: 'panel';
  name: string;
  title: string;
  description: string;
  elements: Question[]; // Only RadioGroup or Checkbox, no nested panels
}

/**
 * PageElement - An element on a page (Question or Panel)
 */
export type PageElement = Question | PanelElement;

/**
 * ChecklistPage - A page containing elements
 *
 * @field name     - Unique page ID (e.g., "page1")
 * @field elements - Array of questions and panels
 */
export interface ChecklistPage {
  name: string;
  elements: PageElement[];
}

/**
 * ChecklistTemplate - The main template structure
 *
 * Created by Checklist Creator (Admin/Manager).
 * Used as a template for surveyors to fill out.
 *
 * @field id          - Unique template ID
 * @field title       - Template title
 * @field description - Template description
 * @field pages       - Array of pages
 */
export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  pages: ChecklistPage[];
}

// =============================================================================
// PART 2: CHECKLIST ANSWER TYPES
// =============================================================================

/**
 * AnswerImage - An uploaded image attachment
 *
 * @field name    - Original filename (e.g., "photo.png")
 * @field type    - MIME type (e.g., "image/png", "image/jpeg")
 * @field content - Base64 encoded image data
 */
export interface AnswerImage {
  name: string;
  type: string;
  content: string;
}

/**
 * ChecklistAnswer - A submitted answer instance
 *
 * Created by Checklist Surveyor (Field Worker).
 * Contains answers for all questions in a template.
 *
 * ## Fixed Fields
 * @field id          - Unique answer ID
 * @field checklistId - Reference to template ID
 *
 * ## Dynamic Fields (based on question names)
 *
 * For each question, the answer uses these key patterns:
 *
 * | Key Pattern              | Type         | Description                    |
 * |--------------------------|--------------|--------------------------------|
 * | {questionName}           | string       | RadioGroup answer (single)     |
 * | {questionName}           | string[]     | Checkbox answer (multiple)     |
 * | {questionName}-Comment   | string       | Comment when "other" selected  |
 * | {questionName}-Image     | AnswerImage[]| Uploaded images                |
 *
 * ## Examples
 *
 * RadioGroup answer:
 *   "question1": "Item 1"
 *
 * RadioGroup with "other":
 *   "question1": "other"
 *   "question1-Comment": "Custom text"
 *
 * Checkbox answer:
 *   "question3": ["Item 1", "Item 2", "Item 3"]
 *
 * Checkbox with "other" and image:
 *   "question5": ["Item 2", "other"]
 *   "question5-Comment": "See photo"
 *   "question5-Image": [{ name: "...", type: "...", content: "..." }]
 */
export interface ChecklistAnswer {
  /** Unique answer ID */
  id: string;

  /** Reference to template ID */
  checklistId: string;

  /** Dynamic answer fields - indexed by question name */
  [questionName: string]: string | string[] | AnswerImage[] | undefined;
}

// =============================================================================
// TYPE GUARDS (Helper functions to check element types)
// =============================================================================

/** Check if element is a RadioGroup question */
export function isRadioGroupQuestion(element: PageElement): element is RadioGroupQuestion {
  return element.type === 'radiogroup';
}

/** Check if element is a Checkbox question */
export function isCheckboxQuestion(element: PageElement): element is CheckboxQuestion {
  return element.type === 'checkbox';
}

/** Check if element is a Panel */
export function isPanelElement(element: PageElement): element is PanelElement {
  return element.type === 'panel';
}

/** Check if element is any Question (RadioGroup or Checkbox) */
export function isQuestion(element: PageElement): element is Question {
  return element.type === 'radiogroup' || element.type === 'checkbox';
}

// =============================================================================
// ANSWER KEY HELPERS
// =============================================================================

/** Answer key suffixes */
export const ANSWER_KEY_SUFFIX = {
  COMMENT: '-Comment',
  IMAGE: '-Image',
} as const;

/** Get comment key for a question (e.g., "question1" -> "question1-Comment") */
export function getCommentKey(questionName: string): string {
  return `${questionName}${ANSWER_KEY_SUFFIX.COMMENT}`;
}

/** Get image key for a question (e.g., "question1" -> "question1-Image") */
export function getImageKey(questionName: string): string {
  return `${questionName}${ANSWER_KEY_SUFFIX.IMAGE}`;
}
