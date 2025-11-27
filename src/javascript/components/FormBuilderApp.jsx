import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect, withRouter} from 'react-router';
import {ApolloProvider} from '@apollo/client';
import {getApolloClient} from '../apollo/client';
import {FormBuilderProvider} from '../contexts/FormBuilderContext';
import {FormListView} from './formList/FormListView';
import {FormBuilder} from './formBuilder/FormBuilder';

const client = getApolloClient();

const FormBuilderAppRaw = ({match}) => {
    const basePath = (match?.path || '/form-builder').replace(/\*$/, '');

    return (
        <ApolloProvider client={client}>
            <FormBuilderProvider>
                <Switch>
                    <Route exact path={basePath} component={FormListView}/>
                    <Route path={`${basePath}/:formId`} component={FormBuilder}/>
                    <Redirect to={basePath}/>
                </Switch>
            </FormBuilderProvider>
        </ApolloProvider>
    );
};

FormBuilderAppRaw.propTypes = {
    match: PropTypes.shape({
        path: PropTypes.string
    })
};

FormBuilderAppRaw.defaultProps = {
    match: {
        path: '/form-builder'
    }
};

export const FormBuilderApp = withRouter(FormBuilderAppRaw);
