import { useState } from 'react';
import styles from './FinishWorkoutModal.module.css';

const MUSCLE_GROUPS = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'legs',
    'abs',
    'forearms',
    'traps'
];

export default function FinishWorkoutModal({
    onClose,
    onFinish
}) {
    const [
        selectedMuscleGroups,
        setSelectedMuscleGroups
    ] = useState([]);

    const [intensity, setIntensity] =
        useState(null);

    const [
        hoveredIntensity,
        setHoveredIntensity
    ] = useState(null);

    const [error, setError] =
        useState('');


    function handleToggleMuscleGroup(
        muscleGroup
    ) {
        setSelectedMuscleGroups(
            currentGroups => {
                const isSelected =
                    currentGroups.includes(
                        muscleGroup
                    );

                if (isSelected) {
                    return currentGroups.filter(
                        group =>
                            group !== muscleGroup
                    );
                }

                return [
                    ...currentGroups,
                    muscleGroup
                ];
            }
        );

        setError('');
    }


    function handleSelectIntensity(
        value
    ) {
        setIntensity(value);
        setError('');
    }


    function handleFinishWorkout() {
        if (
            selectedMuscleGroups.length === 0
        ) {
            setError(
                'Select at least one muscle group'
            );

            return;
        }

        if (intensity === null) {
            setError(
                'Select an intensity'
            );

            return;
        }

        onFinish({
            muscleGroups:
                selectedMuscleGroups,

            intensity
        });
    }


    const displayedIntensity =
        hoveredIntensity ?? intensity;


    return (
        <div
            className={styles.modalOverlay}
        >
            <section
                className={styles.modalCard}
                role="dialog"
                aria-modal="true"
                aria-labelledby="finish-workout-title"
            >
                <header
                    className={styles.modalHeader}
                >
                    <div
                        className={
                            styles.headerText
                        }
                    >
                        <h2
                            id="finish-workout-title"
                            className={
                                styles.modalTitle
                            }
                        >
                            Finish workout
                        </h2>

                        <p
                            className={
                                styles.modalDescription
                            }
                        >
                            Add the final details
                            before ending your workout.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.closeButton
                        }
                        aria-label="Close finish workout dialog"
                        title="Close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>


                <div
                    className={
                        styles.modalSection
                    }
                >
                    <h3
                        className={
                            styles.sectionTitle
                        }
                    >
                        Muscle groups
                    </h3>

                    <p
                        className={
                            styles.sectionPrompt
                        }
                    >
                        Which muscle groups did you
                        train?
                    </p>

                    <div
                        className={
                            styles.muscleGroupList
                        }
                    >
                        {MUSCLE_GROUPS.map(
                            muscleGroup => {
                                const isSelected =
                                    selectedMuscleGroups
                                        .includes(
                                            muscleGroup
                                        );

                                return (
                                    <button
                                        key={
                                            muscleGroup
                                        }
                                        type="button"
                                        className={`${styles.muscleGroupChip} ${
                                            isSelected
                                                ? styles.muscleGroupChipSelected
                                                : ''
                                        }`}
                                        aria-pressed={
                                            isSelected
                                        }
                                        onClick={() =>
                                            handleToggleMuscleGroup(
                                                muscleGroup
                                            )
                                        }
                                    >
                                        {
                                            muscleGroup
                                                .charAt(0)
                                                .toUpperCase() +
                                            muscleGroup.slice(
                                                1
                                            )
                                        }
                                    </button>
                                );
                            }
                        )}
                    </div>
                </div>


                <div
                    className={
                        styles.modalSection
                    }
                >
                    <h3
                        className={
                            styles.sectionTitle
                        }
                    >
                        Intensity
                    </h3>

                    <p
                        className={
                            styles.sectionPrompt
                        }
                    >
                        How intense was this workout?
                    </p>

                    <div
                        className={
                            styles.intensityControl
                        }
                    >
                        <div
                            className={
                                styles.intensityFires
                            }
                        >
                            {[1, 2, 3, 4, 5].map(
                                value => {
                                    const isActive =
                                        displayedIntensity !==
                                            null &&
                                        value <=
                                            displayedIntensity;

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            className={
                                                styles.intensityFireButton
                                            }
                                            aria-label={`Intensity ${value} out of 5`}
                                            aria-pressed={
                                                intensity ===
                                                value
                                            }
                                            onMouseEnter={() =>
                                                setHoveredIntensity(
                                                    value
                                                )
                                            }
                                            onMouseLeave={() =>
                                                setHoveredIntensity(
                                                    null
                                                )
                                            }
                                            onFocus={() =>
                                                setHoveredIntensity(
                                                    value
                                                )
                                            }
                                            onBlur={() =>
                                                setHoveredIntensity(
                                                    null
                                                )
                                            }
                                            onClick={() =>
                                                handleSelectIntensity(
                                                    value
                                                )
                                            }
                                        >
                                            <span
                                                className={
                                                    isActive
                                                        ? styles.fireActive
                                                        : styles.fireInactive
                                                }
                                            >
                                                🔥
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        <div
                            className={
                                styles.intensityScale
                            }
                        >
                            <span>
                                Min
                            </span>

                            <span>
                                Max
                            </span>
                        </div>
                    </div>
                </div>


                {error && (
                    <p
                        className={
                            styles.formError
                        }
                    >
                        {error}
                    </p>
                )}


                <div
                    className={
                        styles.modalActions
                    }
                >
                    <button
                        type="button"
                        className={
                            styles.cancelButton
                        }
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={
                            styles.finishButton
                        }
                        onClick={
                            handleFinishWorkout
                        }
                    >
                        Finish workout
                    </button>
                </div>
            </section>
        </div>
    );
}