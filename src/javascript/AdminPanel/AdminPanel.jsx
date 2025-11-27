import React from 'react';
import PropTypes from 'prop-types';
import {FormBuilderApp} from '../components/FormBuilderApp';

export const AdminPanel = ({match}) => <FormBuilderApp match={match}/>;

AdminPanel.propTypes = {
    match: PropTypes.object
};

AdminPanel.defaultProps = {
    match: null
};
