import React from 'react';
import PropTypes from 'prop-types';

export const FormBuilderIcon = ({width, height}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#2681ff" strokeWidth="1.8"/>
        <rect x="6" y="7" width="12" height="2" fill="#2681ff"/>
        <rect x="6" y="11" width="8" height="2" fill="#2681ff" opacity="0.6"/>
        <rect x="6" y="15" width="10" height="2" fill="#2681ff" opacity="0.4"/>
        <circle cx="17" cy="12" r="2" stroke="#2681ff" strokeWidth="1.5"/>
    </svg>
);

FormBuilderIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
};

FormBuilderIcon.defaultProps = {
    width: 24,
    height: 24
};
