import React, {createContext, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import {getApolloClient} from '../apollo/client';
import {DEFAULT_WORKSPACE, FORM_NAMESPACE, getDefaultFormsPath} from '../constants/formBuilder';

const FormBuilderContext = createContext(null);

export const FormBuilderProvider = ({children}) => {
    const {contextJsParameters = {}, formidableBuilder: runtimeConfig = {}} = window;
    const {
        lang = 'en',
        siteKey = 'default',
        language = contextJsParameters.lang,
        workspace = DEFAULT_WORKSPACE
    } = contextJsParameters;

    const uiLanguage = runtimeConfig.uiLanguage || lang || language || 'en';
    const resolvedSiteKey = runtimeConfig.siteKey || siteKey;
    const formsRoot = runtimeConfig.formsPath || getDefaultFormsPath(resolvedSiteKey);
    const rawWorkspace = runtimeConfig.workspace || workspace || DEFAULT_WORKSPACE;
    const normalizedWorkspace = (() => {
        const value = (rawWorkspace || DEFAULT_WORKSPACE).toUpperCase();
        if (value === 'LIVE' || value === 'EDIT') {
            return value;
        }

        return DEFAULT_WORKSPACE;
    })();

    const value = useMemo(() => ({
        client: getApolloClient(),
        namespace: FORM_NAMESPACE,
        language: uiLanguage,
        siteKey: resolvedSiteKey,
        workspace: normalizedWorkspace,
        formsPath: formsRoot
    }), [uiLanguage, resolvedSiteKey, formsRoot, normalizedWorkspace]);

    return (
        <FormBuilderContext.Provider value={value}>
            {children}
        </FormBuilderContext.Provider>
    );
};

FormBuilderProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useFormBuilderContext = () => {
    const ctx = useContext(FormBuilderContext);
    if (!ctx) {
        throw new Error('useFormBuilderContext must be used inside FormBuilderProvider');
    }

    return ctx;
};
