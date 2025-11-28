import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {LayoutContent, Typography, Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useFormEditor} from '../../hooks/useFormEditor';
import {FORM_NAMESPACE} from '../../constants/formBuilder';
import './FormPreview.scss';

// Wrapper component to handle CSS injection
const FormPreviewWrapper = ({css, children}) => {
    useEffect(() => {
        // Function to add !important to CSS declarations and prefix selectors
        const processCss = cssString => {
            if (!cssString) {
                return cssString;
            }

            // First, remove all CSS comments (block comments /* */) to avoid processing them as selectors
            // Note: CSS doesn't support line comments //, but we handle them carefully to avoid breaking URLs
            let processed = cssString.replace(/\/\*[\s\S]*?\*\//g, '');

            // Then, add !important to property declarations
            // Match property: value pairs and add !important
            processed = processed.replace(/([a-zA-Z-]+)\s*:\s*([^;{}]+)([;}])/g, (match, property, value, end) => {
                // Skip if already has !important
                if (value.includes('!important')) {
                    return match;
                }

                return `${property}: ${value} !important${end}`;
            });

            // Then prefix selectors with .fmdb-preview-instance
            // Match selectors followed by {
            processed = processed.replace(/([^{}]+)\s*\{/g, (match, selectors) => {
                // Skip if already contains .fmdb-preview-instance
                if (selectors.includes('.fmdb-preview-instance')) {
                    return match;
                }

                // Split by comma and prefix each selector
                const prefixedSelectors = selectors.split(',').map(sel => {
                    const trimmed = sel.trim();
                    // Skip empty selectors
                    if (!trimmed) {
                        return trimmed;
                    }

                    return `.fmdb-preview-instance ${trimmed}`;
                }).join(', ');

                return `${prefixedSelectors} {`;
            });

            return processed;
        };

        // For testing - inject some basic CSS if no custom CSS is provided
        const cssToInject = css ? processCss(css) : `
            .fmdb-preview-instance .fmdb-form-group { margin-bottom: 20px !important; }
            .fmdb-preview-instance .fmdb-form-label { display: block !important; margin-bottom: 5px !important; font-weight: bold !important; color: #333 !important; }
            .fmdb-preview-instance .fmdb-form-control { padding: 8px !important; border: 1px solid #ccc !important; border-radius: 4px !important; width: 100% !important; }
            .fmdb-preview-instance .fmdb-form-control:focus { outline: none !important; border-color: #007bff !important; box-shadow: 0 0 0 2px rgba(0,123,255,0.25) !important; }
            .fmdb-preview-instance .fmdb-btn { padding: 10px 20px !important; border: none !important; border-radius: 4px !important; cursor: pointer !important; font-size: 14px !important; }
            .fmdb-preview-instance .fmdb-btn-primary { background: #6b8cff !important; border-color: #6b8cff !important; color: #fff !important }
            .fmdb-preview-instance .fmdb-btn-primary:hover { background: #0056b3 !important; }
            .fmdb-preview-instance .fmdb-btn-secondary { background: #6c757d !important; color: white !important; }
            .fmdb-preview-instance .fmdb-btn-secondary:hover { background: #545b62 !important; }
            .fmdb-preview-instance .fmdb-select { background: white !important; }
            .fmdb-preview-instance .fmdb-textarea { resize: vertical !important; min-height: 80px !important; }
            .fmdb-preview-instance .fmdb-radio-group { margin-top: 5px !important; }
            .fmdb-preview-instance .fmdb-radio-wrapper { display: block !important; margin-bottom: 5px !important; }
            .fmdb-preview-instance .fmdb-radio { margin-right: 8px !important; }
            .fmdb-preview-instance .fmdb-required-indicator { color: red !important; }
        `;

        // Remove any existing fmdb style
        const existingStyle = document.getElementById('fmdb-custom-css');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create and inject new style into document head
        const style = document.createElement('style');
        style.id = 'fmdb-custom-css';
        style.textContent = cssToInject;
        document.head.appendChild(style);

        console.log('FormPreviewWrapper - CSS injected:', Boolean(css));
        console.log('FormPreviewWrapper - Raw CSS from JCR:', css ? css.substring(0, 200) + '...' : 'none');
        console.log('FormPreviewWrapper - Processed CSS (first 500 chars):', cssToInject.substring(0, 500) + '...');
        console.log('FormPreviewWrapper - Style element in head:', Boolean(document.getElementById('fmdb-custom-css')));

        // Debug: Check if our CSS rules are present
        setTimeout(() => {
            const styleElement = document.getElementById('fmdb-custom-css');
            if (styleElement) {
                console.log('FormPreviewWrapper - Style content length:', styleElement.textContent.length);
                console.log('FormPreviewWrapper - Style content preview:', styleElement.textContent.substring(0, 300) + '...');

                // Check if our specific rules are in the CSS
                const hasBtnRule = styleElement.textContent.includes('.fmdb-preview-instance .fmdb-btn');
                const hasPrimaryRule = styleElement.textContent.includes('.fmdb-preview-instance .fmdb-btn-primary');
                console.log('FormPreviewWrapper - Has .fmdb-btn rule:', hasBtnRule);
                console.log('FormPreviewWrapper - Has .fmdb-btn-primary rule:', hasPrimaryRule);
            }

            // Check if buttons have the styles applied
            setTimeout(() => {
                const buttons = document.querySelectorAll('.fmdb-btn');
                if (buttons.length > 0) {
                    const firstButton = buttons[0];
                    const computedStyle = window.getComputedStyle(firstButton);
                    console.log('FormPreviewWrapper - First button background:', computedStyle.background);
                    console.log('FormPreviewWrapper - First button color:', computedStyle.color);
                    console.log('FormPreviewWrapper - First button classes:', firstButton.className);
                } else {
                    console.log('FormPreviewWrapper - No .fmdb-btn elements found');
                }
            }, 200);
        }, 100);

        // Verify the style was added correctly
        setTimeout(() => {
            const styleElement = document.getElementById('fmdb-custom-css');
            console.log('FormPreviewWrapper - Style element still exists:', Boolean(styleElement));
            if (styleElement) {
                console.log('FormPreviewWrapper - Style content length:', styleElement.textContent.length);
                console.log('FormPreviewWrapper - Style content preview:', styleElement.textContent.substring(0, 200) + '...');
            }
        }, 100);

        // Cleanup function
        return () => {
            const styleElement = document.getElementById('fmdb-custom-css');
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, [css]);

    return children;
};

FormPreviewWrapper.propTypes = {
    css: PropTypes.string,
    children: PropTypes.node.isRequired
};

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
                    <div className="fmdb-form-group">
                        <label className="fmdb-form-label">
                            {label}
                            {properties.required && <span className="fmdb-required-indicator">*</span>}
                        </label>
                        <input
                            type={type.replace('input', '').toLowerCase()}
                            value={value}
                            placeholder={properties.placeholder || ''}
                            className="fmdb-form-control"
                            required={properties.required}
                            onChange={e => handleFieldChange(id, e.target.value)}
                        />
                    </div>
                );
            case 'inputFile':
                return (
                    <div className="fmdb-form-group">
                        <label className="fmdb-form-label">
                            {label}
                            {properties.required && <span className="fmdb-required-indicator">*</span>}
                        </label>
                        <input
                            type="file"
                            className="fmdb-form-control fmdb-file"
                            required={properties.required}
                            onChange={e => handleFieldChange(id, e.target.files[0])}
                        />
                    </div>
                );
            case 'inputCheckbox':
                return (
                    <div className="fmdb-form-group">
                        <label className="fmdb-checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={formData[id] || properties.defaultChecked || false}
                                className="fmdb-checkbox"
                                onChange={e => handleFieldChange(id, e.target.checked)}
                            />
                            <span className="fmdb-form-label">{label}</span>
                        </label>
                    </div>
                );

            case 'checkboxGroup': {
                const checkboxOptions = field.fields || [];
                return (
                    <div className="fmdb-form-group">
                        <div className="fmdb-form-label">{label}</div>
                        <div className="fmdb-checkbox-group">
                            {checkboxOptions.map(option => (
                                <label key={option.id} className="fmdb-checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={formData[option.id] || option.properties?.defaultChecked || false}
                                        className="fmdb-checkbox"
                                        onChange={e => handleFieldChange(option.id, e.target.checked)}
                                    />
                                    <span>{option.label || option.name}</span>
                                </label>
                            ))}
                            {checkboxOptions.length === 0 && (
                                <span className="fb-field-preview__placeholder">No options configured</span>
                            )}
                        </div>
                    </div>
                );
            }

            case 'radioGroup': {
                const radioOptions = field.fields || [];
                return (
                    <div className="fmdb-form-group">
                        <div className="fmdb-form-label">{label}</div>
                        <div className="fmdb-radio-group">
                            {radioOptions.map(option => (
                                <label key={option.id} className="fmdb-radio-wrapper">
                                    <input
                                        type="radio"
                                        checked={formData[id] === option.id || option.properties?.defaultChecked}
                                        name={`preview-${id}`}
                                        className="fmdb-radio"
                                        onChange={() => handleFieldChange(id, option.id)}
                                    />
                                    <span>{option.label || option.name}</span>
                                </label>
                            ))}
                            {radioOptions.length === 0 && (
                                <span className="fb-field-preview__placeholder">No options configured</span>
                            )}
                        </div>
                    </div>
                );
            }

            case 'select':
                return (
                    <div className="fmdb-form-group">
                        <label className="fmdb-form-label">
                            {label}
                            {properties.required && <span className="fmdb-required-indicator">*</span>}
                        </label>
                        <select
                            value={value}
                            className="fmdb-form-control fmdb-select"
                            required={properties.required}
                            onChange={e => handleFieldChange(id, e.target.value)}
                        >
                            {(properties.options || []).map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            case 'textarea':
                return (
                    <div className="fmdb-form-group">
                        <label className="fmdb-form-label">
                            {label}
                            {properties.required && <span className="fmdb-required-indicator">*</span>}
                        </label>
                        <textarea
                            value={value}
                            placeholder={properties.placeholder || ''}
                            rows={properties.rows || 3}
                            className="fmdb-form-control fmdb-textarea"
                            required={properties.required}
                            onChange={e => handleFieldChange(id, e.target.value)}
                        />
                    </div>
                );
            case 'inputButton':
                return (
                    <button
                        type="button"
                        className={`fmdb-btn fmdb-btn-${properties.variant || 'primary'}`}
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
        // CSS is now injected via useEffect into document head

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

        console.log('renderFormPreview - css value:', form.properties?.css);

        return (
            <FormPreviewWrapper css={form.properties?.css}>
                <div className="fmdb-form fmdb-preview-instance">
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
                        className="fmdb-btn fmdb-btn-primary"
                        onClick={handleSubmit}
                        >
                            {submitBtnLabel}
                        </button>
                        {showResetBtn && (
                        <button
                            type="button"
                            className="fmdb-btn fmdb-btn-secondary"
                            onClick={handleReset}
                        >
                            {resetBtnLabel}
                        </button>
                    )}
                        {showNewFormBtn && (
                        <button
                            type="button"
                            className="fmdb-btn fmdb-btn-secondary"
                            onClick={handleNewForm}
                        >
                            {newFormBtnLabel}
                        </button>
                    )}
                        {showTryAgainBtn && (
                        <button
                            type="button"
                            className="fmdb-btn fmdb-btn-secondary"
                            onClick={handleTryAgain}
                        >
                            {tryAgainBtnLabel}
                        </button>
                    )}
                    </div>
                </div>
            </FormPreviewWrapper>
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
