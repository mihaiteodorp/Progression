import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

import styles from '../pages/LiveWorkoutPage.module.css';
import otherStyles from './SortableSetRow.module.css';

import dragIcon from '../assets/live-workout-icons/drag.png';
import saveIcon from '../assets/live-workout-icons/save.png';
import editIcon from '../assets/live-workout-icons/edit.png';
import removeIcon from '../assets/live-workout-icons/remove.png';


export default function SortableSetRow({
    set,
    setIndex,
    exercise,
    editingSet,
    liveWorkout,
    handleSetChange,
    handleEditingSetChange,
    handleCompleteSet,
    handleSaveSet,
    handleEditSet,
    handleDeleteSet
}) {

    const [validationError, setValidationError] =
        useState('');

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: set.id
    });

    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),
        transition
    };


    const isCompleted =
        Boolean(
            set.completedAt
        );

    const isEditing =
        editingSet?.exerciseId ===
            exercise.id &&
        editingSet?.setId ===
            set.id;

    const isAnySetEditing =
        Boolean(
            editingSet
        );

    const isOtherSetEditing =
        isAnySetEditing &&
        !isEditing;


    function validateSet(repsValue, weightValue) {

        const reps =
            Number(
                repsValue
            );

        if (repsValue === '') {

            setValidationError(
                'Enter the number of reps'
            );

            return false;
        }

        if (
            !Number.isInteger(reps) ||
            reps <= 0
        ) {

            setValidationError(
                'Reps must be a positive whole number'
            );

            return false;
        }

        if (weightValue !== '') {

            const weight =
                Number(
                    weightValue
                );

            if (
                !Number.isFinite(weight) ||
                weight < 0
            ) {

                setValidationError(
                    'Weight cannot be negative'
                );

                return false;
            }
        }

        setValidationError('');

        return true;
    }


    return (

        <div
            id={`set-${set.id}`}
            ref={setNodeRef}
            style={style}
        >

            <div
                className={`${styles.setRow} ${
                    isDragging
                        ? styles.draggingSet
                        : ''
                } ${
                    validationError 
                    ? otherStyles.setRowWithError
                    : ''
                }`}
            >

                {isCompleted &&
                    !isAnySetEditing ? (

                    <button
                        type="button"
                        className={
                            styles.dragHandle
                        }
                        aria-label="Reorder set"
                        title="Drag to reorder"
                        {...attributes}
                        {...listeners}
                    >
                        <img
                            src={dragIcon}
                            alt=""
                        />
                    </button>

                ) : (

                    <span />

                )}


                <span
                    className={
                        styles.setNumber
                    }
                >
                    {setIndex + 1}
                </span>


                {isCompleted &&
                    !isEditing ? (

                    <span
                        className={
                            styles.completedValue
                        }
                    >
                        {set.reps}
                    </span>

                ) : (

                    <input
                        type="number"
                        min="1"
                        step="1"
                        className={
                            styles.setInput
                        }
                        value={
                            isEditing
                                ? editingSet.reps
                                : set.reps
                        }
                        disabled={
                            Boolean(
                                liveWorkout.pausedAt
                            ) ||
                            Boolean(
                                liveWorkout.endedAt
                            )
                        }
                        onChange={event => {

                            setValidationError('');

                            if (isEditing) {

                                handleEditingSetChange(
                                    'reps',
                                    event.target.value
                                );

                                return;
                            }

                            handleSetChange(
                                exercise.id,
                                set.id,
                                'reps',
                                event.target.value
                            );
                        }}
                        placeholder="0"
                    />

                )}


                {isCompleted &&
                    !isEditing ? (

                    <span
                        className={
                            styles.completedWeight
                        }
                    >
                        {set.weightKg || 0}

                        <span
                            className={
                                styles.unit
                            }
                        >
                            kg
                        </span>

                    </span>

                ) : (

                    <div
                        className={
                            styles.weightInputWrap
                        }
                    >

                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            className={
                                styles.setInput
                            }
                            value={
                                isEditing
                                    ? editingSet.weightKg
                                    : set.weightKg
                            }
                            disabled={
                                Boolean(
                                    liveWorkout.pausedAt
                                ) ||
                                Boolean(
                                    liveWorkout.endedAt
                                )
                            }
                            onChange={event => {

                                setValidationError('');

                                if (isEditing) {

                                    handleEditingSetChange(
                                        'weightKg',
                                        event.target.value
                                    );

                                    return;
                                }

                                handleSetChange(
                                    exercise.id,
                                    set.id,
                                    'weightKg',
                                    event.target.value
                                );
                            }}
                            placeholder="0"
                        />

                        <span
                            className={
                                styles.unit
                            }
                        >
                            kg
                        </span>

                    </div>

                )}


                <div
                    className={
                        styles.setAction
                    }
                >

                    {isCompleted &&
                        !isEditing ? (

                        <span
                            className={
                                styles.completed
                            }
                        >
                            Done
                        </span>

                    ) : !isCompleted ? (

                        <button
                            type="button"
                            className={
                                styles.completeButton
                            }
                            disabled={
                                Boolean(
                                    liveWorkout.pausedAt
                                ) ||
                                Boolean(
                                    liveWorkout.endedAt
                                )
                            }
                            onClick={() => {

                                if (
                                    !validateSet(set.reps, set.weightKg)
                                ) {
                                    return;
                                }

                                handleCompleteSet(
                                    exercise.id,
                                    set.id
                                );
                            }}
                        >
                            Complete
                        </button>

                    ) : (

                        <span />

                    )}

                </div>


                {isCompleted &&
                    !isOtherSetEditing ? (

                    <div
                        className={`${styles.rowActions} ${
                            isEditing
                                ? styles.rowActionsEditing
                                : ''
                        }`}
                    >

                        <button
                            type="button"
                            className={
                                styles.iconButton
                            }
                            aria-label={
                                isEditing
                                    ? 'Save set'
                                    : 'Edit set'
                            }
                            title={
                                isEditing
                                    ? 'Save set'
                                    : 'Edit set'
                            }
                            onClick={() => {

                                if (isEditing) {
                                    if(!validateSet(editingSet.reps,editingSet.weightKg)){
                                        return;
                                    }
                                    handleSaveSet();

                                    return;
                                }

                                handleEditSet(
                                    exercise.id,
                                    set
                                );
                            }}
                        >
                            <img
                                src={
                                    isEditing
                                        ? saveIcon
                                        : editIcon
                                }
                                alt=""
                            />
                        </button>


                        <button
                            type="button"
                            className={
                                styles.iconButton
                            }
                            aria-label="Delete set"
                            title="Delete set"
                            onClick={() =>
                                handleDeleteSet(
                                    exercise.id,
                                    set.id
                                )
                            }
                        >
                            <img
                                src={removeIcon}
                                alt=""
                            />
                        </button>

                    </div>

                ) : (

                    <span />

                )}

            </div>


            {validationError && (

                <p
                    className={
                        otherStyles
                            .setValidationError
                    }
                >
                    {validationError}
                </p>

            )}

        </div>
    );
}