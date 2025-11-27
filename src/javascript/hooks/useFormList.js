import {useCallback, useMemo} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {useFormBuilderContext} from '../contexts/FormBuilderContext';
import {GET_FORMS_LIST} from '../graphql/queries';
import {CREATE_FORM_MUTATION, DELETE_NODE_MUTATION} from '../graphql/mutations';
import {slugify} from '../utils/string';

const buildStepCount = node => {
    const fieldsetContainer = ((node.children || {}).nodes || [])[0];
    const steps = fieldsetContainer ? ((fieldsetContainer.children || {}).nodes || []) : [];
    return steps.length;
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
            updatedAt: node.properties?.find(property => property.name === 'jcr:lastModified')?.value || null
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
