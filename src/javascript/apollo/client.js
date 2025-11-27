import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';

const DEFAULT_HEADERS = {
    'X-Requested-With': 'XMLHttpRequest'
};

const buildGraphQLUri = () => {
    const {contextJsParameters = {}} = window;
    const {contextPath = ''} = contextJsParameters;

    return `${contextPath || ''}/modules/graphql`;
};

export const createApolloClient = () => {
    return new ApolloClient({
        link: new HttpLink({
            uri: buildGraphQLUri(),
            credentials: 'include',
            headers: DEFAULT_HEADERS
        }),
        cache: new InMemoryCache({
            typePolicies: {
                JCRNode: {
                    keyFields: ['uuid']
                }
            }
        }),
        connectToDevTools: process.env.NODE_ENV !== 'production'
    });
};

let sharedClient;

export const getApolloClient = () => {
    if (!sharedClient) {
        sharedClient = createApolloClient();
    }

    return sharedClient;
};
