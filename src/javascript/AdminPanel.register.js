import {registerRoutes} from './AdminPanel/AdminPanel.routes';
import i18next from 'i18next';
import {FORM_NAMESPACE} from './constants/formBuilder';
import en from '../main/resources/javascript/locales/en.json';
import fr from '../main/resources/javascript/locales/fr.json';

const registerResources = () => {
    const bundles = [
        ['en', en],
        ['fr', fr]
    ];

    bundles.forEach(([language, resource]) => {
        const namespaceData = resource[FORM_NAMESPACE];
        if (namespaceData && !i18next.hasResourceBundle(language, FORM_NAMESPACE)) {
            i18next.addResourceBundle(language, FORM_NAMESPACE, namespaceData, true, true);
        }
    });
};

export default function () {
    registerResources();
    registerRoutes();
}
