import {registry} from '@jahia/ui-extender';
import constants from './AdminPanel.constants';
import {AdminPanel} from './AdminPanel';
import React, {Suspense} from 'react';
import {FormBuilderIcon} from '../components/icons/FormBuilderIcon';
import {FORM_NAMESPACE} from '../constants/formBuilder';

export const registerRoutes = () => {
    if (window.jahia && window.jahia.i18n && window.jahia.i18n.loadNamespaces) {
        window.jahia.i18n.loadNamespaces(FORM_NAMESPACE);
    }

    registry.add('accordionItem', 'formBuilderAccordion', registry.get('accordionItem', 'renderDefaultApps'), {
        targets: ['jcontent:75'],
        icon: <FormBuilderIcon width={24} height={24}/>,
        label: `${FORM_NAMESPACE}:accordionTitle`,
        defaultPath: constants.ROUTE,
        appsTarget: 'formBuilderAccordionApps'
    });

    registry.add('adminRoute', 'formidableBuilder', {
        targets: ['formBuilderAccordionApps'],
        icon: <FormBuilderIcon/>,
        label: `${FORM_NAMESPACE}:label`,
        path: `${constants.ROUTE}*`,
        defaultPath: constants.ROUTE,
        isSelectable: true,
        requireModuleInstalledOnSite: 'formidable',
        render: v => <Suspense fallback="loading ..."><AdminPanel match={v.match}/></Suspense>
    });

    console.debug('%c form-builder module is activated', 'color: #3c8cba');
};
