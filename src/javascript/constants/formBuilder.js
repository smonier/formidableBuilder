export const FORM_NAMESPACE = 'formidableBuilder';

export const DEFAULT_WORKSPACE = 'EDIT';

export const getDefaultFormsPath = siteKey => `/sites/${siteKey}/contents/forms`;

const booleanProperty = (name, labelKey) => ({
    name,
    type: 'boolean',
    labelKey
});

const textProperty = (name, labelKey, options = {}) => ({
    name,
    type: 'text',
    labelKey,
    ...options
});

const multilineProperty = (name, labelKey) => ({
    name,
    type: 'multiline',
    labelKey
});

const numberProperty = (name, labelKey) => ({
    name,
    type: 'number',
    labelKey
});

const dateProperty = (name, labelKey) => ({
    name,
    type: 'date',
    labelKey
});

const dateTimeProperty = (name, labelKey) => ({
    name,
    type: 'datetime',
    labelKey
});

const selectProperty = (name, labelKey, options, defaultValue) => ({
    name,
    type: 'select',
    labelKey,
    options,
    defaultValue
});

const stringListProperty = (name, labelKey, config = {}) => ({
    name,
    type: 'stringList',
    labelKey,
    ...config
});

const buttonTypeOptions = [
    {value: 'button', labelKey: 'builder.fields.properties.buttonTypeOptions.button'},
    {value: 'submit', labelKey: 'builder.fields.properties.buttonTypeOptions.submit'},
    {value: 'reset', labelKey: 'builder.fields.properties.buttonTypeOptions.reset'}
];

const buttonVariantOptions = [
    {value: 'primary', labelKey: 'builder.fields.properties.variantOptions.primary'},
    {value: 'secondary', labelKey: 'builder.fields.properties.variantOptions.secondary'},
    {value: 'danger', labelKey: 'builder.fields.properties.variantOptions.danger'}
];

const resizeOptions = [
    {value: 'none', labelKey: 'builder.fields.properties.resizeOptions.none'},
    {value: 'both', labelKey: 'builder.fields.properties.resizeOptions.both'},
    {value: 'horizontal', labelKey: 'builder.fields.properties.resizeOptions.horizontal'},
    {value: 'vertical', labelKey: 'builder.fields.properties.resizeOptions.vertical'}
];

export const FIELD_TYPES = [
    {
        id: 'inputButton',
        nodeType: 'fmdb:inputButton',
        labelKey: 'fields.types.inputButton',
        defaultProperties: {
            buttonType: 'button',
            variant: 'primary'
        },
        propertySchema: [
            selectProperty('buttonType', 'builder.fields.properties.buttonType', buttonTypeOptions, 'button'),
            selectProperty('variant', 'builder.fields.properties.variant', buttonVariantOptions, 'primary')
        ]
    },
    {
        id: 'inputCheckbox',
        nodeType: 'fmdb:inputCheckbox',
        labelKey: 'fields.types.inputCheckbox',
        defaultProperties: {
            required: false,
            defaultChecked: false,
            value: ''
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            booleanProperty('defaultChecked', 'builder.fields.properties.defaultChecked'),
            textProperty('value', 'builder.fields.properties.value')
        ]
    },
    {
        id: 'checkboxGroup',
        nodeType: 'fmdb:checkboxGroup',
        labelKey: 'fields.types.checkboxGroup',
        defaultProperties: {
            required: false
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required')
        ]
    },
    {
        id: 'inputColor',
        nodeType: 'fmdb:inputColor',
        labelKey: 'fields.types.inputColor',
        defaultProperties: {
            required: false,
            defaultValue: ''
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            textProperty('defaultValue', 'builder.fields.properties.defaultValue')
        ]
    },
    {
        id: 'inputDate',
        nodeType: 'fmdb:inputDate',
        labelKey: 'fields.types.inputDate',
        defaultProperties: {
            required: false,
            defaultValue: null,
            min: null,
            max: null,
            step: null
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            dateProperty('defaultValue', 'builder.fields.properties.defaultDate'),
            dateProperty('min', 'builder.fields.properties.minDate'),
            dateProperty('max', 'builder.fields.properties.maxDate'),
            numberProperty('step', 'builder.fields.properties.step')
        ]
    },
    {
        id: 'inputDatetimeLocal',
        nodeType: 'fmdb:inputDatetimeLocal',
        labelKey: 'fields.types.inputDatetimeLocal',
        defaultProperties: {
            required: false,
            defaultValue: null,
            min: null,
            max: null,
            step: null
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            dateTimeProperty('defaultValue', 'builder.fields.properties.defaultDateTime'),
            dateTimeProperty('min', 'builder.fields.properties.minDateTime'),
            dateTimeProperty('max', 'builder.fields.properties.maxDateTime'),
            numberProperty('step', 'builder.fields.properties.step')
        ]
    },
    {
        id: 'inputEmail',
        nodeType: 'fmdb:inputEmail',
        labelKey: 'fields.types.inputEmail',
        defaultProperties: {
            required: false,
            autocomplete: false,
            multiple: false,
            placeholder: '',
            defaultValue: '',
            list: [],
            pattern: '',
            minLength: null,
            maxLength: null
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            booleanProperty('autocomplete', 'builder.fields.properties.autocomplete'),
            booleanProperty('multiple', 'builder.fields.properties.multiple'),
            textProperty('placeholder', 'builder.fields.properties.placeholder'),
            textProperty('defaultValue', 'builder.fields.properties.defaultValue'),
            stringListProperty('list', 'builder.fields.properties.list', {
                addLabelKey: 'builder.fields.properties.listAdd',
                removeLabelKey: 'builder.fields.properties.listRemove',
                itemLabelKey: 'builder.fields.properties.listItem'
            }),
            textProperty('pattern', 'builder.fields.properties.pattern'),
            numberProperty('minLength', 'builder.fields.properties.minLength'),
            numberProperty('maxLength', 'builder.fields.properties.maxLength')
        ]
    },
    {
        id: 'inputFile',
        nodeType: 'fmdb:inputFile',
        labelKey: 'fields.types.inputFile',
        defaultProperties: {
            accept: '',
            multiple: false,
            required: false
        },
        propertySchema: [
            textProperty('accept', 'builder.fields.properties.accept'),
            booleanProperty('multiple', 'builder.fields.properties.multiple'),
            booleanProperty('required', 'builder.fields.properties.required')
        ]
    },
    {
        id: 'inputHidden',
        nodeType: 'fmdb:inputHidden',
        labelKey: 'fields.types.inputHidden',
        defaultProperties: {
            value: ''
        },
        propertySchema: [
            textProperty('value', 'builder.fields.properties.value')
        ]
    },
    {
        id: 'inputRadio',
        nodeType: 'fmdb:inputRadio',
        labelKey: 'fields.types.inputRadio',
        allowedParents: ['radioGroup'],
        defaultProperties: {
            defaultChecked: false,
            value: ''
        },
        propertySchema: [
            booleanProperty('defaultChecked', 'builder.fields.properties.defaultChecked'),
            textProperty('value', 'builder.fields.properties.value')
        ]
    },
    {
        id: 'radioGroup',
        nodeType: 'fmdb:radioGroup',
        labelKey: 'fields.types.radioGroup',
        defaultProperties: {
            required: false
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required')
        ]
    },
    {
        id: 'inputText',
        nodeType: 'fmdb:inputText',
        labelKey: 'fields.types.inputText',
        defaultProperties: {
            required: false,
            placeholder: '',
            defaultValue: '',
            list: [],
            minLength: null,
            maxLength: null
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            textProperty('placeholder', 'builder.fields.properties.placeholder'),
            textProperty('defaultValue', 'builder.fields.properties.defaultValue'),
            stringListProperty('list', 'builder.fields.properties.list', {
                addLabelKey: 'builder.fields.properties.listAdd',
                removeLabelKey: 'builder.fields.properties.listRemove',
                itemLabelKey: 'builder.fields.properties.listItem'
            }),
            numberProperty('minLength', 'builder.fields.properties.minLength'),
            numberProperty('maxLength', 'builder.fields.properties.maxLength')
        ]
    },
    {
        id: 'select',
        nodeType: 'fmdb:select',
        labelKey: 'fields.types.select',
        defaultProperties: {
            options: [
                {
                    label: 'Option 1',
                    value: 'option-1',
                    selected: false
                }
            ],
            size: null,
            required: false,
            multiple: false,
            disabled: false,
            autofocus: false
        },
        propertySchema: [
            numberProperty('size', 'builder.fields.properties.size'),
            booleanProperty('required', 'builder.fields.properties.required'),
            booleanProperty('multiple', 'builder.fields.properties.multiple'),
            booleanProperty('disabled', 'builder.fields.properties.disabled'),
            booleanProperty('autofocus', 'builder.fields.properties.autofocus')
        ]
    },
    {
        id: 'textarea',
        nodeType: 'fmdb:textarea',
        labelKey: 'fields.types.textarea',
        defaultProperties: {
            required: false,
            placeholder: '',
            defaultValue: '',
            minLength: null,
            maxLength: null,
            rows: null,
            resize: 'vertical'
        },
        propertySchema: [
            booleanProperty('required', 'builder.fields.properties.required'),
            textProperty('placeholder', 'builder.fields.properties.placeholder'),
            multilineProperty('defaultValue', 'builder.fields.properties.defaultValue'),
            numberProperty('minLength', 'builder.fields.properties.minLength'),
            numberProperty('maxLength', 'builder.fields.properties.maxLength'),
            numberProperty('rows', 'builder.fields.properties.rows'),
            selectProperty('resize', 'builder.fields.properties.resize', resizeOptions, 'vertical')
        ]
    }
];

export const getFieldDefinitionByNodeType = primaryNodeType => FIELD_TYPES.find(type => type.nodeType === primaryNodeType);

export const getFieldDefinition = typeId => FIELD_TYPES.find(type => type.id === typeId);

export const resolveFieldDefinition = identifier => getFieldDefinition(identifier) || getFieldDefinitionByNodeType(identifier);

export const getFieldTypeByNode = primaryNodeType => getFieldDefinitionByNodeType(primaryNodeType);

export const buildNewFieldTemplate = (typeId, label) => {
    const definition = getFieldDefinition(typeId);
    if (!definition) {
        throw new Error(`Unknown field type ${typeId}`);
    }

    return {
        id: `temp-${Date.now()}`,
        label: label || '',
        name: '',
        description: '',
        type: definition.id,
        nodeType: definition.nodeType,
        properties: {...definition.defaultProperties}
    };
};

export const getFieldPropertyNames = definition => {
    const names = new Set();
    if (!definition) {
        return names;
    }

    (definition.propertySchema || []).forEach(descriptor => {
        if (descriptor && descriptor.name) {
            names.add(descriptor.name);
        }
    });

    return names;
};
