import React, {useMemo, useState} from 'react';
import {useHistory, useRouteMatch} from 'react-router';
import {Button, Chip, LayoutContent, Loader, Paper, Typography, Header} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {CreateFormPanel} from './CreateFormPanel';
import {useFormList} from '../../hooks/useFormList';
import {FORM_NAMESPACE} from '../../constants/formBuilder';
import {useFormBuilderContext} from '../../contexts/FormBuilderContext';
import {Copy, Delete as DeleteIcon, Edit as EditIcon, Setting as SettingIcon, ViewStream, Visibility} from '@jahia/moonstone/dist/icons';
import './FormListView.scss';

export const FormListView = () => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const history = useHistory();
    const match = useRouteMatch();
    const {language} = useFormBuilderContext();
    const {forms, loading, createForm, deleteForm, refetch} = useFormList();
    const [createOpen, setCreateOpen] = useState(false);

    const basePath = (match?.url || '/form-builder').replace(/\*$/, '');

    const navigateToForm = form => {
        history.push({
            pathname: `${basePath}/${form.id}`,
            state: {formTitle: form.title}
        });
    };

    const navigateToSettings = form => {
        history.push({
            pathname: `${basePath}/${form.id}/settings`,
            state: {formTitle: form.title}
        });
    };

    const navigateToPreview = form => {
        history.push(`${basePath}/${form.id}?view=preview`);
    };

    const navigateToSubmissions = form => {
        history.push(`${basePath}/${form.id}?view=submissions`);
    };

    const handleDelete = async form => {
        /* eslint-disable-next-line no-alert */
        const confirmed = window.confirm(t('list.actions.deleteConfirm', {title: form.title}));
        if (!confirmed) {
            return;
        }

        await deleteForm(form.path);
    };

    const formatUpdatedAt = useMemo(() => {
        let formatter = null;
        try {
            formatter = new Intl.DateTimeFormat(language || 'en', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch (error) {
            console.warn('Unable to format date for locale', language, error);
        }

        return value => {
            if (!value) {
                return t('list.cards.neverUpdated');
            }

            try {
                return formatter ? formatter.format(new Date(value)) : value;
            } catch {
                return value;
            }
        };
    }, [language, t]);

    const handleDuplicate = async form => {
        const duplicateTitle = t('list.cards.duplicateName', {title: form.title});
        await createForm({
            title: duplicateTitle,
            intro: form.intro
        });
    };

    return (
        <LayoutContent
            header={(
                <Header
                    title={t('list.title')}
                    subtitle={t('list.subtitle')}
                    mainActions={[
                        <Button
                            key="refresh"
                            size="big"
                            label={t('actions.refresh')}
                            isDisabled={loading}
                            onClick={() => refetch()}
                        />,
                        <Button
                            key="createForm"
                            color="accent"
                            size="big"
                            label={t('actions.create')}
                            onClick={() => setCreateOpen(true)}
                        />
                    ]}
                />
            )}
            content={(
                <div className="fb-list">
                    {createOpen && (
                        <div className="fb-list__section">
                            <CreateFormPanel
                                isOpen={createOpen}
                                isLoading={loading}
                                onCancel={() => setCreateOpen(false)}
                                onSubmit={async payload => {
                                    await createForm(payload);
                                    setCreateOpen(false);
                                }}
                            />
                        </div>
                    )}

                    <Paper className="fb-list__panel fb-list__section">
                        {loading && (
                            <div className="fb-list__loading">
                                <Loader size="big"/>
                                <Typography variant="body">{t('states.loading')}</Typography>
                            </div>
                        )}

                        {!loading && forms.length === 0 && (
                            <div className="fb-list__empty">
                                <Typography variant="body">{t('list.empty')}</Typography>
                            </div>
                        )}

                        {!loading && forms.length > 0 && (
                            <div className="fb-card-grid">
                                {forms.map(form => (
                                    <Paper key={form.id} className="fb-card">
                                        <div className="fb-card__header">
                                            <div className="fb-card__title">
                                                <Typography variant="subheading">{form.title}</Typography>
                                                <Typography variant="caption">{form.name}</Typography>
                                            </div>
                                            <Chip
                                                color="accent"
                                                size="small"
                                                label={t('list.columns.stepCount', {count: form.steps})}
                                            />
                                        </div>

                                        <div className="fb-card__intro">
                                            {form.intro ? (
                                                <div
                                                    /* eslint-disable-next-line react/no-danger */
                                                    dangerouslySetInnerHTML={{__html: form.intro}}
                                                    className="fb-card__intro-html"
                                                />
                                            ) : (
                                                <Typography variant="body">{t('list.cards.introFallback')}</Typography>
                                            )}
                                        </div>

                                        <div className="fb-card__meta">
                                            <div className="fb-card__meta-item">
                                                <Typography variant="caption">{t('list.cards.updated')}</Typography>
                                                <Typography variant="body">{formatUpdatedAt(form.updatedAt)}</Typography>
                                            </div>
                                        </div>

                                        <div className="fb-card__actions">
                                            {[
                                                [
                                                    {
                                                        key: 'preview',
                                                        label: t('actions.preview'),
                                                        onClick: () => navigateToPreview(form),
                                                        icon: Visibility
                                                    },
                                                    {
                                                        key: 'submissions',
                                                        label: t('actions.submissions'),
                                                        onClick: () => navigateToSubmissions(form),
                                                        icon: ViewStream
                                                    },
                                                    {
                                                        key: 'settings',
                                                        label: t('actions.settings'),
                                                        onClick: () => navigateToSettings(form),
                                                        icon: SettingIcon
                                                    }
                                                ],
                                                [
                                                    {
                                                        key: 'duplicate',
                                                        label: t('actions.duplicate'),
                                                        onClick: () => handleDuplicate(form),
                                                        icon: Copy
                                                    },
                                                    {
                                                        key: 'edit',
                                                        label: t('actions.edit'),
                                                        onClick: () => navigateToForm(form),
                                                        icon: EditIcon
                                                    },
                                                    {
                                                        key: 'delete',
                                                        label: t('actions.delete'),
                                                        onClick: () => handleDelete(form),
                                                        icon: DeleteIcon,
                                                        color: 'danger'
                                                    }
                                                ]
                                            ].map(row => (
                                                <div key={`actions-row-${row.map(action => action.key).join('-')}`} className="fb-card__actions-row">
                                                    {row.map(action => {
                                                        const IconComponent = action.icon;
                                                        return (
                                                            <Button
                                                                key={action.key}
                                                                size="default"
                                                                variant="ghost"
                                                                color={action.color || 'default'}
                                                                icon={<IconComponent size="small"/>}
                                                                label={action.label}
                                                                onClick={action.onClick}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                        )}
                    </Paper>
                </div>
            )}
        />
    );
};
