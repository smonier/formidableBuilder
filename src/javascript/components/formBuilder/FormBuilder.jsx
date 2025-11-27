import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {useHistory, useLocation} from 'react-router';
import {Button, LayoutContent, Loader, Typography, Header} from '@jahia/moonstone';
import {ChevronLeft} from '@jahia/moonstone/dist/icons';
import {useTranslation} from 'react-i18next';
import {Sidebar} from './sidebar/Sidebar';
import {StepEditor} from './steps/StepEditor';
import {FieldEditor} from './fields/FieldEditor';
import {useFormEditor} from '../../hooks/useFormEditor';
import {FORM_NAMESPACE} from '../../constants/formBuilder';
import './FormBuilder.scss';

export const FormBuilder = ({match}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const history = useHistory();
    const location = useLocation();
    const formId = match.params.formId;
    const basePath = match?.url ? match.url.replace(/\/[^/]+$/, '') : '/form-builder';
    const {
        form,
        loading,
        addStep,
        updateStepState,
        removeStep,
        reorderSteps,
        addField,
        addNestedField,
        updateFieldState,
        removeField,
        reorderFields,
        saveChanges,
        saving
    } = useFormEditor(formId);

    const [activeStepId, setActiveStepId] = useState(null);
    const [activeFieldId, setActiveFieldId] = useState(null);

    useEffect(() => {
        if (!form || form.steps.length === 0) {
            setActiveStepId(null);
            return;
        }

        if (!activeStepId) {
            setActiveStepId(form.steps[0].id);
            return;
        }

        const exists = form.steps.some(step => step.id === activeStepId);
        if (!exists) {
            setActiveStepId(form.steps[0].id);
        }
    }, [form, activeStepId]);

    const activeStep = useMemo(() => form?.steps?.find(step => step.id === activeStepId), [form, activeStepId]);

    useEffect(() => {
        if (!activeStep) {
            setActiveFieldId(null);
            return;
        }

        if (activeFieldId && activeStep.fields.find(field => field.id === activeFieldId)) {
            return;
        }

        if (activeStep.fields.length > 0) {
            setActiveFieldId(activeStep.fields[0].id);
        } else {
            setActiveFieldId(null);
        }
    }, [activeFieldId, activeStep]);

    const activeField = activeStep?.fields?.find(field => field.id === activeFieldId) || null;

    const handleRemoveStep = async stepId => {
        const step = form.steps.find(item => item.id === stepId);
        if (!step) {
            return;
        }

        /* eslint-disable-next-line no-alert */
        const confirmed = window.confirm(t('builder.sidebar.removeConfirm', {title: step.label}));
        if (!confirmed) {
            return;
        }

        await removeStep(stepId);
        setActiveFieldId(null);
    };

    const handleRemoveField = async (stepId, fieldId) => {
        const step = form.steps.find(item => item.id === stepId);
        const field = step?.fields.find(item => item.id === fieldId);
        if (!field) {
            return;
        }

        /* eslint-disable-next-line no-alert */
        const confirmed = window.confirm(t('builder.fields.removeConfirm', {title: field.label || field.name}));
        if (!confirmed) {
            return;
        }

        await removeField(stepId, fieldId);
        setActiveFieldId(null);
    };

    const initialTitle = location.state?.formTitle || '';
    const currentLabel = form?.label || form?.name || initialTitle;
    const headerPrefix = t('accordionTitle');
    const headerTitle = currentLabel ? `${headerPrefix} - ${currentLabel}` : headerPrefix;
    useEffect(() => {
        console.log('FormBuilder route context', {match, location, formId});
    }, [location, match, formId]);

    useEffect(() => {
        console.log('FormBuilder header data', {
            loading,
            formLabel: form?.label,
            formName: form?.name,
            initialTitle,
            currentLabel,
            headerTitle
        });
    }, [loading, form, initialTitle, currentLabel, headerTitle]);
    const backButton = (
        <button type="button" className="fb-back-button" onClick={() => history.push(basePath)}>
            <ChevronLeft size="big"/>
        </button>
    );
    const saveAction = (
        <Button
            key="save"
            color="accent"
            size="big"
            label={saving ? t('actions.saving') : t('actions.save')}
            isDisabled={saving || !form}
            onClick={saveChanges}
        />
    );

    const renderContent = () => {
        if (loading || !form) {
            return (
                <div className="fb-loading">
                    <Loader size="big"/>
                    <Typography variant="body">{t('states.loading')}</Typography>
                </div>
            );
        }

        return (
            <div className="fb-builder__wrapper">
                <div className="fb-builder__content">
                    <Sidebar
                        steps={form.steps}
                        activeStepId={activeStepId}
                        onSelectStep={setActiveStepId}
                        onAddStep={addStep}
                        onRemoveStep={handleRemoveStep}
                        onReorderSteps={order => reorderSteps(order)}
                    />
                    <div className="fb-builder__main">
                        <StepEditor
                            step={activeStep}
                            activeFieldId={activeFieldId}
                            onUpdateStep={(stepId, partial) => updateStepState(stepId, partial)}
                            onAddField={addField}
                            onRemoveField={handleRemoveField}
                            onSelectField={setActiveFieldId}
                            onReorderFields={(stepId, order) => reorderFields(stepId, order)}
                        />
                    </div>
                    <div className="fb-builder__side">
                        <FieldEditor
                            field={activeField}
                            stepId={activeStep?.id}
                            onChangeField={updateFieldState}
                            onAddNestedField={addNestedField}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <LayoutContent
            header={(
                <Header
                    title={headerTitle}
                    subtitle={t('list.subtitle')}
                    backButton={backButton}
                    mainActions={[saveAction]}
                />
            )}
            content={renderContent()}
        />
    );
};

FormBuilder.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            formId: PropTypes.string
        }).isRequired,
        path: PropTypes.string,
        url: PropTypes.string
    }).isRequired
};

const InputField = ({label, value, onChange}) => (
    <div className="fb-input">
        <Typography variant="caption">{label}</Typography>
        <input className="fb-input__control" value={value} onChange={event => onChange(event.target.value)}/>
    </div>
);

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
