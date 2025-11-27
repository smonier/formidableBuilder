import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {Paper, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {FORM_NAMESPACE} from '../../../constants/formBuilder';

export const JSONPreview = ({form}) => {
    const {t} = useTranslation(FORM_NAMESPACE);

    const payload = useMemo(() => {
        if (!form) {
            return '{}';
        }

        return JSON.stringify({
            title: form.label,
            intro: form.intro,
            steps: form.steps.map(step => ({
                label: step.label,
                description: step.description,
                fields: step.fields.map(field => ({
                    label: field.label,
                    name: field.name,
                    type: field.type,
                    properties: field.properties
                }))
            }))
        }, null, 2);
    }, [form]);

    return (
        <Paper className="fb-json">
            <Typography variant="subheading">{t('builder.preview.title')}</Typography>
            <pre className="fb-json__code">{payload}</pre>
        </Paper>
    );
};

JSONPreview.propTypes = {
    form: PropTypes.object
};

JSONPreview.defaultProps = {
    form: null
};
