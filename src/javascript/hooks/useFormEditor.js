import {useCallback, useEffect, useMemo, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {useFormBuilderContext} from '../contexts/FormBuilderContext';
import {GET_FORM_DETAILS, GET_SITE_LANGUAGES} from '../graphql/queries';
import {
    ADD_FIELD_MUTATION,
    ADD_STEP_MUTATION,
    DELETE_NODE_MUTATION,
    RENAME_NODE_MUTATION,
    REORDER_FIELDS_MUTATION,
    REORDER_STEPS_MUTATION,
    UPDATE_FIELD_MUTATION,
    UPDATE_FORM_METADATA_MUTATION,
    UPDATE_STEP_MUTATION
} from '../graphql/mutations';
import {buildFieldPropertiesInput, buildStepPropertiesInput, normalizeForm} from '../utils/formNormalizer';
import {buildNewFieldTemplate} from '../constants/formBuilder';
import {slugify} from '../utils/string';

const createEmptySet = () => new Set();

const updateFieldNode = (node, fieldId, partial) => {
    if (node === null || node === undefined) {
        return node;
    }

    let childChanged = false;
    let children = node.fields;

    if (Array.isArray(node.fields) && node.fields.length) {
        const nextChildren = node.fields.map(child => {
            const updated = updateFieldNode(child, fieldId, partial);
            if (updated !== child) {
                childChanged = true;
            }

            return updated;
        });

        if (childChanged) {
            children = nextChildren;
        }
    }

    if (node.id === fieldId) {
        const shouldUseChildren = partial.fields === undefined;
        const nextFields = shouldUseChildren ? children : partial.fields;
        return {
            ...node,
            ...partial,
            fields: nextFields
        };
    }

    if (childChanged) {
        return {
            ...node,
            fields: children
        };
    }

    return node;
};

export const useFormEditor = formId => {
    const {workspace, language: defaultLanguage, siteKey} = useFormBuilderContext();
    const [activeLanguage, setActiveLanguage] = useState(defaultLanguage);
    const [formState, setFormState] = useState(null);
    const [saving, setSaving] = useState(false);
    const [dirtySteps, setDirtySteps] = useState(() => new Set());
    const [dirtyFields, setDirtyFields] = useState(() => new Set());
    const [formMetadataDirty, setFormMetadataDirty] = useState(false);
    const shouldSkipFormQuery = formId === null || formId === undefined || formId === '';

    const {data, loading, error, refetch} = useQuery(GET_FORM_DETAILS, {
        variables: {
            workspace,
            language: activeLanguage,
            uuid: formId
        },
        fetchPolicy: 'no-cache',
        skip: shouldSkipFormQuery
    });

    const {data: languagesData} = useQuery(GET_SITE_LANGUAGES, {
        variables: {
            workspace,
            sitePath: `/sites/${siteKey}`
        }
    });

    const [updateFormMutation] = useMutation(UPDATE_FORM_METADATA_MUTATION);
    const [addStepMutation] = useMutation(ADD_STEP_MUTATION);
    const [updateStepMutation] = useMutation(UPDATE_STEP_MUTATION);
    const [reorderStepsMutation] = useMutation(REORDER_STEPS_MUTATION);
    const [deleteNodeMutation] = useMutation(DELETE_NODE_MUTATION);
    const [addFieldMutation] = useMutation(ADD_FIELD_MUTATION);
    const [updateFieldMutation] = useMutation(UPDATE_FIELD_MUTATION);
    const [reorderFieldsMutation] = useMutation(REORDER_FIELDS_MUTATION);
    const [renameNodeMutation] = useMutation(RENAME_NODE_MUTATION);

    useEffect(() => {
        console.log('GET_FORM_DETAILS raw response', {data, error, json: data ? JSON.stringify(data) : null});

        if (error) {
            return;
        }

        if (data?.jcr?.nodeById) {
            console.log('Loaded form from GraphQL', data.jcr.nodeById);

            const normalized = normalizeForm(data.jcr.nodeById);
            if (!normalized.label) {
                normalized.label = data.jcr.nodeById.displayName || data.jcr.nodeById.name || '';
            }

            console.log('Normalized form', normalized);
            setFormState(normalized);
            setDirtySteps(createEmptySet());
            setDirtyFields(createEmptySet());
            setFormMetadataDirty(false);
        }
    }, [data, error]);

    const siteLanguages = useMemo(() => {
        const values = languagesData?.jcr?.nodeByPath?.languages?.values;
        if (!values || !values.length) {
            return [defaultLanguage];
        }

        return values;
    }, [defaultLanguage, languagesData]);

    const updateFormState = useCallback(partial => {
        setFormState(prev => (prev ? {...prev, ...partial} : prev));
        setFormMetadataDirty(true);
    }, []);

    const markStepDirty = useCallback(stepId => {
        setDirtySteps(prev => {
            const next = new Set(prev);
            next.add(stepId);
            return next;
        });
    }, []);

    const markFieldDirty = useCallback(fieldId => {
        setDirtyFields(prev => {
            const next = new Set(prev);
            next.add(fieldId);
            return next;
        });
    }, []);

    const addStep = useCallback(async () => {
        if (!formState || !formState.path) {
            return;
        }

        const parentPath = formState.fieldsetsPath || formState.path;

        const title = `Step ${formState.steps.length + 1}`;
        const name = slugify(title) || `step-${Date.now()}`;

        await addStepMutation({
            variables: {
                workspace,
                parentPath,
                name,
                language: activeLanguage,
                title,
                description: ''
            }
        });

        await refetch();
    }, [activeLanguage, addStepMutation, formState, refetch, workspace]);

    const updateStepState = useCallback((stepId, partial) => {
        setFormState(prev => {
            if (!prev) {
                return prev;
            }

            const steps = prev.steps.map(step => (step.id === stepId ? {...step, ...partial} : step));
            return {...prev, steps};
        });
        markStepDirty(stepId);
    }, [markStepDirty]);

    const removeStep = useCallback(async stepId => {
        const step = formState?.steps?.find(item => item.id === stepId);
        if (!step) {
            return;
        }

        await deleteNodeMutation({
            variables: {
                workspace,
                pathOrId: step.path
            }
        });

        await refetch();
    }, [deleteNodeMutation, formState, refetch, workspace]);

    const reorderSteps = useCallback(async nextOrder => {
        if (!formState) {
            return;
        }

        setFormState(prev => ({...prev, steps: nextOrder}));

        const stepsParentPath = formState.fieldsetsPath || formState.path;

        await reorderStepsMutation({
            variables: {
                workspace,
                pathOrId: stepsParentPath,
                names: nextOrder.map(step => step.name)
            }
        });

        await refetch();
    }, [formState, reorderStepsMutation, refetch, workspace]);

    const addField = useCallback(async (stepId, typeId) => {
        const step = formState?.steps?.find(item => item.id === stepId);
        if (!step) {
            return;
        }

        const template = buildNewFieldTemplate(typeId, `Field ${step.fields.length + 1}`);
        const properties = buildFieldPropertiesInput(template, activeLanguage);

        await addFieldMutation({
            variables: {
                workspace,
                parentPath: step.path,
                name: slugify(template.label) || `field-${Date.now()}`,
                primaryNodeType: template.nodeType,
                properties
            }
        });

        await refetch();
    }, [activeLanguage, addFieldMutation, formState, refetch, workspace]);

    const addNestedField = useCallback(async ({parentPath, typeId, label, properties: overrideProperties}) => {
        if (!parentPath) {
            return;
        }

        const template = buildNewFieldTemplate(typeId, label || `Field ${Date.now()}`);
        const enrichedTemplate = overrideProperties ? {...template, properties: {...template.properties, ...overrideProperties}} : template;
        const properties = buildFieldPropertiesInput(enrichedTemplate, activeLanguage);

        await addFieldMutation({
            variables: {
                workspace,
                parentPath,
                name: slugify(enrichedTemplate.label) || `field-${Date.now()}`,
                primaryNodeType: enrichedTemplate.nodeType,
                properties
            }
        });

        await refetch();
    }, [activeLanguage, addFieldMutation, refetch, workspace]);

    const updateFieldState = useCallback((stepId, fieldId, partial) => {
        setFormState(prev => {
            if (!prev) {
                return prev;
            }

            const steps = prev.steps.map(step => {
                if (step.id !== stepId) {
                    return step;
                }

                const fields = step.fields.map(field => updateFieldNode(field, fieldId, partial));
                return {...step, fields};
            });

            return {...prev, steps};
        });
        markFieldDirty(fieldId);
    }, [markFieldDirty]);

    const removeField = useCallback(async (stepId, fieldId) => {
        const step = formState?.steps?.find(item => item.id === stepId);
        const field = step?.fields?.find(item => item.id === fieldId);
        if (!field) {
            return;
        }

        await deleteNodeMutation({
            variables: {
                workspace,
                pathOrId: field.path
            }
        });

        await refetch();
    }, [deleteNodeMutation, formState, refetch, workspace]);

    const reorderFields = useCallback(async (stepId, nextOrder) => {
        const step = formState?.steps?.find(item => item.id === stepId);
        if (!step) {
            return;
        }

        setFormState(prev => {
            if (!prev) {
                return prev;
            }

            const steps = prev.steps.map(item => (item.id === stepId ? {...item, fields: nextOrder} : item));
            return {...prev, steps};
        });

        await reorderFieldsMutation({
            variables: {
                workspace,
                pathOrId: step.path,
                names: nextOrder.map(field => field.name)
            }
        });

        await refetch();
    }, [formState, reorderFieldsMutation, refetch, workspace]);

    const saveChanges = useCallback(async () => {
        if (!formState) {
            return;
        }

        setSaving(true);

        try {
            const promises = [];
            const stepsParentPath = formState.fieldsetsPath || formState.path;

            if (!stepsParentPath) {
                console.warn('Missing parent path for steps, cannot apply mutations safely');
                setSaving(false);
                return;
            }

            if (formMetadataDirty) {
                promises.push(updateFormMutation({
                    variables: {
                        workspace,
                        pathOrId: formState.path,
                        language: activeLanguage,
                        title: formState.label,
                        intro: formState.intro || ''
                    }
                }));
            }

            dirtySteps.forEach(stepId => {
                const step = formState.steps.find(item => item.id === stepId);
                if (!step) {
                    return;
                }

                promises.push(updateStepMutation({
                    variables: {
                        workspace,
                        pathOrId: step.path,
                        properties: buildStepPropertiesInput(step, activeLanguage)
                    }
                }));

                if (step.name !== step.initialName) {
                    promises.push(renameNodeMutation({
                        variables: {
                            workspace,
                            pathOrId: step.path,
                            name: slugify(step.name) || step.name
                        }
                    }));
                }
            });

            dirtyFields.forEach(fieldId => {
                const {step, field} = findFieldById(formState, fieldId);
                if (!field || !step) {
                    return;
                }

                promises.push(updateFieldMutation({
                    variables: {
                        workspace,
                        pathOrId: field.path,
                        properties: buildFieldPropertiesInput(field, activeLanguage)
                    }
                }));

                if (field.name !== field.initialName) {
                    promises.push(renameNodeMutation({
                        variables: {
                            workspace,
                            pathOrId: field.path,
                            name: slugify(field.name) || field.name
                        }
                    }));
                }
            });

            await Promise.all(promises);
            await refetch();

            setDirtyFields(createEmptySet());
            setDirtySteps(createEmptySet());
            setFormMetadataDirty(false);
        } finally {
            setSaving(false);
        }
    }, [activeLanguage, dirtyFields, dirtySteps, formMetadataDirty, formState, refetch, renameNodeMutation, updateFieldMutation, updateFormMutation, updateStepMutation, workspace]);

    return {
        form: formState,
        loading,
        saveChanges,
        saving,
        addStep,
        updateStepState,
        removeStep,
        reorderSteps,
        addField,
        addNestedField,
        updateFieldState,
        removeField,
        reorderFields,
        activeLanguage,
        setActiveLanguage,
        siteLanguages,
        updateFormState
    };
};

const findFieldById = (form, fieldId) => {
    if (!form) {
        return {step: null, field: null};
    }

    for (const step of form.steps) {
        const stack = [...step.fields];

        while (stack.length > 0) {
            const current = stack.shift();
            if (current.id === fieldId) {
                return {step, field: current};
            }

            if (current.fields && current.fields.length) {
                stack.push(...current.fields);
            }
        }
    }

    return {step: null, field: null};
};
