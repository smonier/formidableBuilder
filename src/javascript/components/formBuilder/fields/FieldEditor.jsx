import React from 'react';
import PropTypes from 'prop-types';
import {Button, Checkbox, Dropdown, Input, Paper, Textarea as MoonstoneTextarea, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {FIELD_TYPES, FORM_NAMESPACE} from '../../../constants/formBuilder';

export const FieldEditor = ({field, stepId, onChangeField, onAddNestedField}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const FormTextarea = MoonstoneTextarea || (({className = '', ...props}) => (
        <textarea className={`moonstone-textarea ${className}`.trim()} {...props}/>
    ));

    if (!field) {
        return (
            <Paper className="fb-field-editor">
                <Typography variant="body">{t('builder.fields.selectField')}</Typography>
            </Paper>
        );
    }

    const updateField = partial => {
        onChangeField(stepId, field.id, partial);
    };

    const updateProperty = (name, value) => {
        updateField({
            properties: {
                ...field.properties,
                [name]: value
            }
        });
    };

    const definition = FIELD_TYPES.find(type => type.id === field.type);
    const propertySchema = definition?.propertySchema || [];
    const booleanDescriptors = [];
    const beforeBoolean = [];
    const afterBoolean = [];
    let seenBoolean = false;
    propertySchema.forEach(descriptor => {
        if (descriptor.type === 'boolean') {
            booleanDescriptors.push(descriptor);
            seenBoolean = true;
        } else if (!seenBoolean) {
            beforeBoolean.push(descriptor);
        } else {
            afterBoolean.push(descriptor);
        }
    });
    const typeLabel = definition ? t(definition.labelKey) : field.type;

    const getStringArray = value => (Array.isArray(value) ? value : []);

    const renderStringListField = descriptor => {
        const items = getStringArray(field.properties[descriptor.name]);
        const addLabel = descriptor.addLabelKey ? t(descriptor.addLabelKey) : t('builder.fields.properties.listAdd');
        const removeLabel = descriptor.removeLabelKey ? t(descriptor.removeLabelKey) : t('builder.fields.properties.listRemove');
        const itemLabel = index => {
            if (descriptor.itemLabelKey) {
                return t(descriptor.itemLabelKey, {index});
            }

            return t('builder.fields.properties.listItem', {index});
        };

        return (
            <div key={descriptor.name} className="fb-field">
                <Typography variant="subheading">{t(descriptor.labelKey)}</Typography>
                <ul className="fb-options">
                    {items.map((option, index) => {
                        const optionKey = `${field.id}-${descriptor.name}-${index}`;
                        return (
                            <li key={optionKey} className="fb-option-row">
                                <Input
                                    value={option}
                                    placeholder={itemLabel(index + 1)}
                                    onChange={event => {
                                        const next = [...items];
                                        next[index] = event.target.value;
                                        updateProperty(descriptor.name, next);
                                    }}
                                />
                                <Button
                                    label={removeLabel}
                                    onClick={() => {
                                        const next = items.filter((_, idx) => idx !== index);
                                        updateProperty(descriptor.name, next);
                                    }}
                                />
                            </li>
                        );
                    })}
                </ul>
                <Button
                    label={addLabel}
                    onClick={() => updateProperty(descriptor.name, [...items, ''])}
                />
            </div>
        );
    };

    const renderPropertyField = descriptor => {
        const value = field.properties?.[descriptor.name];
        const label = t(descriptor.labelKey);
        const key = `${field.id}-${descriptor.name}`;

        switch (descriptor.type) {
            case 'boolean':
                return (
                    <div key={key} className="fb-field fb-field--inline">
                        <Typography variant="subheading">{label}</Typography>
                        <Checkbox
                            id={`${key}-checkbox`}
                            checked={Boolean(value)}
                            aria-label={label}
                            onChange={(event, data, checked) => updateProperty(descriptor.name, checked)}
                        />
                    </div>
                );
            case 'text':
                return (
                    <div key={key} className="fb-field">
                        <Typography variant="subheading">{label}</Typography>
                        <Input
                            value={value || ''}
                            placeholder={descriptor.placeholderKey ? t(descriptor.placeholderKey) : undefined}
                            onChange={event => updateProperty(descriptor.name, event.target.value)}
                        />
                    </div>
                );
            case 'multiline':
                return (
                    <div key={key} className="fb-field">
                        <Typography variant="subheading">{label}</Typography>
                        <FormTextarea
                            rows={4}
                            value={value || ''}
                            onChange={event => updateProperty(descriptor.name, event.target.value)}
                        />
                    </div>
                );
            case 'number':
                return (
                    <div key={key} className="fb-field">
                        <Typography variant="subheading">{label}</Typography>
                        <Input
                            type="number"
                            value={value === null || value === undefined ? '' : value}
                            onChange={event => {
                                const nextValue = event.target.value === '' ? null : Number(event.target.value);
                                updateProperty(descriptor.name, Number.isNaN(nextValue) ? null : nextValue);
                            }}
                        />
                    </div>
                );
            case 'date':
                return (
                    <div key={key} className="fb-field">
                        <Typography variant="subheading">{label}</Typography>
                        <Input
                            type="date"
                            value={value || ''}
                            onChange={event => updateProperty(descriptor.name, event.target.value || null)}
                        />
                    </div>
                );
            case 'datetime':
                return (
                    <div key={key} className="fb-field">
                        <Typography variant="subheading">{label}</Typography>
                        <Input
                            type="datetime-local"
                            value={value || ''}
                            onChange={event => updateProperty(descriptor.name, event.target.value || null)}
                        />
                    </div>
                );
            case 'select': {
                const data = (descriptor.options || []).map(option => ({
                    value: option.value,
                    label: t(option.labelKey)
                }));
                const selectedValue = value || descriptor.defaultValue || data[0]?.value || '';

                return (
                    <div key={key} className="fb-field">
                        <Typography variant="subheading">{label}</Typography>
                        <Dropdown
                            data={data}
                            value={selectedValue}
                            placeholder={t('builder.fields.properties.selectPlaceholder')}
                            onChange={(event, item) => updateProperty(descriptor.name, item.value)}
                        />
                    </div>
                );
            }

            case 'stringList':
                return renderStringListField(descriptor);
            default:
                return null;
        }
    };

    const renderCheckboxOptions = () => {
        if (field.type !== 'checkboxGroup') {
            return null;
        }

        const options = field.fields || [];
        const updateNestedField = (optionId, partial) => onChangeField(stepId, optionId, partial);
        const updateNestedProperties = (optionId, propertiesPartial) => {
            const option = options.find(item => item.id === optionId);
            const nextProps = {...(option?.properties || {}), ...propertiesPartial};
            updateNestedField(optionId, {properties: nextProps});
        };

        return (
            <div className="fb-field fb-option-section">
                <div className="fb-option-section__header">
                    <Typography variant="subheading">{t('builder.fields.checkboxGroup.optionsTitle')}</Typography>
                    <Button
                        color="accent"
                        label={t('builder.fields.checkboxGroup.addOption')}
                        onClick={() => {
                            const index = options.length + 1;
                            const optionLabel = t('builder.fields.checkboxGroup.optionLabel', {index});
                            onAddNestedField({
                                parentPath: field.path,
                                typeId: 'inputCheckbox',
                                label: optionLabel,
                                properties: {
                                    value: `option-${index}`,
                                    defaultChecked: false
                                }
                            });
                        }}
                    />
                </div>
                {options.length === 0 && (
                    <Typography variant="body">{t('builder.fields.checkboxGroup.empty')}</Typography>
                )}
                {options.length > 0 && (
                    <div className="fb-option-card-list">
                        {options.map((option, idx) => (
                            <div key={option.id} className="fb-option-card">
                                <div className="fb-option-card__header">
                                    <Typography variant="body">{t('builder.fields.checkboxGroup.optionLabel', {index: idx + 1})}</Typography>
                                </div>
                                <div className="fb-option-card__grid">
                                    <div className="fb-field">
                                        <Typography variant="caption">{t('builder.fields.select.optionLabelLabel')}</Typography>
                                        <Input
                                            value={option.label || ''}
                                            onChange={event => updateNestedField(option.id, {label: event.target.value})}
                                        />
                                    </div>
                                    <div className="fb-field">
                                        <Typography variant="caption">{t('builder.fields.select.optionValueLabel')}</Typography>
                                        <Input
                                            value={option.properties?.value || ''}
                                            onChange={event => updateNestedProperties(option.id, {value: event.target.value})}
                                        />
                                    </div>
                                    <div className="fb-field fb-field--inline">
                                        <Typography variant="caption">{t('builder.fields.properties.defaultChecked')}</Typography>
                                        <Checkbox
                                            checked={Boolean(option.properties?.defaultChecked)}
                                            onChange={(event, data, checked) => updateNestedProperties(option.id, {defaultChecked: checked})}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderRadioOptions = () => {
        if (field.type !== 'radioGroup') {
            return null;
        }

        const options = field.fields || [];
        const updateNestedField = (optionId, partial) => onChangeField(stepId, optionId, partial);
        const updateNestedProperties = (optionId, propertiesPartial) => {
            const option = options.find(item => item.id === optionId);
            const nextProps = {...(option?.properties || {}), ...propertiesPartial};
            updateNestedField(optionId, {properties: nextProps});
        };

        const handleDefaultToggle = (optionId, checked) => {
            options.forEach(item => {
                const isTarget = item.id === optionId;
                const currentValue = Boolean(item.properties?.defaultChecked);
                if (isTarget) {
                    if (currentValue !== checked) {
                        updateNestedProperties(item.id, {defaultChecked: checked});
                    }
                } else if (checked && currentValue) {
                    updateNestedProperties(item.id, {defaultChecked: false});
                }
            });
        };

        return (
            <div className="fb-field fb-option-section">
                <div className="fb-option-section__header">
                    <Typography variant="subheading">{t('builder.fields.radioGroup.optionsTitle')}</Typography>
                    <Button
                        color="accent"
                        label={t('builder.fields.radioGroup.addOption')}
                        onClick={() => {
                            const index = options.length + 1;
                            const optionLabel = t('builder.fields.radioGroup.optionLabel', {index});
                            onAddNestedField({
                                parentPath: field.path,
                                typeId: 'inputRadio',
                                label: optionLabel,
                                properties: {
                                    value: `option-${index}`,
                                    defaultChecked: false
                                }
                            });
                        }}
                    />
                </div>
                {options.length === 0 && (
                    <Typography variant="body">{t('builder.fields.radioGroup.empty')}</Typography>
                )}
                {options.length > 0 && (
                    <div className="fb-option-card-list">
                        {options.map((option, idx) => (
                            <div key={option.id} className="fb-option-card">
                                <div className="fb-option-card__header">
                                    <Typography variant="body">{t('builder.fields.radioGroup.optionLabel', {index: idx + 1})}</Typography>
                                </div>
                                <div className="fb-option-card__grid">
                                    <div className="fb-field">
                                        <Typography variant="caption">{t('builder.fields.select.optionLabelLabel')}</Typography>
                                        <Input
                                            value={option.label || ''}
                                            onChange={event => updateNestedField(option.id, {label: event.target.value})}
                                        />
                                    </div>
                                    <div className="fb-field">
                                        <Typography variant="caption">{t('builder.fields.select.optionValueLabel')}</Typography>
                                        <Input
                                            value={option.properties?.value || ''}
                                            onChange={event => updateNestedProperties(option.id, {value: event.target.value})}
                                        />
                                    </div>
                                    <div className="fb-field fb-field--inline">
                                        <Typography variant="caption">{t('builder.fields.properties.defaultChecked')}</Typography>
                                        <Checkbox
                                            checked={Boolean(option.properties?.defaultChecked)}
                                            onChange={(event, data, checked) => handleDefaultToggle(option.id, checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderSelectOptions = () => {
        if (field.type !== 'select') {
            return null;
        }

        const options = Array.isArray(field.properties?.options) ? field.properties.options : [];
        const allowMultiple = Boolean(field.properties?.multiple);

        const updateOptions = next => updateProperty('options', next);

        const updateOption = (index, partial) => {
            updateOptions(options.map((option, idx) => (idx === index ? {...option, ...partial} : option)));
        };

        const toggleSelected = index => {
            updateOptions(options.map((option, idx) => {
                if (idx === index) {
                    return {...option, selected: !option.selected};
                }

                if (!allowMultiple && idx !== index) {
                    return {...option, selected: false};
                }

                return option;
            }));
        };

        const removeOption = index => {
            updateOptions(options.filter((_, idx) => idx !== index));
        };

        const addOption = () => {
            const index = options.length + 1;
            updateOptions([
                ...options,
                {
                    label: t('builder.fields.select.optionLabel', {index}),
                    value: `option-${Date.now()}`,
                    selected: false
                }
            ]);
        };

        return (
            <div className="fb-field fb-option-section">
                <div className="fb-option-section__header">
                    <Typography variant="subheading">{t('builder.fields.select.optionsTitle')}</Typography>
                    <Button color="accent" label={t('builder.fields.select.addOption')} onClick={addOption}/>
                </div>
                {options.length === 0 && (
                    <Typography variant="body">{t('builder.fields.select.empty')}</Typography>
                )}
                {options.length > 0 && (
                    <div className="fb-option-card-list">
                        {options.map((option, idx) => (
                            <div key={`select-option-${option.value || idx}`} className="fb-option-card">
                                <div className="fb-option-card__header">
                                    <Typography variant="body">{t('builder.fields.select.optionLabel', {index: idx + 1})}</Typography>
                                    <Button label={t('builder.fields.properties.listRemove')} onClick={() => removeOption(idx)}/>
                                </div>
                                <div className="fb-option-card__grid">
                                    <div className="fb-field">
                                        <Typography variant="caption">{t('builder.fields.select.optionLabelLabel')}</Typography>
                                        <Input value={option.label || ''} onChange={event => updateOption(idx, {label: event.target.value})}/>
                                    </div>
                                    <div className="fb-field">
                                        <Typography variant="caption">{t('builder.fields.select.optionValueLabel')}</Typography>
                                        <Input value={option.value || ''} onChange={event => updateOption(idx, {value: event.target.value})}/>
                                    </div>
                                    <div className="fb-field fb-field--inline">
                                        <Typography variant="caption">{t('builder.fields.select.optionSelected')}</Typography>
                                        <Checkbox checked={Boolean(option.selected)} onChange={() => toggleSelected(idx)}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Paper className="fb-field-editor">
            <div className="fb-field-editor__header">
                <Typography variant="subheading">{t('builder.fields.editorTitle')}</Typography>
                <Typography variant="caption" className="fb-field-editor__type">
                    {typeLabel}
                </Typography>
            </div>

            <div className="fb-field">
                <Typography variant="subheading">{t('builder.fields.label')}</Typography>
                <Input
                    value={field.label || ''}
                    onChange={event => {
                        const nextLabel = event.target.value;
                        updateField({
                            label: nextLabel,
                            properties: {
                                ...field.properties,
                                'jcr:title': nextLabel
                            }
                        });
                    }}
                />
            </div>

            <div className="fb-field">
                <Typography variant="subheading">{t('builder.fields.name')}</Typography>
                <Input value={field.name} onChange={event => updateField({name: event.target.value})}/>
            </div>

            {beforeBoolean.map(renderPropertyField)}

            {booleanDescriptors.length > 0 && (
                <div className="fb-boolean-group">
                    {booleanDescriptors.map(renderPropertyField)}
                </div>
            )}

            {afterBoolean.map(renderPropertyField)}

            {renderCheckboxOptions()}
            {renderRadioOptions()}
            {renderSelectOptions()}
        </Paper>
    );
};

FieldEditor.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        name: PropTypes.string,
        path: PropTypes.string,
        type: PropTypes.string,
        properties: PropTypes.object,
        fields: PropTypes.array
    }),
    stepId: PropTypes.string,
    onChangeField: PropTypes.func.isRequired,
    onAddNestedField: PropTypes.func
};

FieldEditor.defaultProps = {
    field: null,
    stepId: null,
    onAddNestedField: () => {}
};
