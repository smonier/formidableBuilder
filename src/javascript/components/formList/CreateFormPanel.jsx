import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Paper, Typography, Button, Input, Textarea as MoonstoneTextarea} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {FORM_NAMESPACE} from '../../constants/formBuilder';

const INITIAL_STATE = {
    title: '',
    intro: ''
};

export const CreateFormPanel = ({isOpen, onCancel, onSubmit, isLoading}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const [formData, setFormData] = useState(INITIAL_STATE);
    const FormTextarea = MoonstoneTextarea || (({className = '', ...props}) => (
        <textarea className={`fb-textarea ${className}`.trim()} {...props}/>
    ));

    useEffect(() => {
        if (!isOpen) {
            setFormData(INITIAL_STATE);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const isDisabled = !formData.title || isLoading;

    return (
        <Paper className="fb-panel">
            <div className="fb-panel__header">
                <Typography variant="heading">{t('list.create.title')}</Typography>
                <Typography variant="body">{t('list.create.description')}</Typography>
            </div>
            <div className="fb-panel__body">
                <div className="fb-field">
                    <Typography variant="subheading">{t('list.fields.title')}</Typography>
                    <Input
                        value={formData.title}
                        placeholder={t('list.fields.titlePlaceholder')}
                        size="big"
                        onChange={event => handleChange('title', event.target.value)}
                    />
                </div>
                <div className="fb-field">
                    <Typography variant="subheading">{t('list.fields.intro')}</Typography>
                    <FormTextarea
                        value={formData.intro}
                        placeholder={t('list.fields.introPlaceholder')}
                        rows={4}
                        onChange={event => handleChange('intro', event.target.value)}
                    />
                </div>
            </div>
            <div className="fb-panel__actions">
                <Button label={t('actions.cancel')} size="big" onClick={onCancel}/>
                <Button
                    label={isLoading ? t('actions.creating') : t('actions.create')}
                    size="big"
                    color="accent"
                    isDisabled={isDisabled}
                    onClick={() => onSubmit(formData)}
                />
            </div>
        </Paper>
    );
};

CreateFormPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
};

CreateFormPanel.defaultProps = {
    isLoading: false
};
