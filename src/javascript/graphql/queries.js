import {gql} from '@apollo/client';
import {FORM_FRAGMENT, PROPERTY_FIELDS_FRAGMENT} from './fragments';

export const GET_FORMS_LIST = gql`
    query GetFormidableForms($workspace: Workspace!, $language: String!, $paths: [String!]!) {
        jcr(workspace: $workspace) {
            nodesByCriteria(criteria: {nodeType: "fmdb:form", paths: $paths}) {
                nodes {
                    uuid
                    name
                    path
                    displayName(language: $language)
                    properties(language: $language, names: ["intro", "jcr:lastModified"]) {
                        ...PropertyFields
                    }
                    children(names: ["fieldsets"]) {
                        nodes {
                            children {
                                nodes {
                                    uuid
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ${PROPERTY_FIELDS_FRAGMENT}
`;

export const GET_FORM_DETAILS = gql`
    query GetFormidableForm($workspace: Workspace!, $language: String!, $uuid: String!) {
        jcr(workspace: $workspace) {
            nodeById(uuid: $uuid) {
                ...FormFragment
            }
        }
    }
    ${FORM_FRAGMENT}
`;

export const GET_SITE_LANGUAGES = gql`
    query GetSiteLanguages($workspace: Workspace!, $sitePath: String!) {
        jcr(workspace: $workspace) {
            nodeByPath(path: $sitePath) {
                languages: property(name: "j:languages") {
                    values
                }
            }
        }
    }
`;
