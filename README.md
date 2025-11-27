# Jahia Formidable Builder

This module provides a modern, integrated form builder for Jahia using Moonstone UI and Apollo GraphQL. It replaces the legacy standalone builder with a Jahia UI Extension that allows creating, editing, and managing Formidable forms directly within the Jahia interface.

## Features

- **Form Creation & Management**: Create and manage forms with a user-friendly interface
- **Drag & Drop Builder**: Intuitive drag-and-drop interface for arranging form steps and fields
- **Live Preview**: Test forms in real-time with interactive preview mode
- **Form Settings**: Configure form appearance with custom CSS, button labels, and response messages
- **Multilingual Support**: Full internationalization support with language-specific content
- **JCR Integration**: Seamless integration with Jahia's JCR for content persistence
- **Extensible Field Types**: Support for various input types (text, email, select, checkboxes, radio buttons, etc.)

## Architecture Overview

- **UI Shell** – Registered as a JContent accordion item (`/form-builder`). The app renders inside Jahia's router and uses the UI Extender registry.
- **Apollo Client** – Shared singleton configured against `…/modules/graphql` with authenticated requests.
- **Context Provider** – Exposes workspace, language, site key, and target path for forms to every component.
- **Views**:
  - **Form List** – Moonstone table listing all `fmdb:form` nodes with create functionality
  - **Form Builder** – Three-column workspace with step sidebar, step/field editor, and live preview
  - **Form Settings** – Comprehensive settings panel for form configuration (CSS, buttons, messages)
  - **Form Preview** – Interactive preview mode for testing forms with tabbed navigation
- **GraphQL** – Custom queries/mutations map to Formidable node types (`fmdb:form`, `fmdb:fieldset`, `fmdb:inputText`, `fmdb:select`, etc.) and handle multilingual properties
- **Internationalization** – Namespace `form-builder`, bundles stored in `src/main/resources/javascript/locales/form-builder_<lang>.json`

## Development

```bash
npm install         # Install dependencies
npm run dev         # Watch mode with incremental builds
npm run build       # Lint and webpack bundle into src/main/resources/javascript/apps
npm run build:production  # Production build
```

The module bundles are copied into `src/main/resources/javascript/apps` and automatically exposed through module federation (`package.json > dx-extends`).

## Deployment

1. `mvn clean install` (or build with your Jahia pipeline) to produce the module JAR
2. Deploy the JAR to your Jahia instance
3. Install the module on the target site
4. The builder appears as **Forms** in JContent's accordion and is accessible via the `/form-builder` route

## Usage

### Creating a Form
1. Navigate to JContent and select the Forms accordion item
2. Click "Create Form" to start a new form
3. Add steps and fields using the drag-and-drop interface
4. Configure form settings (CSS styling, button labels, messages)
5. Use the preview mode to test the form interactively

### Form Settings
- **Basic Settings**: Form title and introduction text
- **Response Messages**: Success and error messages
- **Button Configuration**: Customize submit, reset, new form, and try again buttons
- **Style Settings**: Apply custom CSS for form styling

### Preview Mode
- Switch to preview mode to test the form
- Navigate between steps using tabs
- Fill out fields and test button functionality
- Custom CSS is applied in real-time

## Key Packages

- `@apollo/client` – GraphQL queries, caching, and mutations
- `@jahia/moonstone` & `@jahia/design-system-kit` – UI components, layout, inputs, toolbar, table
- `@dnd-kit/core`, `@dnd-kit/sortable` – Drag and drop functionality for steps/fields
- `react-i18next` – Internationalization support
- `lexical` – Rich text editing for form content

## Extensibility

- **Form Types & Fields**: Defined in `src/javascript/constants/formBuilder.js`. Add new Formidable node types here to extend available components
- **GraphQL Operations**: Located in `src/javascript/graphql`. Use `setPropertiesBatch` for additional attributes
- **Styling**: Scoped SCSS files co-located with components (`FormListView.scss`, `FormBuilder.scss`, `FormPreview.scss`)
- **Translations**: Add new keys to locale files in `src/main/resources/javascript/locales/`

## Testing

Currently, there are no automated tests. When adding features:

- Test GraphQL mutations against a Jahia sandbox to verify node creation and translations
- Run `npm run lint` before committing
- Use the preview mode to manually test form functionality

## Support

Open an issue in the repository or contact the DX/Front-end team via Slack.
