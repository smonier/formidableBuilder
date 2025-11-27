import React from 'react';
import PropTypes from 'prop-types';
import {Button, Typography, Paper} from '@jahia/moonstone';
import {DndContext, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy, useSortable, arrayMove} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {useTranslation} from 'react-i18next';
import {FORM_NAMESPACE} from '../../../constants/formBuilder';

const StepItem = ({step, isActive, onSelect, onRemove}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: step.id});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <li ref={setNodeRef} style={style} className={`fb-step${isActive ? ' fb-step--active' : ''}`} {...attributes} {...listeners}>
            <button type="button" className="fb-step__button" onClick={() => onSelect(step.id)}>
                <Typography variant="body" weight="bold">{step.label}</Typography>
                <Typography variant="caption">{step.fields.length} fields</Typography>
            </button>
            <Button label={t('builder.sidebar.removeStep')} className="fb-step__delete" onClick={() => onRemove(step.id)}/>
        </li>
    );
};

StepItem.propTypes = {
    step: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        fields: PropTypes.array
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export const Sidebar = ({steps, activeStepId, onSelectStep, onAddStep, onRemoveStep, onReorderSteps}) => {
    const {t} = useTranslation(FORM_NAMESPACE);
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));

    const handleDragEnd = event => {
        const {active, over} = event;
        if (!over || active.id === over.id) {
            return;
        }

        const previousIndex = steps.findIndex(step => step.id === active.id);
        const nextIndex = steps.findIndex(step => step.id === over.id);
        if (previousIndex === -1 || nextIndex === -1) {
            return;
        }

        const reordered = arrayMove(steps, previousIndex, nextIndex);
        onReorderSteps(reordered);
    };

    return (
        <Paper className="fb-sidebar">
            <div className="fb-sidebar__header">
                <Typography variant="subheading">{t('builder.sidebar.title')}</Typography>
                <Button color="accent" label={t('builder.sidebar.addStep')} onClick={onAddStep}/>
            </div>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map(step => step.id)} strategy={verticalListSortingStrategy}>
                    <ul className="fb-step-list">
                        {steps.map(step => (
                            <StepItem
                                key={step.id}
                                step={step}
                                isActive={step.id === activeStepId}
                                onSelect={onSelectStep}
                                onRemove={onRemoveStep}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </Paper>
    );
};

Sidebar.propTypes = {
    steps: PropTypes.array.isRequired,
    activeStepId: PropTypes.string,
    onSelectStep: PropTypes.func.isRequired,
    onAddStep: PropTypes.func.isRequired,
    onRemoveStep: PropTypes.func.isRequired,
    onReorderSteps: PropTypes.func.isRequired
};

Sidebar.defaultProps = {
    activeStepId: null
};
