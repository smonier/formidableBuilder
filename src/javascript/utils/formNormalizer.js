import {getFieldTypeByNode, getFieldPropertyNames, resolveFieldDefinition} from '../constants/formBuilder';

const getPropertyValue = (properties, name) => {
    const source = properties || [];
    const target = source.find(property => property.name === name);
    if (!target) {
        return undefined;
    }

    if (target.values && target.values.length) {
        return target.values;
    }

    return target.value;
};

export const propertiesToObject = properties => {
    if (!properties) {
        return {};
    }

    return properties.reduce((acc, property) => {
        if (property.values && property.values.length) {
            acc[property.name] = property.values;
        } else {
            acc[property.name] = property.value;
        }

        return acc;
    }, {});
};

const parseOptionString = raw => {
    if (typeof raw !== 'string') {
        return null;
    }

    let candidate = raw.trim();
    if (!candidate) {
        return null;
    }

    if (candidate.endsWith('.')) {
        candidate = candidate.slice(0, -1);
    }

    try {
        return JSON.parse(candidate);
    } catch (_) {
        return null;
    }
};

export const normalizeField = node => {
    const primaryNodeType = node?.primaryNodeType?.name;
    const definition = getFieldTypeByNode(primaryNodeType);
    const properties = {};
    const childNodes = ((node.children || {}).nodes || []);

    const coerceBoolean = value => {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }

        return Boolean(value);
    };

    (node.properties || []).forEach(property => {
        if (property.name === 'options') {
            if (Array.isArray(property.values) && property.values.length) {
                properties[property.name] = property.values
                    .map(entry => (typeof entry === 'string' ? parseOptionString(entry) : entry))
                    .filter(Boolean);
            } else if (typeof property.value === 'string' && property.value.trim().length) {
                const parsed = parseOptionString(property.value);
                properties[property.name] = parsed ? [parsed] : [];
            } else if (property.value && typeof property.value === 'object') {
                properties[property.name] = [property.value];
            } else {
                properties[property.name] = [];
            }

            return;
        }

        if (property.values && property.values.length) {
            if (property.type === 'BOOLEAN') {
                properties[property.name] = property.values.map(coerceBoolean);
                return;
            }

            properties[property.name] = property.values;
            return;
        }

        if (property.type === 'BOOLEAN') {
            properties[property.name] = coerceBoolean(property.value);
            return;
        }

        properties[property.name] = property.value;
    });

    const title = properties['jcr:title'] || node.displayName || node.name || '';
    if (title) {
        properties['jcr:title'] = title;
    }

    return {
        id: node.uuid,
        name: node.name,
        initialName: node.name,
        path: node.path,
        label: title,
        type: definition ? definition.id : primaryNodeType,
        nodeType: primaryNodeType,
        properties,
        fields: childNodes.map(normalizeField)
    };
};

export const normalizeStep = node => {
    const description = getPropertyValue(node.properties || [], 'jcr:description') || '';
    const fields = ((node.children || {}).nodes || []).map(normalizeField);

    return {
        id: node.uuid,
        name: node.name,
        initialName: node.name,
        path: node.path,
        label: node.displayName || node.name,
        description,
        fields
    };
};

const isFieldsetNode = node => node?.primaryNodeType?.name === 'fmdb:fieldset';

export const normalizeForm = node => {
    if (!node) {
        return null;
    }

    const intro = getPropertyValue(node.properties || [], 'intro') || '';
    const title = getPropertyValue(node.properties || [], 'jcr:title') || node.displayName || node.name;

    const directStepNodes = ((node.children || {}).nodes || []).filter(isFieldsetNode);
    const containerNodes = ((node.fieldsetsContainers || {}).nodes || []);
    const containerStepNodes = containerNodes.flatMap(container => ((container.children || {}).nodes || []).filter(isFieldsetNode));
    const stepNodes = [...directStepNodes, ...containerStepNodes];
    const fieldsetsPath = containerNodes[0]?.path || (directStepNodes.length > 0 ? node.path : null);
    const steps = stepNodes.map(normalizeStep);

    return {
        id: node.uuid,
        name: node.name,
        path: node.path,
        label: title,
        intro,
        steps,
        fieldsetsPath
    };
};

export const buildFieldPropertiesInput = (field, language) => {
    const safeLabel = field.label || field.name || '';
    const properties = [
        {name: 'jcr:title', value: safeLabel, language, type: 'STRING'}
    ];
    const definition = resolveFieldDefinition(field.nodeType || field.type);
    const allowedProperties = getFieldPropertyNames(definition);
    allowedProperties.add('jcr:title');
    allowedProperties.add('options');

    Object.entries(field.properties || {}).forEach(([name, value]) => {
        if (name === 'jcr:title') {
            return;
        }

        if (!allowedProperties.has(name)) {
            return;
        }

        if (value === undefined || value === null) {
            return;
        }

        if (name === 'options' && Array.isArray(value)) {
            const serializedOptions = value
                .map(option => {
                    if (!option) {
                        return null;
                    }

                    if (typeof option === 'string') {
                        return option;
                    }

                    try {
                        return JSON.stringify(option);
                    } catch (_) {
                        return null;
                    }
                })
                .filter(Boolean);

            if (!serializedOptions.length) {
                return;
            }

            properties.push({name, values: serializedOptions, language, type: 'STRING'});

            return;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return;
            }

            properties.push({name, values: value, language, type: 'STRING'});
        } else if (typeof value === 'boolean') {
            properties.push({name, value, type: 'BOOLEAN'});
        } else if (typeof value === 'string') {
            if (value.trim() === '') {
                return;
            }

            properties.push({name, value, language, type: 'STRING'});
        } else {
            properties.push({name, value: value.toString(), language, type: 'STRING'});
        }
    });

    return properties;
};

export const buildStepPropertiesInput = (step, language) => {
    const properties = [
        {name: 'jcr:title', value: step.label, language, type: 'STRING'}
    ];

    if (step.description !== undefined) {
        properties.push({name: 'jcr:description', value: step.description || '', language, type: 'STRING'});
    }

    return properties;
};
