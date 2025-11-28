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
                mutateProperty_title: mutateProperty(name: "jcr:title") {
                    setValue(value: $title, language: $language)
                }
                mutateProperty_intro: mutateProperty(name: "intro") {
                    setValue(value: $intro, language: $language)
                }
                uuid
            }
        }
    }
`;

export const UPDATE_FORM_MIXIN_RESPONSES_MUTATION = gql`
    mutation UpdateFormMixinResponses($workspace: Workspace!, $pathOrId: String!, $language: String!, $submissionMessage: String, $errorMessage: String) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                addMixins(mixins: ["fmdbmix:responses"])
                mutateProperty_submissionMessage: mutateProperty(name: "submissionMessage") {
                    setValue(value: $submissionMessage, language: $language)
                }
                mutateProperty_errorMessage: mutateProperty(name: "errorMessage") {
                    setValue(value: $errorMessage, language: $language)
                }
                uuid
            }
        }
    }
`;

export const UPDATE_FORM_MIXIN_BUTTONS_MUTATION = gql`
    mutation UpdateFormMixinButtons($workspace: Workspace!, $pathOrId: String!, $language: String!, $submitBtnLabel: String, $resetBtnLabel: String, $showResetBtn: String, $newFormBtnLabel: String, $showNewFormBtn: String, $tryAgainBtnLabel: String, $showTryAgainBtn: String) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                addMixins(mixins: ["fmdbmix:buttons"])
                mutateProperty_submitBtnLabel: mutateProperty(name: "submitBtnLabel") {
                    setValue(value: $submitBtnLabel, language: $language)
                }
                mutateProperty_resetBtnLabel: mutateProperty(name: "resetBtnLabel") {
                    setValue(value: $resetBtnLabel, language: $language)
                }
                mutateProperty_showResetBtn: mutateProperty(name: "showResetBtn") {
                    setValue(value: $showResetBtn)
                }
                mutateProperty_newFormBtnLabel: mutateProperty(name: "newFormBtnLabel") {
                    setValue(value: $newFormBtnLabel, language: $language)
                }
                mutateProperty_showNewFormBtn: mutateProperty(name: "showNewFormBtn") {
                    setValue(value: $showNewFormBtn)
                }
                mutateProperty_tryAgainBtnLabel: mutateProperty(name: "tryAgainBtnLabel") {
                    setValue(value: $tryAgainBtnLabel, language: $language)
                }
                mutateProperty_showTryAgainBtn: mutateProperty(name: "showTryAgainBtn") {
                    setValue(value: $showTryAgainBtn)
                }
                uuid
            }
        }
    }
`;

export const UPDATE_FORM_MIXIN_ACTIONS_MUTATION = gql`
    mutation UpdateFormMixinActions($workspace: Workspace!, $pathOrId: String!, $customTarget: String) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                addMixins(mixins: ["fmdbmix:actions"])
                mutateProperty(name: "customTarget") {
                    setValue(value: $customTarget)
                }
                uuid
            }
        }
    }
`;

export const UPDATE_FORM_MIXIN_STYLE_MUTATION = gql`
    mutation UpdateFormMixinStyle($workspace: Workspace!, $pathOrId: String!, $language: String!, $css: String) {
        jcr(workspace: $workspace) {
            mutateNode(pathOrId: $pathOrId) {
                addMixins(mixins: ["fmdbmix:style"])
                mutateProperty(name: "css") {
                    setValue(value: $css, language: $language)
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
