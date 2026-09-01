import { useEffect, useState } from 'react';
import styles from './LiveWorkoutPage.module.css';

export default function LiveWorkoutPage() {
    const [liveWorkout, setLiveWorkout] = useState({
        startedAt: null,
        endedAt: null,
        pausedAt: null,
        totalPausedMilliseconds: 0,
        exercises: []
    });

    const [newExerciseName, setNewExerciseName] = useState('');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);


    useEffect(() => {
        if (!liveWorkout.startedAt || liveWorkout.endedAt) {
            return;
        }

        function updateElapsedTime() {
            const startTime = new Date(
                liveWorkout.startedAt
            ).getTime();

            const currentTime = liveWorkout.pausedAt
                ? new Date(liveWorkout.pausedAt).getTime()
                : Date.now();

            const elapsedMilliseconds =
                currentTime -
                startTime -
                liveWorkout.totalPausedMilliseconds;

            const differenceInSeconds = Math.floor(
                elapsedMilliseconds / 1000
            );

            setElapsedSeconds(differenceInSeconds);
        }

        updateElapsedTime();

        if (liveWorkout.pausedAt) {
            return;
        }

        const intervalId = setInterval(
            updateElapsedTime,
            1000
        );

        return () => {
            clearInterval(intervalId);
        };
    }, [
        liveWorkout.startedAt,
        liveWorkout.endedAt,
        liveWorkout.pausedAt,
        liveWorkout.totalPausedMilliseconds
    ]);


    function handleStartWorkout() {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            startedAt: new Date().toISOString()
        }));
    }


    function handleAddExercise(event) {
        event.preventDefault();

        const trimmedName = newExerciseName.trim();

        if (!trimmedName) {
            return;
        }

        const newExercise = {
            id: crypto.randomUUID(),
            name: trimmedName,
            sets: []
        };

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            exercises: [
                ...currentWorkout.exercises,
                newExercise
            ]
        }));

        setNewExerciseName('');
    }


    function handleAddSet(exerciseId) {
        const newSet = {
            id: crypto.randomUUID(),
            reps: '',
            weightKg: '',
            completedAt: null
        };

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(
                (exercise) => {
                    if (exercise.id !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: [
                            ...exercise.sets,
                            newSet
                        ]
                    };
                }
            )
        }));
    }


    function handleSetChange(
        exerciseId,
        setId,
        field,
        value
    ) {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(
                (exercise) => {
                    if (exercise.id !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: exercise.sets.map(
                            (set) => {
                                if (set.id !== setId) {
                                    return set;
                                }

                                return {
                                    ...set,
                                    [field]: value
                                };
                            }
                        )
                    };
                }
            )
        }));
    }


    function handleCompleteSet(exerciseId, setId) {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(
                (exercise) => {
                    if (exercise.id !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: exercise.sets.map(
                            (set) => {
                                if (set.id !== setId) {
                                    return set;
                                }

                                return {
                                    ...set,
                                    completedAt:
                                        new Date().toISOString()
                                };
                            }
                        )
                    };
                }
            )
        }));
    }


    function handlePauseWorkout() {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            pausedAt: new Date().toISOString()
        }));
    }


    function handleResumeWorkout() {
        setLiveWorkout((currentWorkout) => {
            const pauseStarted = new Date(
                currentWorkout.pausedAt
            ).getTime();

            const pausedUntilNow =
                Date.now() - pauseStarted;

            return {
                ...currentWorkout,
                pausedAt: null,
                totalPausedMilliseconds:
                    currentWorkout.totalPausedMilliseconds +
                    pausedUntilNow
            };
        });
    }


    function handleEndWorkout() {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,
            endedAt: new Date().toISOString()
        }));
    }


    function formatElapsedTime(totalSeconds) {
        const hours = Math.floor(
            totalSeconds / 3600
        );

        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );

        const seconds = Math.floor(
            totalSeconds % 60
        );

        return [
            hours,
            minutes,
            seconds
        ]
            .map((value) =>
                String(value).padStart(2, '0')
            )
            .join(':');
    }


    return (
        <main className={styles.liveWorkoutPage}>
            <h1 className={styles.pageTitle}>
                Live workout
            </h1>

            {!liveWorkout.startedAt ? (
                <section className={styles.startState}>
                    <div className={styles.startIcon}>
                        ▶
                    </div>

                    <h2 className={styles.startTitle}>
                        Ready to train?
                    </h2>

                    <p className={styles.startDescription}>
                        Track your exercises, sets, reps,
                        weight and workout time as you train.
                    </p>

                    <button
                        type="button"
                        className={styles.startButton}
                        onClick={handleStartWorkout}
                    >
                        Start workout
                    </button>
                </section>
            ) : (
                <>
                    <div className={styles.workoutHeader}>
                        <p
                            className={
                                liveWorkout.endedAt
                                    ? styles.finishedStatus
                                    : liveWorkout.pausedAt
                                        ? styles.pausedStatus
                                        : styles.status
                            }
                        >
                            {liveWorkout.endedAt
                                ? 'Workout finished'
                                : liveWorkout.pausedAt
                                    ? 'Workout paused'
                                    : 'Workout in progress'}
                        </p>

                        <p className={styles.timer}>
                            {formatElapsedTime(
                                elapsedSeconds
                            )}
                        </p>
                    </div>

                    {!liveWorkout.endedAt && (
                        <form
                            className={styles.exerciseForm}
                            onSubmit={handleAddExercise}
                        >
                            <div
                                className={
                                    styles.exerciseNameField
                                }
                            >
                                <label
                                    htmlFor="exercise-name"
                                    className={
                                        styles.fieldLabel
                                    }
                                >
                                    Exercise name
                                </label>

                                <input
                                    type="text"
                                    id="exercise-name"
                                    className={styles.textInput}
                                    value={newExerciseName}
                                    onChange={(event) =>
                                        setNewExerciseName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Bench Press"
                                />
                            </div>

                            <button
                                type="submit"
                                className={
                                    styles.primaryButton
                                }
                            >
                                Add exercise
                            </button>
                        </form>
                    )}

                    <section
                        className={styles.exerciseSection}
                    >
                        <h2
                            className={styles.sectionTitle}
                        >
                            Exercises
                        </h2>

                        {liveWorkout.exercises.length === 0 ? (
                            <p
                                className={
                                    styles.emptyMessage
                                }
                            >
                                No exercises added yet.
                            </p>
                        ) : (
                            <div
                                className={
                                    styles.exerciseList
                                }
                            >
                                {liveWorkout.exercises.map(
                                    (exercise) => (
                                        <article
                                            key={exercise.id}
                                            className={
                                                styles.exerciseCard
                                            }
                                        >
                                            <h3
                                                className={
                                                    styles.exerciseTitle
                                                }
                                            >
                                                {exercise.name}
                                            </h3>

                                            {exercise.sets.length === 0 ? (
                                                <p
                                                    className={
                                                        styles.emptyMessage
                                                    }
                                                >
                                                    No sets added yet.
                                                </p>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.setList
                                                    }
                                                >
                                                    {exercise.sets.map(
                                                        (
                                                            set,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    set.id
                                                                }
                                                                className={
                                                                    styles.setRow
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        styles.setNumber
                                                                    }
                                                                >
                                                                    Set{' '}
                                                                    {index +
                                                                        1}
                                                                </span>

                                                                <label
                                                                    className={
                                                                        styles.setField
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.fieldLabel
                                                                        }
                                                                    >
                                                                        Reps
                                                                    </span>

                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        step="1"
                                                                        className={
                                                                            styles.numberInput
                                                                        }
                                                                        value={
                                                                            set.reps
                                                                        }
                                                                        disabled={Boolean(
                                                                            set.completedAt
                                                                        )}
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            handleSetChange(
                                                                                exercise.id,
                                                                                set.id,
                                                                                'reps',
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </label>

                                                                <label
                                                                    className={
                                                                        styles.setField
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.fieldLabel
                                                                        }
                                                                    >
                                                                        Weight
                                                                    </span>

                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.5"
                                                                        className={
                                                                            styles.numberInput
                                                                        }
                                                                        value={
                                                                            set.weightKg
                                                                        }
                                                                        disabled={Boolean(
                                                                            set.completedAt
                                                                        )}
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            handleSetChange(
                                                                                exercise.id,
                                                                                set.id,
                                                                                'weightKg',
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </label>

                                                                {set.completedAt ? (
                                                                    <span
                                                                        className={
                                                                            styles.completedLabel
                                                                        }
                                                                    >
                                                                        ✓ Completed
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.secondaryButton
                                                                        }
                                                                        onClick={() =>
                                                                            handleCompleteSet(
                                                                                exercise.id,
                                                                                set.id
                                                                            )
                                                                        }
                                                                    >
                                                                        Complete set
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            {!liveWorkout.endedAt && (
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.secondaryButton
                                                    }
                                                    onClick={() =>
                                                        handleAddSet(
                                                            exercise.id
                                                        )
                                                    }
                                                >
                                                    Add set
                                                </button>
                                            )}
                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {!liveWorkout.endedAt && (
                        <div
                            className={
                                styles.workoutActions
                            }
                        >
                            {liveWorkout.pausedAt ? (
                                <button
                                    type="button"
                                    className={
                                        styles.resumeButton
                                    }
                                    onClick={
                                        handleResumeWorkout
                                    }
                                >
                                    Resume
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={
                                        styles.pauseButton
                                    }
                                    onClick={
                                        handlePauseWorkout
                                    }
                                >
                                    Pause
                                </button>
                            )}

                            <button
                                type="button"
                                className={
                                    styles.endWorkoutButton
                                }
                                onClick={handleEndWorkout}
                            >
                                End workout
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}