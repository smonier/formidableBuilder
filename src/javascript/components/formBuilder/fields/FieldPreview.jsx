import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';

export const FieldPreview = ({field}) => {
    if (!field) {
        return null;
    }

    const renderField = () => {
        const {type, properties = {}, label} = field;

        switch (type) {
            case 'inputText':
            case 'inputEmail':
            case 'inputColor':
            case 'inputDate':
            case 'inputDatetimeLocal':
            case 'inputFile':
            case 'inputHidden':
                return (
                    <input
                        readOnly
                        type={type.replace('input', '').toLowerCase()}
                        disabled={type === 'inputFile'}
                        value={properties.defaultValue || ''}
                        placeholder={properties.placeholder || ''}
                        className="fb-field-preview__input"
                    />
                );
            case 'inputCheckbox':
                return (
                    <input
                        disabled
                        type="checkbox"
                        checked={properties.defaultChecked || false}
                        className="fb-field-preview__checkbox"
                    />
                );
            case 'checkboxGroup': {
                // Render checkboxes based on nested fields
                const checkboxOptions = field.fields || [];
                return (
                    <div className="fb-field-preview__group">
                        {checkboxOptions.map(option => (
                            <label key={option.id} className="fb-field-preview__option">
                                <input
                                    disabled
                                    type="checkbox"
                                    checked={option.properties?.defaultChecked || false}
                                />
                                <span>{option.label || option.name}</span>
                            </label>
                        ))}
                        {checkboxOptions.length === 0 && (
                            <span className="fb-field-preview__placeholder">No options configured</span>
                        )}
                    </div>
                );
            }

            case 'radioGroup': {
                // Render radio buttons based on nested fields
                const radioOptions = field.fields || [];
                return (
                    <div className="fb-field-preview__group">
                        {radioOptions.map(option => (
                            <label key={option.id} className="fb-field-preview__option">
                                <input
                                    disabled
                                    type="radio"
                                    checked={option.properties?.defaultChecked || false}
                                    name={`preview-${field.id}`}
                                />
                                <span>{option.label || option.name}</span>
                            </label>
                        ))}
                        {radioOptions.length === 0 && (
                            <span className="fb-field-preview__placeholder">No options configured</span>
                        )}
                    </div>
                );
            }

            case 'select':
                return (
                    <select disabled className="fb-field-preview__select">
                        {(properties.options || []).map(option => (
                            <option key={option.value} value={option.value} selected={option.selected}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'textarea':
                return (
                    <textarea
                        readOnly
                        value={properties.defaultValue || ''}
                        placeholder={properties.placeholder || ''}
                        rows={properties.rows || 3}
                        className="fb-field-preview__textarea"
                    />
                );
            case 'inputButton':
                return (
                    <button
                        disabled
                        type="button"
                        className={`fb-field-preview__button fb-field-preview__button--${properties.variant || 'primary'}`}
                    >
                        {label || 'Button'}
                    </button>
                );
            default:
                return (
                    <div className="fb-field-preview__unknown">
                        Unknown field type: {type}
                    </div>
                );
        }
    };

    return (
        <div className="fb-field-preview">
            {field.label && (
                <Typography variant="caption" className="fb-field-preview__label">
                    {field.label}
                </Typography>
            )}
            {renderField()}
        </div>
    );
};

FieldPreview.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        type: PropTypes.string.isRequired,
        properties: PropTypes.object,
        fields: PropTypes.array
    }).isRequired
};
