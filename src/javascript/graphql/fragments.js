import {gql} from '@apollo/client';

export const PROPERTY_FIELDS_FRAGMENT = gql`
    fragment PropertyFields on JCRProperty {
        name
        value
        values
        type
    }
`;

export const FIELD_CHILD_FRAGMENT = gql`
    fragment FieldChildFragment on JCRNode {
        uuid
        name
        path
        primaryNodeType {
            name
        }
        displayName(language: $language)
        properties(language: $language) {
            ...PropertyFields
        }
    }
    ${PROPERTY_FIELDS_FRAGMENT}
`;

export const FIELD_FRAGMENT = gql`
    fragment FieldFragment on JCRNode {
        uuid
        name
        path
        primaryNodeType {
            name
        }
        displayName(language: $language)
        properties(language: $language) {
            ...PropertyFields
        }
        children {
            nodes {
                ...FieldChildFragment
            }
        }
    }
    ${FIELD_CHILD_FRAGMENT}
    ${PROPERTY_FIELDS_FRAGMENT}
`;

export const STEP_FRAGMENT = gql`
    fragment StepFragment on JCRNode {
        uuid
        name
        path
        primaryNodeType {
            name
        }
        displayName(language: $language)
        properties(language: $language, names: ["jcr:description"]) {
            ...PropertyFields
        }
        children {
            nodes {
                ...FieldFragment
            }
        }
    }
    ${FIELD_FRAGMENT}
    ${PROPERTY_FIELDS_FRAGMENT}
`;

export const FORM_FRAGMENT = gql`
    fragment FormFragment on JCRNode {
        uuid
        name
        path
        displayName(language: $language)
        properties(language: $language) {
            ...PropertyFields
        }
        children {
            nodes {
                ...StepFragment
            }
        }
        fieldsetsContainers: children(names: ["fieldsets"]) {
            nodes {
                uuid
                name
                path
                children {
                    nodes {
                        ...StepFragment
                    }
                }
            }
        }
    }
    ${STEP_FRAGMENT}
    ${PROPERTY_FIELDS_FRAGMENT}
`;
