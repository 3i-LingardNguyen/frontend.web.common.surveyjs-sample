# Checklist System - Backend Specification

## 1. Overview

The Checklist System consists of two main parts:

| Component | Description | User Role |
|-----------|-------------|-----------|
| **Checklist Creator** | Create and manage checklist templates | Admin/Manager |
| **Checklist Surveyor** | Fill out and submit checklist answers | Field Worker |

---

## 2. System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHECKLIST SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐              ┌─────────────────────┐               │
│  │  CHECKLIST CREATOR  │              │  CHECKLIST SURVEYOR │               │
│  │  (Admin/Manager)    │              │  (Field Worker)     │               │
│  └──────────┬──────────┘              └──────────┬──────────┘               │
│             │                                    │                          │
│             │ creates                            │ submits                  │
│             ▼                                    ▼                          │
│  ┌─────────────────────┐              ┌─────────────────────┐               │
│  │ ChecklistTemplate   │◄─────────────│   ChecklistAnswer   │               │
│  │                     │  references  │                     │               │
│  │ - id                │              │ - id                │               │
│  │ - title             │              │ - checklistId ──────┼───► Template  │
│  │ - description       │              │ - [questionName]    │               │
│  │ - pages[]           │              │ - [questionName]-Comment            │
│  └─────────────────────┘              │ - [questionName]-Image              │
│                                       └─────────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Relationship

```
ChecklistTemplate (1) ◄──────────────── (*) ChecklistAnswer
       │
       │ contains
       ▼
    Page (1..*)
       │
       │ contains
       ▼
    Element (1..*)
       │
       ├── RadioGroupQuestion (single choice)
       ├── CheckboxQuestion (multiple choice)
       └── Panel (group of questions)
               │
               │ contains
               ▼
            Question (1..*)
               ├── RadioGroupQuestion
               └── CheckboxQuestion
```

### Relationship Rules:
- One `ChecklistTemplate` can have many `ChecklistAnswer` instances
- One `ChecklistTemplate` has one or more `Page`
- One `Page` has one or more `Element`
- `Element` can be: `RadioGroupQuestion`, `CheckboxQuestion`, or `Panel`
- `Panel` can only contain `RadioGroupQuestion` or `CheckboxQuestion` (no nested panels)

---

## 4. Checklist Template Structure

### 4.1 Template Overview

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "pages": [Page]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique template identifier |
| title | string | Yes | Template title |
| description | string | Yes | Template description |
| pages | Page[] | Yes | Array of pages |

### 4.2 Page Structure

```json
{
  "name": "string",
  "elements": [Element]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Unique page identifier (e.g., "page1") |
| elements | Element[] | Yes | Array of questions or panels |

### 4.3 Element Types

There are **3 element types**:

| Type | Value | Selection | Description |
|------|-------|-----------|-------------|
| Radio Group | `radiogroup` | Single | User selects ONE option |
| Checkbox | `checkbox` | Multiple | User selects MULTIPLE options |
| Panel | `panel` | - | Container to group related questions |

---

## 5. Question Types Detail

### 5.1 RadioGroup Question (Single Selection)

User can select **only ONE** option.

```json
{
  "type": "radiogroup",
  "name": "question1",
  "title": "Are all workers wearing required PPE?",
  "description": "Check for helmets, vests, and safety boots",
  "isRequired": true,
  "choices": [
    { "value": "Item 1", "text": "Yes" },
    { "value": "Item 2", "text": "No" }
  ],
  "showOtherItem": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"radiogroup"` | Yes | Fixed value |
| name | string | Yes | Unique question identifier |
| title | string | Yes | Question text shown to user |
| description | string | Yes | Additional info/instructions |
| isRequired | boolean | Yes | Must answer before submit |
| choices | Choice[] | Yes | Available options |
| showOtherItem | boolean | No | Add "Other" option with text input |

### 5.2 Checkbox Question (Multiple Selection)

User can select **MULTIPLE** options.

```json
{
  "type": "checkbox",
  "name": "question3",
  "title": "Select all hazards found:",
  "description": "Check all that apply",
  "isRequired": true,
  "choices": [
    { "value": "Item 1", "text": "Exposed Wiring" },
    { "value": "Item 2", "text": "Wet Floor" },
    { "value": "Item 3", "text": "Blocked Exit" }
  ],
  "showOtherItem": true,
  "showImageUpload": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"checkbox"` | Yes | Fixed value |
| name | string | Yes | Unique question identifier |
| title | string | Yes | Question text shown to user |
| description | string | Yes | Additional info/instructions |
| isRequired | boolean | Yes | Must answer before submit |
| choices | Choice[] | Yes | Available options |
| showOtherItem | boolean | No | Add "Other" option with text input |
| showImageUpload | boolean | No | Allow image attachments |

### 5.3 Choice Object

```json
{
  "value": "Item 1",
  "text": "Yes"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| value | string | Yes | Value stored in answer |
| text | string | Yes | Display text shown to user |

### 5.4 Panel (Question Container)

Groups related questions together.

```json
{
  "type": "panel",
  "name": "panel1",
  "title": "Safety Equipment Section",
  "description": "Check all safety equipment",
  "elements": [
    { "type": "radiogroup", ... },
    { "type": "checkbox", ... }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"panel"` | Yes | Fixed value |
| name | string | Yes | Unique panel identifier |
| title | string | Yes | Panel header text |
| description | string | Yes | Panel description |
| elements | Question[] | Yes | Array of RadioGroup or Checkbox only |

**Note:** Panels can only contain `radiogroup` or `checkbox` questions. Nested panels are NOT allowed.

---

## 6. Question Feature Matrix

| Feature | RadioGroup | Checkbox | Panel |
|---------|:----------:|:--------:|:-----:|
| Single selection | ✅ | ❌ | - |
| Multiple selection | ❌ | ✅ | - |
| showOtherItem | ✅ | ✅ | ❌ |
| showImageUpload | ❌ | ✅ | ❌ |
| Can contain questions | ❌ | ❌ | ✅ |

---

## 7. Answer Structure

### 7.1 Answer Overview

```json
{
  "id": "string",
  "checklistId": "string",
  "[questionName]": "value or array",
  "[questionName]-Comment": "string",
  "[questionName]-Image": [Image]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique answer instance ID |
| checklistId | string | Yes | Reference to template ID |
| [questionName] | string \| string[] | Conditional | Answer value(s) |
| [questionName]-Comment | string | Conditional | Comment when "other" selected |
| [questionName]-Image | Image[] | Conditional | Uploaded images |

### 7.2 Answer Key Patterns

For each question, the answer uses dynamic keys based on the question's `name` field:

| Key Pattern | Type | When Present |
|-------------|------|--------------|
| `{questionName}` | string | RadioGroup answer |
| `{questionName}` | string[] | Checkbox answer |
| `{questionName}-Comment` | string | When user selects "other" |
| `{questionName}-Image` | Image[] | When user uploads images |

### 7.3 Image Object

```json
{
  "name": "photo.png",
  "type": "image/png",
  "content": "base64_encoded_string"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Original filename |
| type | string | Yes | MIME type (image/png, image/jpeg, etc.) |
| content | string | Yes | Base64 encoded image data |

---

## 8. Answer Examples

### 8.1 RadioGroup Answer

**Simple selection:**
```json
{
  "question1": "Item 1"
}
```

**With "Other" option:**
```json
{
  "question1": "other",
  "question1-Comment": "Custom text from user"
}
```

### 8.2 Checkbox Answer

**Multiple selection:**
```json
{
  "question3": ["Item 1", "Item 2", "Item 3"]
}
```

**With "Other" option and Image:**
```json
{
  "question5": ["Item 2", "Item 3", "other"],
  "question5-Comment": "Found additional hazard",
  "question5-Image": [
    {
      "name": "hazard_photo.png",
      "type": "image/png",
      "content": "base64_string_here"
    }
  ]
}
```

### 8.3 Complete Answer Example

```json
{
  "id": "answer_001",
  "checklistId": "template_001",
  "question1": "Item 1",
  "question2": "other",
  "question2-Comment": "Not applicable",
  "question3": ["Item 1", "Item 2"],
  "question5": ["Item 1", "other"],
  "question5-Comment": "See attached photo",
  "question5-Image": [
    {
      "name": "evidence.png",
      "type": "image/png",
      "content": "base64_encoded_data"
    }
  ]
}
```

---

## 9. Validation Rules

### 9.1 Template Validation

| Rule | Description |
|------|-------------|
| Unique IDs | All `name` fields must be unique within a template |
| Non-empty choices | Each question must have at least 1 choice |
| Panel depth | Panels cannot be nested (max depth = 1) |

### 9.2 Answer Validation

| Rule | Description |
|------|-------------|
| Required fields | If `isRequired: true`, answer must be provided |
| Valid values | Answer values must match `choice.value` from template |
| Comment required | If value is "other", `{name}-Comment` should exist |
| Image format | Images must be valid base64 with correct MIME type |

---

## 10. API Considerations

### Suggested Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checklists` | Create new template |
| GET | `/checklists` | List all templates |
| GET | `/checklists/:id` | Get template by ID |
| PUT | `/checklists/:id` | Update template |
| DELETE | `/checklists/:id` | Delete template |
| POST | `/checklists/:id/answers` | Submit answer |
| GET | `/checklists/:id/answers` | List answers for template |
| GET | `/answers/:id` | Get answer by ID |

### Database Schema Suggestion

```
┌──────────────────┐       ┌──────────────────┐
│ checklist_templates│      │ checklist_answers │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ title            │       │ checklist_id (FK)│──► checklist_templates.id
│ description      │       │ data (JSONB)     │
│ pages (JSONB)    │       │ created_at       │
│ created_at       │       │ updated_at       │
│ updated_at       │       │ submitted_by     │
└──────────────────┘       └──────────────────┘
```
