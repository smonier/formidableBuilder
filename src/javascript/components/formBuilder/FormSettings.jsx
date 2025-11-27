import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {useHistory, useLocation} from 'react-router';
import {Button, LayoutContent, Typography, Header, Paper, Input, Textarea, Switch} from '@jahia/moonstone';
import {ChevronLeft} from '@jahia/moonstone/dist/icons';
import {useTranslation} from 'react-i18next';
import {useQuery, useMutation} from '@apollo/client';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {FORMAT_TEXT_COMMAND} from 'lexical';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {$generateHtmlFromNodes, $generateNodesFromDOM} from '@lexical/html';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getRoot, $createTextNode, $createParagraphNode} from 'lexical';
import {FORM_NAMESPACE} from '../../constants/formBuilder';
import {useFormBuilderContext} from '../../contexts/FormBuilderContext';
import {GET_FORM_DETAILS} from '../../graphql/queries';
import {UPDATE_FORM_METADATA_MUTATION, UPDATE_FORM_MIXIN_RESPONSES_MUTATION, UPDATE_FORM_MIXIN_BUTTONS_MUTATION, UPDATE_FORM_MIXIN_ACTIONS_MUTATION, UPDATE_FORM_MIXIN_STYLE_MUTATION} from '../../graphql/mutations';
import './FormSettings.scss';

// Simple Toolbar Component
const Toolbar = () => {
    const [editor] = useLexicalComposerContext();

    const formatText = formatType => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
    };

    return (
        <div className="lexical-toolbar">
            <button
                type="button"
                className="lexical-toolbar-button"
                title="Bold"
                onClick={() => formatText('bold')}
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                className="lexical-toolbar-button"
                title="Italic"
                onClick={() => formatText('italic')}
            >
                <em>I</em>
            </button>
            <button
                type="button"
                className="lexical-toolbar-button"
                title="Underline"
                onClick={() => formatText('underline')}
            >
                <u>U</u>
            </button>
        </div>
    );
};

const ContentSetterPlugin = ({value}) => {
    const [editor] = useLexicalComposerContext();
    const hasSetInitialContentRef = useRef(false);

    // Share the setting state with ChangeHandlerPlugin
    useEffect(() => {
        // Access the ChangeHandlerPlugin's ref somehow? Wait, this won't work.
        // Actually, let's use a different approach. Let's pass a callback or use context.

        // For now, let's just prevent multiple content settings
        if (editor && value !== undefined && !hasSetInitialContentRef.current) {
            console.log('ContentSetterPlugin: editor ready, value:', value, 'type:', typeof value);
            // Small delay to ensure editor is fully ready
            const timeoutId = setTimeout(() => {
                // Mark that we're setting content
                window._isSettingLexicalContent = true;

                editor.update(() => {
                    console.log('ContentSetterPlugin: setting content:', value);
                    $getRoot().clear();

                    if (value && value.trim()) {
                        // Parse HTML content using Lexical's proper HTML import method
                        console.log('ContentSetterPlugin: parsing HTML content:', value);
                        try {
                            const parser = new DOMParser();
                            const dom = parser.parseFromString(value, 'text/html');
                            const nodes = $generateNodesFromDOM(editor, dom);
                            console.log('ContentSetterPlugin: generated nodes:', nodes.length);
                            for (const node of nodes) {
                                $getRoot().append(node);
                            }
                        } catch (error) {
                            console.error('ContentSetterPlugin: error parsing HTML:', error);
                            // Fallback to plain text
                            const paragraphNode = $createParagraphNode();
                            const textNode = $createTextNode(value);
                            $getRoot().append(paragraphNode);
                            paragraphNode.append(textNode);
                        }
                    } else {
                        console.log('ContentSetterPlugin: no value to set or empty value:', value);
                    }

                    console.log('ContentSetterPlugin: content set successfully');
                    hasSetInitialContentRef.current = true;

                    // Clear the flag after a short delay
                    setTimeout(() => {
                        window._isSettingLexicalContent = false;
                    }, 50);
                });
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [editor, value]);

    return null;
};

ContentSetterPlugin.propTypes = {
    value: PropTypes.string
};

// Plugin to handle changes and generate HTML
const ChangeHandlerPlugin = ({onChange}) => {
    const [editor] = useLexicalComposerContext();
    const lastHtmlRef = useRef(null);

    useEffect(() => {
        const unregister = editor.registerUpdateListener(({editorState}) => {
            // Don't trigger onChange if we're currently setting content
            if (window._isSettingLexicalContent) {
                return;
            }

            editorState.read(() => {
                const htmlString = $generateHtmlFromNodes(editor);
                if (htmlString !== lastHtmlRef.current) {
                    lastHtmlRef.current = htmlString;
                    onChange(htmlString);
                }
            });
        });

        return unregister;
    }, [editor, onChange]);

    return null;
};

ChangeHandlerPlugin.propTypes = {
    onChange: PropTypes.func.isRequired
};

// Lexical Editor Component with minimal toolbar
const LexicalEditor = ({value, onChange, placeholder, height = 120}) => {
    console.log('LexicalEditor: rendering with value:', value, 'type:', typeof value);

    const initialConfig = {
        namespace: 'FormidableEditor',
        onError: error => console.error('Lexical error:', error)
    };

    return (
        <div className="lexical-editor" style={{minHeight: height}}>
            <LexicalComposer initialConfig={initialConfig}>
                <Toolbar/>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="lexical-content-editable"
                            style={{minHeight: height - 60}}
                        />
                    }
                    placeholder={<div className="lexical-placeholder">{placeholder}</div>}
                />
                <HistoryPlugin/>
                <ChangeHandlerPlugin onChange={onChange}/>
                <ContentSetterPlugin value={value}/>
            </LexicalComposer>
        </div>
    );
};

LexicalEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    height: PropTypes.number
};

export const FormSettings = ({match}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const history = useHistory();
    const location = useLocation();
    const {workspace} = useFormBuilderContext();
    const formId = match.params.formId;
    const basePath = match?.url ? match.url.replace(/\/[^/]+$/, '') : '/form-builder';

    // Use the same query as FormBuilder but with English to get properties
    const {data, loading} = useQuery(GET_FORM_DETAILS, {
        variables: {
            workspace,
            language: 'en', // Use English to get the properties
            uuid: formId
        },
        fetchPolicy: 'no-cache',
        skip: !formId
    });

    // Form data state
    const [formData, setFormData] = useState({
        title: '',
        intro: '',
        submissionMessage: '',
        errorMessage: '',
        submitBtnLabel: '',
        resetBtnLabel: '',
        showResetBtn: false,
        newFormBtnLabel: '',
        showNewFormBtn: false,
        tryAgainBtnLabel: '',
        showTryAgainBtn: false,
        customTarget: '',
        css: ''
    });

    // Active tab state
    const [activeTab, setActiveTab] = useState('basic');

    const [updateFormMetadata] = useMutation(UPDATE_FORM_METADATA_MUTATION);
    const [updateResponses] = useMutation(UPDATE_FORM_MIXIN_RESPONSES_MUTATION);
    const [updateButtons] = useMutation(UPDATE_FORM_MIXIN_BUTTONS_MUTATION);
    const [updateActions] = useMutation(UPDATE_FORM_MIXIN_ACTIONS_MUTATION);
    const [updateStyle] = useMutation(UPDATE_FORM_MIXIN_STYLE_MUTATION);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data?.jcr?.nodeById) {
            const node = data.jcr.nodeById;
            const properties = node.properties || [];

            const getPropertyValue = name => {
                const prop = properties.find(p => p.name === name);
                return prop?.value || '';
            };

            const getBooleanPropertyValue = name => {
                const prop = properties.find(p => p.name === name);
                return prop?.value === 'true' || prop?.value === true;
            };

            const newFormData = {
                title: getPropertyValue('jcr:title') || node.displayName || node.name || '',
                intro: getPropertyValue('intro') || '',
                submissionMessage: getPropertyValue('submissionMessage') || '',
                errorMessage: getPropertyValue('errorMessage') || '',
                submitBtnLabel: getPropertyValue('submitBtnLabel') || 'Submit',
                resetBtnLabel: getPropertyValue('resetBtnLabel') || 'Reset',
                showResetBtn: getBooleanPropertyValue('showResetBtn'),
                newFormBtnLabel: getPropertyValue('newFormBtnLabel') || 'New Form',
                showNewFormBtn: getBooleanPropertyValue('showNewFormBtn'),
                tryAgainBtnLabel: getPropertyValue('tryAgainBtnLabel') || 'Try Again',
                showTryAgainBtn: getBooleanPropertyValue('showTryAgainBtn'),
                customTarget: getPropertyValue('customTarget') || '',
                css: getPropertyValue('css') || ''
            };

            console.log('FormSettings: loaded formData:', newFormData);
            setFormData(newFormData);
        }
    }, [data]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save basic form metadata
            await updateFormMetadata({
                variables: {
                    workspace: 'EDIT',
                    pathOrId: formId,
                    language: 'en',
                    title: formData.title,
                    intro: formData.intro
                }
            });

            // Save mixin properties
            await Promise.all([
                updateResponses({
                    variables: {
                        workspace: 'EDIT',
                        pathOrId: formId,
                        language: 'en',
                        submissionMessage: formData.submissionMessage,
                        errorMessage: formData.errorMessage
                    }
                }),
                updateButtons({
                    variables: {
                        workspace: 'EDIT',
                        pathOrId: formId,
                        language: 'en',
                        submitBtnLabel: formData.submitBtnLabel,
                        resetBtnLabel: formData.resetBtnLabel,
                        showResetBtn: formData.showResetBtn.toString(),
                        newFormBtnLabel: formData.newFormBtnLabel,
                        showNewFormBtn: formData.showNewFormBtn.toString(),
                        tryAgainBtnLabel: formData.tryAgainBtnLabel,
                        showTryAgainBtn: formData.showTryAgainBtn.toString()
                    }
                }),
                updateActions({
                    variables: {
                        workspace: 'EDIT',
                        pathOrId: formId,
                        customTarget: formData.customTarget
                    }
                }),
                updateStyle({
                    variables: {
                        workspace: 'EDIT',
                        pathOrId: formId,
                        css: formData.css
                    }
                })
            ]);
        } catch (error) {
            console.error('Error saving form settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const initialTitle = location.state?.formTitle || '';
    const currentLabel = formData.title || initialTitle;
    const headerPrefix = t('settings.title');
    const headerTitle = currentLabel ? `${headerPrefix} - ${currentLabel}` : headerPrefix;

    const backButton = (
        <button type="button" className="fb-back-button" onClick={() => history.push(`${basePath}/${formId}`)}>
            <ChevronLeft size="big"/>
        </button>
    );

    const saveAction = (
        <Button
            key="save"
            color="accent"
            size="big"
            label={saving ? t('actions.saving') : t('actions.save')}
            isDisabled={saving || loading}
            onClick={handleSave}
        />
    );

    const renderBasicSettings = () => (
        <div className="fs-settings__section">
            <Typography variant="heading" level={3}>{t('settings.basic.title')}</Typography>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.basic.formTitleDescription')}
                </Typography>
                <Input
                    label={t('settings.basic.formTitle')}
                    value={formData.title}
                    placeholder={t('settings.basic.formTitlePlaceholder')}
                    onChange={e => handleInputChange('title', e.target.value)}
                />
            </div>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.basic.introDescription')}
                </Typography>
                <LexicalEditor
                    value={formData.intro}
                    placeholder={t('settings.basic.introPlaceholder')}
                    height={120}
                    onChange={value => handleInputChange('intro', value)}
                />
            </div>
        </div>
    );

    const renderResponseSettings = () => (
        <div className="fs-settings__section">
            <Typography variant="heading" level={3}>{t('settings.responses.title')}</Typography>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.responses.submissionMessageDescription')}
                </Typography>
                <LexicalEditor
                    value={formData.submissionMessage}
                    placeholder={t('settings.responses.submissionMessagePlaceholder')}
                    height={100}
                    onChange={value => handleInputChange('submissionMessage', value)}
                />
            </div>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.responses.errorMessageDescription')}
                </Typography>
                <LexicalEditor
                    value={formData.errorMessage}
                    placeholder={t('settings.responses.errorMessagePlaceholder')}
                    height={100}
                    onChange={value => handleInputChange('errorMessage', value)}
                />
            </div>
        </div>
    );

    const renderButtonSettings = () => (
        <div className="fs-settings__section">
            <Typography variant="heading" level={3}>{t('settings.buttons.title')}</Typography>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.buttons.submitBtnLabelDescription')}
                </Typography>
                <Input
                    label={t('settings.buttons.submitBtnLabel')}
                    value={formData.submitBtnLabel}
                    placeholder={t('settings.buttons.submitBtnLabelPlaceholder')}
                    onChange={e => handleInputChange('submitBtnLabel', e.target.value)}
                />
            </div>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.buttons.showResetBtnDescription')}
                </Typography>
                <div className="fs-settings__switch-field">
                    <Switch
                        checked={formData.showResetBtn}
                        onChange={e => handleInputChange('showResetBtn', e.target.checked)}
                    />
                    <Typography variant="body">{t('settings.buttons.showResetBtn')}</Typography>
                </div>
                {formData.showResetBtn && (
                    <Input
                        label={t('settings.buttons.resetBtnLabel')}
                        value={formData.resetBtnLabel}
                        placeholder={t('settings.buttons.resetBtnLabelPlaceholder')}
                        onChange={e => handleInputChange('resetBtnLabel', e.target.value)}
                    />
                )}
            </div>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.buttons.showNewFormBtnDescription')}
                </Typography>
                <div className="fs-settings__switch-field">
                    <Switch
                        checked={formData.showNewFormBtn}
                        onChange={e => handleInputChange('showNewFormBtn', e.target.checked)}
                    />
                    <Typography variant="body">{t('settings.buttons.showNewFormBtn')}</Typography>
                </div>
                {formData.showNewFormBtn && (
                    <Input
                        label={t('settings.buttons.newFormBtnLabel')}
                        value={formData.newFormBtnLabel}
                        placeholder={t('settings.buttons.newFormBtnLabelPlaceholder')}
                        onChange={e => handleInputChange('newFormBtnLabel', e.target.value)}
                    />
                )}
            </div>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.buttons.showTryAgainBtnDescription')}
                </Typography>
                <div className="fs-settings__switch-field">
                    <Switch
                        checked={formData.showTryAgainBtn}
                        onChange={e => handleInputChange('showTryAgainBtn', e.target.checked)}
                    />
                    <Typography variant="body">{t('settings.buttons.showTryAgainBtn')}</Typography>
                </div>
                {formData.showTryAgainBtn && (
                    <Input
                        label={t('settings.buttons.tryAgainBtnLabel')}
                        value={formData.tryAgainBtnLabel}
                        placeholder={t('settings.buttons.tryAgainBtnLabelPlaceholder')}
                        onChange={e => handleInputChange('tryAgainBtnLabel', e.target.value)}
                    />
                )}
            </div>
        </div>
    );

    const renderActionSettings = () => (
        <div className="fs-settings__section">
            <Typography variant="heading" level={3}>{t('settings.actions.title')}</Typography>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.actions.customTargetDescription')}
                </Typography>
                <Input
                    label={t('settings.actions.customTarget')}
                    value={formData.customTarget}
                    placeholder={t('settings.actions.customTargetPlaceholder')}
                    onChange={e => handleInputChange('customTarget', e.target.value)}
                />
            </div>
        </div>
    );

    const renderStyleSettings = () => (
        <div className="fs-settings__section">
            <Typography variant="heading" level={3}>{t('settings.style.title')}</Typography>
            <div className="fs-settings__field">
                <Typography variant="body" className="fs-settings__field-description">
                    {t('settings.style.cssDescription')}
                </Typography>
                <Textarea
                    label={t('settings.style.css')}
                    value={formData.css}
                    placeholder={t('settings.style.cssPlaceholder')}
                    rows={10}
                    onChange={e => handleInputChange('css', e.target.value)}
                />
            </div>
        </div>
    );

    return (
        <LayoutContent
            header={(
                <Header
                    title={headerTitle}
                    subtitle={t('settings.subtitle')}
                    backButton={backButton}
                    mainActions={[saveAction]}
                />
            )}
            content={
                <div className="fs-settings">
                    <Paper className="fs-settings__content">
                        <div className="fs-settings__tabs">
                            <Button
                                variant={activeTab === 'basic' ? 'primary' : 'ghost'}
                                size="big"
                                label={t('settings.tabs.basic')}
                                onClick={() => setActiveTab('basic')}
                            />
                            <Button
                                variant={activeTab === 'responses' ? 'primary' : 'ghost'}
                                size="big"
                                label={t('settings.tabs.responses')}
                                onClick={() => setActiveTab('responses')}
                            />
                            <Button
                                variant={activeTab === 'buttons' ? 'primary' : 'ghost'}
                                size="big"
                                label={t('settings.tabs.buttons')}
                                onClick={() => setActiveTab('buttons')}
                            />
                            <Button
                                variant={activeTab === 'actions' ? 'primary' : 'ghost'}
                                size="big"
                                label={t('settings.tabs.actions')}
                                onClick={() => setActiveTab('actions')}
                            />
                            <Button
                                variant={activeTab === 'style' ? 'primary' : 'ghost'}
                                size="big"
                                label={t('settings.tabs.style')}
                                onClick={() => setActiveTab('style')}
                            />
                        </div>

                        <div className="fs-settings__tab-content">
                            {activeTab === 'basic' && renderBasicSettings()}
                            {activeTab === 'responses' && renderResponseSettings()}
                            {activeTab === 'buttons' && renderButtonSettings()}
                            {activeTab === 'actions' && renderActionSettings()}
                            {activeTab === 'style' && renderStyleSettings()}
                        </div>
                    </Paper>
                </div>
            }
        />
    );
};

FormSettings.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            formId: PropTypes.string
        }).isRequired,
        path: PropTypes.string,
        url: PropTypes.string
    }).isRequired
};
