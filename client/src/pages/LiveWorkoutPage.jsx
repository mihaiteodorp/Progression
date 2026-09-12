import { useEffect, useRef, useState } from 'react';
import styles from './LiveWorkoutPage.module.css';

import chevronIcon from '../assets/live-workout-icons/chevron.png';
import moreIcon from '../assets/live-workout-icons/more.png';
import saveIcon from '../assets/live-workout-icons/save.png';

import FinishWorkoutModal from '../components/FinishWorkoutModal.jsx';
import DiscardWorkoutModal from '../components/DiscardWorkoutModal.jsx';

import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {
    SortableContext,
    useSortable,
    sortableKeyboardCoordinates,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableSetRow from '../components/SortableSetRow.jsx';

import { createPortal } from 'react-dom';

// Keep the dragged exercise inside the scroll viewport and on the vertical axis.
function constrainExerciseDrag({
    transform,
    activeNodeRect,
    scrollableAncestorRects,
}) {
    const viewport = scrollableAncestorRects?.[0];
    if (
        !activeNodeRect ||
        !viewport ||
        activeNodeRect.height > viewport.height
    ) {
        return { ...transform, x: 0 };
    }
    return {
        ...transform,
        x: 0,
        y: Math.min(
            viewport.bottom - activeNodeRect.bottom,
            Math.max(viewport.top - activeNodeRect.top, transform.y),
        ),
    };
}

// Each exercise owns a sortable node; its sets keep their separate DndContext.
function SortableExercise({ exercise, disabled, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.id, disabled });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
    };

    return (
        <section
            ref={setNodeRef}
            style={style}
            className={`${styles.exercise} ${isDragging ? styles.draggingExercise : ''}`}
        >
            {children({
                attributes,
                listeners,
                setActivatorNodeRef,
                isDragging,
            })}
        </section>
    );
}

function createInitialWorkout() {
    return {
        startedAt: null,
        endedAt: null,
        pausedAt: null,
        totalPausedMilliseconds: 0,
        exercises: [],
        muscleGroups: [],
        intensity: null,
    };
}

export default function LiveWorkoutPage() {
    const [liveWorkout, setLiveWorkout] = useState(createInitialWorkout);

    const [isDraggingExercise, setIsDraggingExercise] = useState(false);

    const [newExerciseName, setNewExerciseName] = useState('');

    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);

    const [expandedExerciseId, setExpandedExerciseId] = useState(null);

    const [editingSet, setEditingSet] = useState(null);

    const [exerciseNameError, setExerciseNameError] = useState('');

    const [openExerciseMenu, setOpenExerciseMenu] = useState(null);

    const [exerciseMenuPosition, setExerciseMenuPosition] = useState(null);

    const [exerciseRename, setExerciseRename] = useState(null);

    const [exerciseRenameError, setExerciseRenameError] = useState('');

    const [finishWorkoutError, setFinishWorkoutError] = useState('');

    const [isFinishWorkoutModalOpen, setIsFinishWorkoutModalOpen] =
        useState(false);

    const [isDiscardWorkoutModalOpen, setIsDiscardWorkoutModalOpen] =
        useState(false);

    const [pendingEndedAt, setPendingEndedAt] = useState(null);

    const addSetButtonRefs = useRef({});

    const pendingScrollRef = useRef(null);

    const exerciseMenuRef = useRef(null);

    const exerciseOptionsButtonRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const exerciseSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const isExerciseDragDisabled = Boolean(
        !liveWorkout.startedAt ||
        liveWorkout.pausedAt ||
        liveWorkout.endedAt ||
        pendingEndedAt ||
        editingSet ||
        exerciseRename ||
        isFinishWorkoutModalOpen ||
        isDiscardWorkoutModalOpen,
    );

    function handleExerciseDragStart() {
        setIsDraggingExercise(true);
        setOpenExerciseMenu(null);
        setExerciseMenuPosition(null);
    }

    function handleExerciseDragEnd({ active, over }) {
        setIsDraggingExercise(false);
        if (isExerciseDragDisabled || !over || active.id === over.id) return;

        setLiveWorkout((currentWorkout) => {
            const oldIndex = currentWorkout.exercises.findIndex(
                (exercise) => exercise.id === active.id,
            );
            const newIndex = currentWorkout.exercises.findIndex(
                (exercise) => exercise.id === over.id,
            );
            if (oldIndex === -1 || newIndex === -1) return currentWorkout;
            return {
                ...currentWorkout,
                exercises: arrayMove(
                    currentWorkout.exercises,
                    oldIndex,
                    newIndex,
                ),
            };
        });
    }

    useEffect(() => {
        if (openExerciseMenu === null) {
            return;
        }

        function handleClickOutside(event) {
            const clickedInsideMenu = exerciseMenuRef.current?.contains(
                event.target,
            );

            const clickedOptionsButton =
                exerciseOptionsButtonRef.current?.contains(event.target);

            if (!clickedInsideMenu && !clickedOptionsButton) {
                setOpenExerciseMenu(null);

                setExerciseMenuPosition(null);
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpenExerciseMenu(null);

                setExerciseMenuPosition(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);

            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openExerciseMenu]);

    useEffect(() => {
        if (!liveWorkout.startedAt || liveWorkout.endedAt) {
            return;
        }

        function updateElapsedTime() {
            const startTime = new Date(liveWorkout.startedAt).getTime();

            const currentTime = liveWorkout.pausedAt
                ? new Date(liveWorkout.pausedAt).getTime()
                : pendingEndedAt
                  ? new Date(pendingEndedAt).getTime()
                  : Date.now();

            const elapsedMilliseconds =
                currentTime - startTime - liveWorkout.totalPausedMilliseconds;

            setElapsedSeconds(Math.floor(elapsedMilliseconds / 1000));
        }

        updateElapsedTime();

        if (liveWorkout.pausedAt || pendingEndedAt) {
            return;
        }

        const intervalId = setInterval(updateElapsedTime, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [
        liveWorkout.startedAt,
        liveWorkout.endedAt,
        liveWorkout.pausedAt,
        liveWorkout.totalPausedMilliseconds,
        pendingEndedAt,
    ]);

    useEffect(() => {
        const pendingScroll = pendingScrollRef.current;

        if (!pendingScroll) {
            return;
        }

        if (pendingScroll.type === 'set') {
            const setElement = document.getElementById(
                `set-${pendingScroll.id}`,
            );

            if (!setElement) {
                return;
            }

            setElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });

            pendingScrollRef.current = null;

            return;
        }

        if (pendingScroll.type === 'addSet') {
            const addSetButton = addSetButtonRefs.current[pendingScroll.id];

            if (!addSetButton) {
                return;
            }

            addSetButton.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });

            pendingScrollRef.current = null;
        }
    }, [liveWorkout.exercises]);

    function handleStartWorkout() {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            startedAt: new Date().toISOString(),
        }));
    }

    function handleAddExercise(event) {
        event.preventDefault();

        const trimmedName = newExerciseName.trim();

        if (trimmedName.length === 0) {
            setExerciseNameError('Please insert an exercise name');

            return;
        }

        if (trimmedName.length < 2) {
            setExerciseNameError('The exercise name is too short');

            return;
        }

        if (trimmedName.length > 60) {
            setExerciseNameError('The exercise name is too long');

            return;
        }

        setExerciseNameError('');

        const newExercise = {
            id: crypto.randomUUID(),
            name: trimmedName,
            sets: [],
        };

        setExpandedExerciseId(newExercise.id);

        pendingScrollRef.current = {
            type: 'addSet',
            id: newExercise.id,
        };

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: [...currentWorkout.exercises, newExercise],
        }));

        setNewExerciseName('');

        setIsExerciseFormOpen(false);
    }

    function handleAddSet(exerciseId) {
        const newSet = {
            id: crypto.randomUUID(),
            reps: '',
            weightKg: '',
            completedAt: null,
        };

        pendingScrollRef.current = {
            type: 'set',
            id: newSet.id,
        };

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,

                    sets: [...exercise.sets, newSet],
                };
            }),
        }));
    }

    function handleSetChange(exerciseId, setId, field, value) {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,

                    sets: exercise.sets.map((set) => {
                        if (set.id !== setId) {
                            return set;
                        }

                        return {
                            ...set,

                            [field]: value,
                        };
                    }),
                };
            }),
        }));
    }

    function handleCompleteSet(exerciseId, setId) {
        pendingScrollRef.current = {
            type: 'addSet',
            id: exerciseId,
        };

        setFinishWorkoutError('');

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,

                    sets: exercise.sets.map((set) => {
                        if (set.id !== setId) {
                            return set;
                        }

                        return {
                            ...set,

                            completedAt: new Date().toISOString(),
                        };
                    }),
                };
            }),
        }));
    }

    function handleDeleteSet(exerciseId, setId) {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,

                    sets: exercise.sets.filter((set) => set.id !== setId),
                };
            }),
        }));

        if (
            editingSet?.exerciseId === exerciseId &&
            editingSet?.setId === setId
        ) {
            setEditingSet(null);
        }
    }

    function handleEditSet(exerciseId, set) {
        setEditingSet({
            exerciseId,
            setId: set.id,
            reps: set.reps,
            weightKg: set.weightKg,
        });
    }

    function handleEditingSetChange(field, value) {
        setEditingSet((currentSet) => ({
            ...currentSet,

            [field]: value,
        }));
    }

    function handleSaveSet() {
        if (!editingSet) {
            return;
        }

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== editingSet.exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,

                    sets: exercise.sets.map((set) => {
                        if (set.id !== editingSet.setId) {
                            return set;
                        }

                        return {
                            ...set,

                            reps: editingSet.reps,

                            weightKg: editingSet.weightKg,
                        };
                    }),
                };
            }),
        }));

        setEditingSet(null);
    }

    function handlePauseWorkout() {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            pausedAt: new Date().toISOString(),
        }));
    }

    function handleResumeWorkout() {
        setLiveWorkout((currentWorkout) => {
            const pauseStartedAt = new Date(currentWorkout.pausedAt).getTime();

            const currentPauseDuration = Date.now() - pauseStartedAt;

            return {
                ...currentWorkout,

                pausedAt: null,

                totalPausedMilliseconds:
                    currentWorkout.totalPausedMilliseconds +
                    currentPauseDuration,
            };
        });
    }

    function handleEndWorkout() {
        if (
            !liveWorkout.exercises.some((exercise) =>
                exercise.sets.some((set) => set.completedAt !== null),
            )
        ) {
            setFinishWorkoutError(
                'Complete at least one set to finish this workout.',
            );
            return;
        }
        setFinishWorkoutError('');

        setPendingEndedAt(new Date().toISOString());

        setIsFinishWorkoutModalOpen(true);
    }

    function handleCancelFinishWorkout() {
        setPendingEndedAt(null);

        setIsFinishWorkoutModalOpen(false);
    }

    function handleFinishWorkout({ muscleGroups, intensity }) {
        setLiveWorkout((currentWorkout) => {
            let totalPausedMilliseconds =
                currentWorkout.totalPausedMilliseconds;

            if (currentWorkout.pausedAt) {
                const pauseStartedAt = new Date(
                    currentWorkout.pausedAt,
                ).getTime();

                const workoutEndedAt = new Date(pendingEndedAt).getTime();

                totalPausedMilliseconds += workoutEndedAt - pauseStartedAt;
            }

            return {
                ...currentWorkout,

                endedAt: pendingEndedAt,

                pausedAt: null,

                totalPausedMilliseconds,

                muscleGroups,
                intensity,
            };
        });

        setPendingEndedAt(null);

        setIsFinishWorkoutModalOpen(false);
    }

    function handleOpenDiscardWorkout() {
        setIsDiscardWorkoutModalOpen(true);
    }

    function handleCloseDiscardWorkout() {
        setIsDiscardWorkoutModalOpen(false);
    }

    function handleDiscardWorkout() {
        setLiveWorkout(createInitialWorkout());

        setElapsedSeconds(0);

        setNewExerciseName('');

        setIsExerciseFormOpen(false);

        setExpandedExerciseId(null);

        setEditingSet(null);

        setExerciseNameError('');

        setOpenExerciseMenu(null);

        setExerciseMenuPosition(null);

        setExerciseRename(null);

        setExerciseRenameError('');

        setPendingEndedAt(null);

        setIsFinishWorkoutModalOpen(false);

        setIsDiscardWorkoutModalOpen(false);
        setFinishWorkoutError('');

        pendingScrollRef.current = null;

        addSetButtonRefs.current = {};
    }

    function handleToggleExercise(exerciseId) {
        if (editingSet) {
            return;
        }

        setExpandedExerciseId((currentExerciseId) =>
            currentExerciseId === exerciseId ? null : exerciseId,
        );
    }

    function handleDragEnd(event, exerciseId) {
        const { active, over } = event;

        if (!over) {
            return;
        }

        if (active.id === over.id) {
            return;
        }

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                const oldIndex = exercise.sets.findIndex(
                    (set) => set.id === active.id,
                );

                const newIndex = exercise.sets.findIndex(
                    (set) => set.id === over.id,
                );

                if (oldIndex === -1 || newIndex === -1) {
                    return exercise;
                }

                return {
                    ...exercise,

                    sets: arrayMove(exercise.sets, oldIndex, newIndex),
                };
            }),
        }));
    }

    function handleExerciseOptions(event, exerciseId) {
        exerciseOptionsButtonRef.current = event.currentTarget;

        if (openExerciseMenu === exerciseId) {
            setOpenExerciseMenu(null);

            setExerciseMenuPosition(null);

            return;
        }

        const buttonRect = event.currentTarget.getBoundingClientRect();

        setExerciseMenuPosition({
            top: buttonRect.bottom + 6,

            right: window.innerWidth - buttonRect.right,
        });

        setOpenExerciseMenu(exerciseId);
    }

    function handleDeleteExercise(exerciseId) {
        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.filter(
                (exercise) => exercise.id !== exerciseId,
            ),
        }));

        if (expandedExerciseId === exerciseId) {
            setExpandedExerciseId(null);
        }

        if (editingSet?.exerciseId === exerciseId) {
            setEditingSet(null);
        }

        if (exerciseRename?.exerciseId === exerciseId) {
            setExerciseRename(null);
        }
    }

    function handleStartExerciseRename(exerciseId) {
        const exerciseToRename = liveWorkout.exercises.find(
            (exercise) => exercise.id === exerciseId,
        );

        if (!exerciseToRename) {
            return;
        }

        setExerciseRename({
            exerciseId: exerciseToRename.id,

            draftName: exerciseToRename.name,
        });

        setExerciseRenameError('');
    }

    function handleExerciseRenameChange(value) {
        setExerciseRenameError('');

        setExerciseRename((currentRename) => ({
            ...currentRename,

            draftName: value,
        }));
    }

    function handleSaveExerciseRename() {
        if (!exerciseRename) {
            return;
        }

        const trimmedName = exerciseRename.draftName.trim();

        if (trimmedName.length < 2) {
            setExerciseRenameError('Exercise name is too short');

            return;
        }

        if (trimmedName.length > 60) {
            setExerciseRenameError('Exercise name is too long');

            return;
        }

        setLiveWorkout((currentWorkout) => ({
            ...currentWorkout,

            exercises: currentWorkout.exercises.map((exercise) => {
                if (exercise.id !== exerciseRename.exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,

                    name: trimmedName,
                };
            }),
        }));

        setExerciseRename(null);

        setExerciseRenameError('');
    }

    function handleCancelExerciseRename() {
        setExerciseRename(null);

        setExerciseRenameError('');
    }

    function handleExerciseRenameKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            handleSaveExerciseRename();

            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();

            handleCancelExerciseRename();
        }
    }

    function formatElapsedTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);

        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const seconds = totalSeconds % 60;

        return [hours, minutes, seconds]
            .map((value) => String(value).padStart(2, '0'))
            .join(':');
    }

    function getStatusClass() {
        if (liveWorkout.endedAt) {
            return styles.finishedStatus;
        }

        if (liveWorkout.pausedAt) {
            return styles.pausedStatus;
        }

        return styles.activeStatus;
    }

    function getStatusText() {
        if (liveWorkout.endedAt) {
            return 'Workout finished';
        }

        if (liveWorkout.pausedAt) {
            return 'Workout paused';
        }

        return 'Workout in progress';
    }

    return (
        <main className={styles.page}>
            <h1 className={styles.pageTitle}>Live workout</h1>

            {!liveWorkout.startedAt ? (
                <section className={styles.preWorkoutCard}>
                    <div className={styles.preWorkoutStatus}>
                        <p className={styles.metaLabel}>STATUS</p>

                        <p className={styles.readyStatus}>Ready to start</p>
                    </div>

                    <div className={styles.preWorkoutContent}>
                        <p className={styles.metaLabel}>LIVE WORKOUT</p>

                        <h2 className={styles.preWorkoutTitle}>
                            Start a new workout
                        </h2>

                        <p className={styles.preWorkoutDescription}>
                            Track your exercises, sets, reps, weight and workout
                            duration as you train.
                        </p>
                    </div>

                    <div className={styles.preWorkoutActions}>
                        <button
                            type="button"
                            className={styles.startButton}
                            onClick={handleStartWorkout}
                        >
                            Start workout
                        </button>
                    </div>
                </section>
            ) : (
                <section className={styles.workoutCard}>
                    {!liveWorkout.endedAt && (
                        <button
                            type="button"
                            className={styles.discardWorkoutButton}
                            aria-label="Discard workout"
                            title="Discard workout"
                            onClick={handleOpenDiscardWorkout}
                        >
                            ×
                        </button>
                    )}

                    <div className={styles.metaGrid}>
                        <div>
                            <p className={styles.metaLabel}>STATUS</p>

                            <p className={getStatusClass()}>
                                {getStatusText()}
                            </p>
                        </div>

                        <div className={styles.timeBlock}>
                            <p className={styles.metaLabel}>TIME</p>

                            <p className={styles.timer}>
                                {formatElapsedTime(elapsedSeconds)}
                            </p>
                        </div>
                    </div>

                    <div className={styles.exerciseToolbar}>
                        <p className={styles.metaLabel}>EXERCISES</p>

                        {!liveWorkout.endedAt && !isExerciseFormOpen && (
                            <button
                                type="button"
                                className={styles.addExerciseLink}
                                disabled={Boolean(liveWorkout.pausedAt)}
                                onClick={() => setIsExerciseFormOpen(true)}
                            >
                                + Add exercise
                            </button>
                        )}
                    </div>

                    {isExerciseFormOpen && !liveWorkout.endedAt && (
                        <form
                            className={styles.exerciseForm}
                            onSubmit={handleAddExercise}
                        >
                            <input
                                type="text"
                                className={styles.exerciseInput}
                                value={newExerciseName}
                                disabled={Boolean(liveWorkout.pausedAt)}
                                onChange={(event) => {
                                    setExerciseNameError('');

                                    setNewExerciseName(event.target.value);
                                }}
                                placeholder="Exercise name"
                                autoFocus
                            />

                            <button
                                type="submit"
                                className={styles.addButton}
                                disabled={Boolean(liveWorkout.pausedAt)}
                            >
                                Add
                            </button>

                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => {
                                    setExerciseNameError('');

                                    setIsExerciseFormOpen(false);

                                    setNewExerciseName('');
                                }}
                            >
                                Cancel
                            </button>

                            {exerciseNameError && (
                                <p className={styles.exerciseNameError}>
                                    {exerciseNameError}
                                </p>
                            )}
                        </form>
                    )}

                    <div
                        className={`${styles.exerciseScrollArea} ${isDraggingExercise ? styles.exerciseScrollAreaDragging : ''}`}
                    >
                        {liveWorkout.exercises.length === 0 ? (
                            <p className={styles.emptyText}>
                                No exercises added yet.
                            </p>
                        ) : (
                            <DndContext
                                sensors={exerciseSensors}
                                modifiers={[constrainExerciseDrag]}
                                onDragCancel={() =>
                                    setIsDraggingExercise(false)
                                }
                                collisionDetection={closestCenter}
                                onDragStart={handleExerciseDragStart}
                                onDragEnd={handleExerciseDragEnd}
                            >
                                <SortableContext
                                    items={liveWorkout.exercises.map(
                                        (exercise) => exercise.id,
                                    )}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className={styles.exerciseList}>
                                        {liveWorkout.exercises.map(
                                            (exercise, exerciseIndex) => {
                                                const isExpanded =
                                                    expandedExerciseId ===
                                                    exercise.id;

                                                const isRenaming =
                                                    exerciseRename?.exerciseId ===
                                                    exercise.id;

                                                const completedSets =
                                                    exercise.sets.filter(
                                                        (set) =>
                                                            set.completedAt,
                                                    );

                                                const averageReps =
                                                    completedSets.length > 0
                                                        ? completedSets.reduce(
                                                              (sum, set) =>
                                                                  sum +
                                                                  Number(
                                                                      set.reps ||
                                                                          0,
                                                                  ),
                                                              0,
                                                          ) /
                                                          completedSets.length
                                                        : null;

                                                const weightedSets =
                                                    completedSets.filter(
                                                        (set) =>
                                                            set.weightKg !== '',
                                                    );

                                                const averageWeight =
                                                    weightedSets.length > 0
                                                        ? weightedSets.reduce(
                                                              (sum, set) =>
                                                                  sum +
                                                                  Number(
                                                                      set.weightKg,
                                                                  ),
                                                              0,
                                                          ) /
                                                          weightedSets.length
                                                        : null;

                                                const totalVolume =
                                                    completedSets.reduce(
                                                        (sum, set) =>
                                                            sum +
                                                            Number(
                                                                set.reps || 0,
                                                            ) *
                                                                Number(
                                                                    set.weightKg ||
                                                                        0,
                                                                ),
                                                        0,
                                                    );

                                                return (
                                                    <SortableExercise
                                                        key={exercise.id}
                                                        exercise={exercise}
                                                        disabled={
                                                            isExerciseDragDisabled
                                                        }
                                                    >
                                                        {({
                                                            attributes,
                                                            listeners,
                                                            setActivatorNodeRef,
                                                        }) => (
                                                            <>
                                                                <div
                                                                    className={
                                                                        styles.exerciseHeading
                                                                    }
                                                                    onClick={() =>
                                                                        handleToggleExercise(
                                                                            exercise.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.exercisePosition
                                                                        }
                                                                    >
                                                                        <button
                                                                            ref={
                                                                                setActivatorNodeRef
                                                                            }
                                                                            type="button"
                                                                            className={
                                                                                styles.exerciseDragHandle
                                                                            }
                                                                            {...attributes}
                                                                            {...listeners}
                                                                            disabled={
                                                                                isExerciseDragDisabled
                                                                            }
                                                                            aria-label={`Reorder ${exercise.name}`}
                                                                            title="Drag to reorder; use Space and arrow keys with keyboard"
                                                                            onClick={(
                                                                                event,
                                                                            ) =>
                                                                                event.stopPropagation()
                                                                            }
                                                                        >
                                                                            <svg
                                                                                width="12"
                                                                                height="18"
                                                                                viewBox="0 0 12 18"
                                                                                fill="currentColor"
                                                                                aria-hidden="true"
                                                                            >
                                                                                <circle
                                                                                    cx="3"
                                                                                    cy="4"
                                                                                    r="1.3"
                                                                                />
                                                                                <circle
                                                                                    cx="9"
                                                                                    cy="4"
                                                                                    r="1.3"
                                                                                />
                                                                                <circle
                                                                                    cx="3"
                                                                                    cy="9"
                                                                                    r="1.3"
                                                                                />
                                                                                <circle
                                                                                    cx="9"
                                                                                    cy="9"
                                                                                    r="1.3"
                                                                                />
                                                                                <circle
                                                                                    cx="3"
                                                                                    cy="14"
                                                                                    r="1.3"
                                                                                />
                                                                                <circle
                                                                                    cx="9"
                                                                                    cy="14"
                                                                                    r="1.3"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                        <span
                                                                            className={
                                                                                styles.exerciseNumber
                                                                            }
                                                                        >
                                                                            {exerciseIndex +
                                                                                1}
                                                                        </span>
                                                                    </div>

                                                                    {isRenaming ? (
                                                                        <div
                                                                            className={
                                                                                styles.exerciseRenameControls
                                                                            }
                                                                            onClick={(
                                                                                event,
                                                                            ) =>
                                                                                event.stopPropagation()
                                                                            }
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                className={
                                                                                    styles.exerciseRenameInput
                                                                                }
                                                                                value={
                                                                                    exerciseRename.draftName
                                                                                }
                                                                                onChange={(
                                                                                    event,
                                                                                ) =>
                                                                                    handleExerciseRenameChange(
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                                onKeyDown={
                                                                                    handleExerciseRenameKeyDown
                                                                                }
                                                                                autoFocus
                                                                            />

                                                                            <button
                                                                                type="button"
                                                                                className={
                                                                                    styles.exerciseRenameSaveButton
                                                                                }
                                                                                aria-label="Save exercise name"
                                                                                title="Save exercise name"
                                                                                onClick={(
                                                                                    event,
                                                                                ) => {
                                                                                    event.stopPropagation();

                                                                                    handleSaveExerciseRename();
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        saveIcon
                                                                                    }
                                                                                    alt=""
                                                                                />
                                                                            </button>

                                                                            {exerciseRenameError.length !==
                                                                                0 && (
                                                                                <p
                                                                                    className={
                                                                                        styles.exerciseRenameError
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        exerciseRenameError
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <h3
                                                                            className={
                                                                                styles.exerciseTitle
                                                                            }
                                                                            title={
                                                                                exercise.name
                                                                            }
                                                                        >
                                                                            {
                                                                                exercise.name
                                                                            }
                                                                        </h3>
                                                                    )}

                                                                    <span
                                                                        className={
                                                                            styles.exerciseSummary
                                                                        }
                                                                    >
                                                                        {completedSets.length >
                                                                            0 &&
                                                                            averageReps !==
                                                                                null &&
                                                                            averageWeight !==
                                                                                null && (
                                                                                <span
                                                                                    className={`${styles.averageSummary} ${
                                                                                        isExpanded
                                                                                            ? styles.averageSummaryHidden
                                                                                            : ''
                                                                                    }`}
                                                                                >
                                                                                    Avg{' '}
                                                                                    {averageReps.toFixed(
                                                                                        1,
                                                                                    )}
                                                                                    {
                                                                                        ' × '
                                                                                    }
                                                                                    {averageWeight.toFixed(
                                                                                        1,
                                                                                    )}
                                                                                    {
                                                                                        ' kg'
                                                                                    }
                                                                                    {totalVolume >
                                                                                        0 && (
                                                                                        <span
                                                                                            className={
                                                                                                styles.summaryDivider
                                                                                            }
                                                                                        >
                                                                                            ·
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            )}

                                                                        {totalVolume >
                                                                            0 && (
                                                                            <span
                                                                                className={
                                                                                    styles.volumeSummary
                                                                                }
                                                                            >
                                                                                {Math.round(
                                                                                    totalVolume,
                                                                                ).toLocaleString()}

                                                                                {
                                                                                    ' kg volume'
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={
                                                                            styles.setCount
                                                                        }
                                                                    >
                                                                        {
                                                                            exercise
                                                                                .sets
                                                                                .length
                                                                        }{' '}
                                                                        {exercise
                                                                            .sets
                                                                            .length ===
                                                                        1
                                                                            ? 'set'
                                                                            : 'sets'}
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.exerciseToggle
                                                                        }
                                                                        aria-label={
                                                                            isExpanded
                                                                                ? 'Collapse exercise'
                                                                                : 'Expand exercise'
                                                                        }
                                                                        aria-expanded={
                                                                            isExpanded
                                                                        }
                                                                        title={
                                                                            isExpanded
                                                                                ? 'Collapse exercise'
                                                                                : 'Expand exercise'
                                                                        }
                                                                        onClick={(
                                                                            event,
                                                                        ) => {
                                                                            event.stopPropagation();

                                                                            handleToggleExercise(
                                                                                exercise.id,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className={`${styles.exerciseChevron} ${
                                                                                isExpanded
                                                                                    ? styles.exerciseChevronExpanded
                                                                                    : ''
                                                                            }`}
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    chevronIcon
                                                                                }
                                                                                alt=""
                                                                            />
                                                                        </span>
                                                                    </button>

                                                                    <div
                                                                        className={
                                                                            styles.exerciseOptionsWrapper
                                                                        }
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles.exerciseOptionsButton
                                                                            }
                                                                            aria-label="Exercise options"
                                                                            title="Exercise options"
                                                                            onClick={(
                                                                                event,
                                                                            ) => {
                                                                                event.stopPropagation();

                                                                                handleExerciseOptions(
                                                                                    event,
                                                                                    exercise.id,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    moreIcon
                                                                                }
                                                                                alt=""
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`${styles.exerciseContent} ${
                                                                        isExpanded
                                                                            ? styles.exerciseContentExpanded
                                                                            : ''
                                                                    }`}
                                                                    aria-hidden={
                                                                        !isExpanded
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.exerciseContentInner
                                                                        }
                                                                    >
                                                                        {exercise
                                                                            .sets
                                                                            .length ===
                                                                        0 ? (
                                                                            <p
                                                                                className={
                                                                                    styles.emptySetText
                                                                                }
                                                                            >
                                                                                No
                                                                                sets
                                                                                added.
                                                                            </p>
                                                                        ) : (
                                                                            <>
                                                                                <div
                                                                                    className={
                                                                                        styles.setHeader
                                                                                    }
                                                                                >
                                                                                    <span />
                                                                                    <span>
                                                                                        SET
                                                                                    </span>
                                                                                    <span>
                                                                                        REPS
                                                                                    </span>
                                                                                    <span>
                                                                                        WEIGHT
                                                                                    </span>
                                                                                    <span />
                                                                                    <span />
                                                                                </div>

                                                                                <DndContext
                                                                                    sensors={
                                                                                        sensors
                                                                                    }
                                                                                    onDragEnd={(
                                                                                        event,
                                                                                    ) =>
                                                                                        handleDragEnd(
                                                                                            event,
                                                                                            exercise.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SortableContext
                                                                                        items={exercise.sets.map(
                                                                                            (
                                                                                                set,
                                                                                            ) =>
                                                                                                set.id,
                                                                                        )}
                                                                                        strategy={
                                                                                            verticalListSortingStrategy
                                                                                        }
                                                                                    >
                                                                                        <div
                                                                                            className={
                                                                                                styles.setList
                                                                                            }
                                                                                        >
                                                                                            {exercise.sets.map(
                                                                                                (
                                                                                                    set,
                                                                                                    setIndex,
                                                                                                ) => (
                                                                                                    <SortableSetRow
                                                                                                        key={
                                                                                                            set.id
                                                                                                        }
                                                                                                        set={
                                                                                                            set
                                                                                                        }
                                                                                                        setIndex={
                                                                                                            setIndex
                                                                                                        }
                                                                                                        exercise={
                                                                                                            exercise
                                                                                                        }
                                                                                                        editingSet={
                                                                                                            editingSet
                                                                                                        }
                                                                                                        liveWorkout={
                                                                                                            liveWorkout
                                                                                                        }
                                                                                                        handleSetChange={
                                                                                                            handleSetChange
                                                                                                        }
                                                                                                        handleEditingSetChange={
                                                                                                            handleEditingSetChange
                                                                                                        }
                                                                                                        handleCompleteSet={
                                                                                                            handleCompleteSet
                                                                                                        }
                                                                                                        handleSaveSet={
                                                                                                            handleSaveSet
                                                                                                        }
                                                                                                        handleEditSet={
                                                                                                            handleEditSet
                                                                                                        }
                                                                                                        handleDeleteSet={
                                                                                                            handleDeleteSet
                                                                                                        }
                                                                                                    />
                                                                                                ),
                                                                                            )}
                                                                                        </div>
                                                                                    </SortableContext>
                                                                                </DndContext>
                                                                            </>
                                                                        )}

                                                                        {!liveWorkout.endedAt && (
                                                                            <button
                                                                                type="button"
                                                                                ref={(
                                                                                    element,
                                                                                ) => {
                                                                                    if (
                                                                                        element
                                                                                    ) {
                                                                                        addSetButtonRefs.current[
                                                                                            exercise.id
                                                                                        ] =
                                                                                            element;
                                                                                    } else {
                                                                                        delete addSetButtonRefs
                                                                                            .current[
                                                                                            exercise
                                                                                                .id
                                                                                        ];
                                                                                    }
                                                                                }}
                                                                                className={
                                                                                    styles.addSetLink
                                                                                }
                                                                                disabled={Boolean(
                                                                                    liveWorkout.pausedAt,
                                                                                )}
                                                                                onClick={() =>
                                                                                    handleAddSet(
                                                                                        exercise.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                +
                                                                                Add
                                                                                set
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </SortableExercise>
                                                );
                                            },
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                        {finishWorkoutError && (
                            <p
                                className={styles.finishWorkoutError}
                                role="alert"
                            >
                                {finishWorkoutError}
                            </p>
                        )}
                    </div>

                    {!liveWorkout.endedAt && (
                        <div className={styles.workoutActions}>
                            {liveWorkout.pausedAt ? (
                                <button
                                    type="button"
                                    className={styles.resumeButton}
                                    onClick={handleResumeWorkout}
                                >
                                    Resume
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.pauseButton}
                                    onClick={handlePauseWorkout}
                                >
                                    Pause
                                </button>
                            )}

                            <button
                                type="button"
                                className={styles.endButton}
                                onClick={handleEndWorkout}
                            >
                                End workout
                            </button>
                        </div>
                    )}
                </section>
            )}

            {openExerciseMenu !== null &&
                exerciseMenuPosition &&
                createPortal(
                    <div
                        ref={exerciseMenuRef}
                        className={styles.exerciseMenu}
                        style={{
                            top: exerciseMenuPosition.top,

                            right: exerciseMenuPosition.right,
                        }}
                    >
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();

                                const exerciseId = openExerciseMenu;

                                setOpenExerciseMenu(null);

                                setExerciseMenuPosition(null);

                                handleStartExerciseRename(exerciseId);
                            }}
                        >
                            Rename
                        </button>

                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();

                                const exerciseId = openExerciseMenu;

                                setOpenExerciseMenu(null);

                                setExerciseMenuPosition(null);

                                handleDeleteExercise(exerciseId);
                            }}
                        >
                            Delete
                        </button>
                    </div>,

                    document.body,
                )}

            {isFinishWorkoutModalOpen && (
                <FinishWorkoutModal
                    onClose={handleCancelFinishWorkout}
                    onFinish={handleFinishWorkout}
                />
            )}

            {isDiscardWorkoutModalOpen && (
                <DiscardWorkoutModal
                    onClose={handleCloseDiscardWorkout}
                    onDiscard={handleDiscardWorkout}
                />
            )}
        </main>
    );
}
