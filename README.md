# Jahia Formidable Builder

This module replaces the legacy standalone builder with a Jahia UI Extension that uses Moonstone and Apollo to create, edit and persist Formidable content.

## Architecture Overview

- **UI shell** – registered as a JContent accordion item (`/form-builder`). The app renders inside Jahia’s router and relies on the UI Extender registry.
- **Apollo Client** – shared singleton configured against `…/modules/graphql` with authenticated requests.
- **Context provider** – exposes workspace, language, site key, and target path for forms to every component.
- **Views**
  - **Form list** – Moonstone table listing every `fmdb:form`, plus a create panel.
  - **Form builder** – three-column workspace with step sidebar, step + field editor, and live JSON preview.
  - **Drag and drop** – powered by `@dnd-kit` for step/field re-ordering, persisted immediately through GraphQL mutations.
- **GraphQL** – custom queries/mutations map to the Formidable node types (`fmdb:form`, `fmdb:fieldset`, `fmdb:inputText`, `fmdb:select`, …) and update multilingual properties.
- **Internationalization** – namespace `form-builder`, bundles stored in `src/main/resources/javascript/locales/form-builder_<lang>.json`.

## Development

```
yarn install         # install dependencies (place an empty yarn.lock in this folder if Yarn workspaces complain)
yarn dev             # watch + incremental builds
yarn build           # lint + webpack bundle into src/main/resources/javascript/apps
yarn build:production
```

The module bundles are copied into `src/main/resources/javascript/apps` and automatically exposed through module federation (`package.json > dx-extends`).

## Deployment

1. `mvn clean install` (or build with your Jahia pipeline) to produce the module JAR.
2. Deploy the JAR to your Jahia instance.
3. Install the module on the target site. The builder appears as **Forms** inside JContent’s accordion and route `/form-builder`.

## Key Packages

- `@apollo/client` – GraphQL queries, caching and mutations.
- `@jahia/moonstone` & `@jahia/design-system-kit` – layout, inputs, toolbar, table, etc.
- `@dnd-kit/core`, `@dnd-kit/sortable` – smooth drag and drop for steps/fields.
- `react-i18next` – runtime namespace loading (`form-builder`).

## Extensibility Notes

- Form types and field schemas live in `src/javascript/constants/formBuilder.js`. Add new Formidable node types here to surface more components in the builder.
- GraphQL operations are defined in `src/javascript/graphql`. Use `setPropertiesBatch` to persist additional attributes.
- Styling is scoped through SCSS files co-located with each component (`FormListView.scss`, `FormBuilder.scss`).

## Testing

At the moment there are no automated tests. When adding features, prefer to:

- exercise the GraphQL mutations against a Jahia sandbox to verify node creation and translations.
- run `yarn lint` before committing.

## Support

Open an issue in the repository where this module lives or reach out to the DX/Front-end team via Slack.
