import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {LayoutContent, Typography, Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useFormEditor} from '../../hooks/useFormEditor';
import {FORM_NAMESPACE} from '../../constants/formBuilder';
import './FormPreview.scss';

export const FormPreview = ({match}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const formId = match.params.formId;
    const {form, loading} = useFormEditor(formId);

    const [formData, setFormData] = useState({});
    const [activeStep, setActiveStep] = useState(0);

    const handleFieldChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    // eslint-disable-next-line complexity
    const renderEditableField = field => {
        if (!field) {
            return null;
        }

        const {type, properties = {}, label, id} = field;
        const value = formData[id] || properties.defaultValue || '';

        switch (type) {
            case 'inputText':
            case 'inputEmail':
            case 'inputColor':
            case 'inputDate':
            case 'inputDatetimeLocal':
                return (
                    <label className="fb-field-preview__label">
                        {label}
                        <input
                            type={type.replace('input', '').toLowerCase()}
                            value={value}
                            placeholder={properties.placeholder || ''}
                            className="fb-field-preview__input"
                            onChange={e => handleFieldChange(id, e.target.value)}
                        />
                    </label>
                );
            case 'inputFile':
                return (
                    <label className="fb-field-preview__label">
                        {label}
                        <input
                            type="file"
                            className="fb-field-preview__input"
                            onChange={e => handleFieldChange(id, e.target.files[0])}
                        />
                    </label>
                );
            case 'inputCheckbox':
                return (
                    <input
                        type="checkbox"
                        checked={formData[id] || properties.defaultChecked || false}
                        className="fb-field-preview__checkbox"
                        onChange={e => handleFieldChange(id, e.target.checked)}
                    />
                );

            case 'checkboxGroup': {
                const checkboxOptions = field.fields || [];
                return (
                    <div className="fb-field-preview__group">
                        <div className="fb-field-preview__label">{label}</div>
                        {checkboxOptions.map(option => (
                            <label key={option.id} className="fb-field-preview__option">
                                <input
                                    type="checkbox"
                                    checked={formData[option.id] || option.properties?.defaultChecked || false}
                                    onChange={e => handleFieldChange(option.id, e.target.checked)}
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
                const radioOptions = field.fields || [];
                return (
                    <div className="fb-field-preview__group">
                        <div className="fb-field-preview__label">{label}</div>
                        {radioOptions.map(option => (
                            <label key={option.id} className="fb-field-preview__option">
                                <input
                                    type="radio"
                                    checked={formData[id] === option.id || option.properties?.defaultChecked}
                                    name={`preview-${id}`}
                                    onChange={() => handleFieldChange(id, option.id)}
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
                    <label className="fb-field-preview__label">
                        {label}
                        <select
                            value={value}
                            className="fb-field-preview__select"
                            onChange={e => handleFieldChange(id, e.target.value)}
                        >
                            {(properties.options || []).map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                );
            case 'textarea':
                return (
                    <label className="fb-field-preview__label">
                        {label}
                        <textarea
                            value={value}
                            placeholder={properties.placeholder || ''}
                            rows={properties.rows || 3}
                            className="fb-field-preview__textarea"
                            onChange={e => handleFieldChange(id, e.target.value)}
                        />
                    </label>
                );
            case 'inputButton':
                return (
                    <button
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

    const renderFormPreview = () => {
        if (loading || !form) {
            return (
                <div className="fb-preview__loading">
                    <Typography variant="body">{t('states.loading')}</Typography>
                </div>
            );
        }

        // Apply custom CSS from form settings
        const customCss = form.properties?.css?.value || '';
        const cssStyle = customCss ? (
            // eslint-disable-next-line react/no-danger
            <style dangerouslySetInnerHTML={{__html: customCss}}/>
        ) : null;

        const steps = form.steps;

        // Get button settings from form properties
        const submitBtnLabel = form.properties?.submitBtnLabel || 'Submit';
        const resetBtnLabel = form.properties?.resetBtnLabel || 'Reset';
        const showResetBtn = Boolean(form.properties?.showResetBtn);
        const newFormBtnLabel = form.properties?.newFormBtnLabel || 'New Form';
        const showNewFormBtn = Boolean(form.properties?.showNewFormBtn);
        const tryAgainBtnLabel = form.properties?.tryAgainBtnLabel || 'Try Again';
        const showTryAgainBtn = Boolean(form.properties?.showTryAgainBtn);

        const handleSubmit = () => {
            // eslint-disable-next-line no-alert
            alert('Form submitted! Check console for data.');
            console.log('Form data:', formData);
        };

        const handleReset = () => {
            setFormData({});
        };

        const handleNewForm = () => {
            // eslint-disable-next-line no-alert
            alert('New form would be started.');
        };

        const handleTryAgain = () => {
            // eslint-disable-next-line no-alert
            alert('Try again would reset the form.');
            setFormData({});
        };

        return (
            <div className="fb-preview">
                {cssStyle}
                <div className="fb-preview__tabs">
                    {steps.map((step, index) => (
                        <Button
                            key={step.id}
                            variant={activeStep === index ? 'primary' : 'ghost'}
                            size="big"
                            label={step.label}
                            onClick={() => setActiveStep(index)}
                        />
                    ))}
                </div>
                <div className="fb-preview__step-content">
                    {steps[activeStep] && (
                        <div className="fb-preview__step">
                            {steps[activeStep].description && (
                                <Typography variant="body" className="fb-preview__step-description">
                                    {steps[activeStep].description}
                                </Typography>
                            )}
                            <div className="fb-preview__fields">
                                {steps[activeStep].fields.map(field => (
                                    <div key={field.id} className="fb-preview__field">
                                        {renderEditableField(field)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="fb-preview__buttons">
                    <button
                        type="button"
                        className="fb-field-preview__button fb-field-preview__button--primary"
                        onClick={handleSubmit}
                    >
                        {submitBtnLabel}
                    </button>
                    {showResetBtn && (
                        <button
                            type="button"
                            className="fb-field-preview__button fb-field-preview__button--secondary"
                            onClick={handleReset}
                        >
                            {resetBtnLabel}
                        </button>
                    )}
                    {showNewFormBtn && (
                        <button
                            type="button"
                            className="fb-field-preview__button fb-field-preview__button--secondary"
                            onClick={handleNewForm}
                        >
                            {newFormBtnLabel}
                        </button>
                    )}
                    {showTryAgainBtn && (
                        <button
                            type="button"
                            className="fb-field-preview__button fb-field-preview__button--secondary"
                            onClick={handleTryAgain}
                        >
                            {tryAgainBtnLabel}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <LayoutContent
            content={renderFormPreview()}
        />
    );
};

FormPreview.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            formId: PropTypes.string
        }).isRequired,
        url: PropTypes.string
    }).isRequired
};
