import {useCallback, useMemo} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {useFormBuilderContext} from '../contexts/FormBuilderContext';
import {GET_FORMS_LIST} from '../graphql/queries';
import {CREATE_FORM_MUTATION, DELETE_NODE_MUTATION} from '../graphql/mutations';
import {slugify} from '../utils/string';

const buildStepCount = node => {
    const fieldsets = ((node.children || {}).nodes || []).filter(child => child.primaryNodeType?.name === 'fmdb:fieldset');
    return fieldsets.length;
};

const getLatestModifiedDate = node => {
    const dates = [];

    // Add the form's own last modified date
    const formLastModified = node.properties?.find(property => property.name === 'jcr:lastModified')?.value;
    if (formLastModified) {
        dates.push(new Date(formLastModified));
    }

    // Recursively collect last modified dates from all child nodes
    const collectDates = (currentNode, depth = 0) => {
        // Only go 3 levels deep to avoid infinite recursion
        if (depth > 3) {
            return;
        }

        if (currentNode.properties && Array.isArray(currentNode.properties)) {
            const lastModified = currentNode.properties.find(property => property.name === 'jcr:lastModified')?.value;
            if (lastModified) {
                dates.push(new Date(lastModified));
            }
        }

        if (currentNode.children && currentNode.children.nodes && Array.isArray(currentNode.children.nodes)) {
            currentNode.children.nodes.forEach(child => collectDates(child, depth + 1));
        }
    };

    // Start collecting from all fieldsets
    const fieldsets = ((node.children || {}).nodes || []).filter(child => child.primaryNodeType?.name === 'fmdb:fieldset');
    fieldsets.forEach(fieldset => collectDates(fieldset));

    // Return the most recent date, or null if no dates found
    if (dates.length > 0) {
        return new Date(Math.max(...dates.map(date => date.getTime())));
    }

    return null;
};

export const useFormList = () => {
    const {workspace, language, formsPath} = useFormBuilderContext();
    const {data, loading, refetch} = useQuery(GET_FORMS_LIST, {
        variables: {workspace, language, paths: [formsPath]},
        fetchPolicy: 'network-only'
    });

    const [createFormMutation, {loading: creating}] = useMutation(CREATE_FORM_MUTATION);
    const [deleteMutation, {loading: deleting}] = useMutation(DELETE_NODE_MUTATION);

    const forms = useMemo(() => {
        const nodes = data?.jcr?.nodesByCriteria?.nodes || [];

        return nodes.map(node => ({
            id: node.uuid,
            name: node.name,
            path: node.path,
            title: node.displayName || node.name,
            intro: node.properties?.find(property => property.name === 'intro')?.value || '',
            steps: buildStepCount(node),
            updatedAt: getLatestModifiedDate(node)
        }));
    }, [data]);

    const createForm = useCallback(async form => {
        const name = slugify(form.title) || `form-${Date.now()}`;

        await createFormMutation({
            variables: {
                workspace,
                parentPath: formsPath,
                name,
                language,
                title: form.title,
                intro: form.intro || ''
            }
        });

        await refetch();
    }, [createFormMutation, formsPath, language, refetch, workspace]);

    const deleteForm = useCallback(async pathOrId => {
        await deleteMutation({
            variables: {
                workspace,
                pathOrId
            }
        });

        await refetch();
    }, [deleteMutation, refetch, workspace]);

    return {
        forms,
        loading: loading || creating || deleting,
        createForm,
        deleteForm,
        refetch
    };
};
