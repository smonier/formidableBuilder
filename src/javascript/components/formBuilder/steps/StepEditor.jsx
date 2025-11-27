import React from 'react';
import PropTypes from 'prop-types';
import {Button, Input, Paper, Typography} from '@jahia/moonstone';
import {DndContext, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, arrayMove, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {useTranslation} from 'react-i18next';
import {FORM_NAMESPACE} from '../../../constants/formBuilder';
import {FieldPreview} from '../fields/FieldPreview';

const FieldRow = ({field, isActive, onSelect, onRemove}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: field.id});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`fb-field-row${isActive ? ' fb-field-row--active' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="fb-field-row__content">
                <button type="button" className="fb-field-row__button" onClick={() => onSelect(field.id)}>
                    <Typography variant="body" weight="bold">{field.label || field.name}</Typography>
                    <Typography variant="caption">{field.type}</Typography>
                </button>
                <FieldPreview field={field}/>
            </div>
            <Button label={t('builder.fields.remove')} onClick={() => onRemove(field.id)}/>
        </li>
    );
};

FieldRow.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        name: PropTypes.string.isRequired,
        type: PropTypes.string
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export const StepEditor = ({
    step,
    onUpdateStep,
    onRemoveField,
    onSelectField,
    onReorderFields,
    activeFieldId
}) => {
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));
    const {t} = useTranslation(FORM_NAMESPACE);

    if (!step) {
        return (
            <Paper className="fb-step-editor">
                <Typography variant="body">{t('builder.step.empty')}</Typography>
            </Paper>
        );
    }

    const handleDragEnd = event => {
        const {active, over} = event;
        if (!over || active.id === over.id) {
            return;
        }

        const previousIndex = step.fields.findIndex(field => field.id === active.id);
        const nextIndex = step.fields.findIndex(field => field.id === over.id);
        if (previousIndex === -1 || nextIndex === -1) {
            return;
        }

        onReorderFields(step.id, arrayMove(step.fields, previousIndex, nextIndex));
    };

    return (
        <Paper className="fb-step-editor">
            <div className="fb-step-editor__header">
                <Typography variant="heading">{step.label}</Typography>
            </div>
            <div className="fb-step-editor__form">
                <label className="fb-field">
                    <Typography variant="subheading">{t('builder.step.label')}</Typography>
                    <Input value={step.label} onChange={event => onUpdateStep(step.id, {label: event.target.value})}/>
                </label>
                <label className="fb-field">
                    <Typography variant="subheading">{t('builder.step.description')}</Typography>
                    <textarea
                        rows={3}
                        className="fb-textarea"
                        value={step.description}
                        onChange={event => onUpdateStep(step.id, {description: event.target.value})}
                    />
                </label>
            </div>

            <div className="fb-step-editor__list">
                <Typography variant="subheading">{t('builder.fields.title')}</Typography>
                {step.fields.length === 0 && (
                    <Typography variant="body">{t('builder.fields.empty')}</Typography>
                )}

                {step.fields.length > 0 && (
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <SortableContext items={step.fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
                            <ul className="fb-field-list">
                                {step.fields.map(field => (
                                    <FieldRow
                                        key={field.id}
                                        field={field}
                                        isActive={field.id === activeFieldId}
                                        onSelect={onSelectField}
                                        onRemove={fieldId => onRemoveField(step.id, fieldId)}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </Paper>
    );
};

StepEditor.propTypes = {
    step: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        description: PropTypes.string,
        fields: PropTypes.array
    }),
    onUpdateStep: PropTypes.func.isRequired,
    onRemoveField: PropTypes.func.isRequired,
    onSelectField: PropTypes.func.isRequired,
    onReorderFields: PropTypes.func.isRequired,
    activeFieldId: PropTypes.string
};

StepEditor.defaultProps = {
    step: null,
    activeFieldId: null
};
