import {gql} from '@apollo/client';

export const CREATE_FORM_MUTATION = gql`
    mutation CreateForm($workspace: Workspace!, $parentPath: String!, $name: String!, $language: String!, $title: String!, $intro: String) {
        jcr(workspace: $workspace) {
            addNode(
                parentPathOrId: $parentPath
                name: $name
                primaryNodeType: "fmdb:form"
                properties: [
                    {name: "jcr:title", value: $title, language: $language}
                    {name: "intro", value: $intro, language: $language}
                ]
            ) {
                uuid
            }
        }
    }
`;

export const UPDATE_FORM_METADATA_MUTATION = gql`
    mutation UpdateFormMetadata($workspace: Workspace!, $pathOrId: String!, $language: String!, $title: String!, $intro: String) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                mutateProperty(name: "jcr:title") {
                    setValue(value: $title, language: $language)
                }
                mutateProperty(name: "intro") {
                    setValue(value: $intro, language: $language)
                }
                uuid
            }
        }
    }
`;

export const DELETE_NODE_MUTATION = gql`
    mutation DeleteNode($workspace: Workspace!, $pathOrId: String!) {
        jcr(workspace: $workspace) {
            deleteNode(pathOrId: $pathOrId)
        }
    }
`;

export const ADD_STEP_MUTATION = gql`
    mutation AddFieldset($workspace: Workspace!, $parentPath: String!, $name: String!, $language: String!, $title: String!, $description: String) {
        jcr(workspace: $workspace) {
            addNode(
                parentPathOrId: $parentPath
                name: $name
                primaryNodeType: "fmdb:fieldset"
                properties: [
                    {name: "jcr:title", value: $title, language: $language}
                    {name: "jcr:description", value: $description, language: $language}
                ]
            ) {
                uuid
            }
        }
    }
`;

export const UPDATE_STEP_MUTATION = gql`
    mutation UpdateFieldset($workspace: Workspace!, $pathOrId: String!, $properties: [InputJCRProperty]!) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                setPropertiesBatch(properties: $properties) {
                    property {
                        name
                    }
                }
                uuid
            }
        }
    }
`;

export const REORDER_STEPS_MUTATION = gql`
    mutation ReorderSteps($workspace: Workspace!, $pathOrId: String!, $names: [String!]!) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                reorderChildren(names: $names)
            }
        }
    }
`;

export const ADD_FIELD_MUTATION = gql`
    mutation AddField($workspace: Workspace!, $parentPath: String!, $name: String!, $primaryNodeType: String!, $properties: [InputJCRProperty]!) {
        jcr(workspace: $workspace) {
            addNode(
                parentPathOrId: $parentPath
                name: $name
                primaryNodeType: $primaryNodeType
                properties: $properties
            ) {
                uuid
            }
        }
    }
`;

export const UPDATE_FIELD_MUTATION = gql`
    mutation UpdateField($workspace: Workspace!, $pathOrId: String!, $properties: [InputJCRProperty]!) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                setPropertiesBatch(properties: $properties) {
                    property {
                        name
                    }
                }
                uuid
            }
        }
    }
`;

export const REORDER_FIELDS_MUTATION = gql`
    mutation ReorderFields($workspace: Workspace!, $pathOrId: String!, $names: [String!]!) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                reorderChildren(names: $names)
            }
        }
    }
`;

export const RENAME_NODE_MUTATION = gql`
    mutation RenameNode($workspace: Workspace!, $pathOrId: String!, $name: String!) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                rename(name: $name)
                uuid
            }
        }
    }
`;
