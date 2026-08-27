import { useEffect, useRef, useState } from 'react';
import { DayPicker } from '@daypicker/react';
import '@daypicker/react/style.css';

import ActivityGraph from '../components/ActivityGraph';
import GraphLegend from '../components/GraphLegend';
import AddWorkoutForm from '../components/AddWorkoutForm';
import MuscleDiagram from '../components/MuscleDiagram';
import WorkoutDetails from '../components/WorkoutDetails';

import { getWorkoutsRequest, createWorkoutsRequest } from '../api/workouts.js';

import styles from './WorkoutsPage.module.css';

export default function WorkoutsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDayWorkouts, setSelectedDayWorkouts]=useState([]);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const datePickerRef = useRef(null);

    const [workouts, setWorkouts] = useState([]);
    const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
    const [workoutsError, setWorkoutsError] = useState('');


    useEffect(() => {

        async function loadWorkouts() {
            try {
                const loadedWorkouts = await getWorkoutsRequest();
   
                setWorkouts(loadedWorkouts);

            } catch (error) {
                console.error('Failed to load workouts:', error);
                setWorkoutsError(error.message);
            } finally {
                setIsLoadingWorkouts(false);
            }
        }

        loadWorkouts();


    }, []);

    useEffect(() => {
        if (!isCalendarOpen) {
            return;
        }

        function handleClickOutside(event) {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setIsCalendarOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCalendarOpen]);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    function handleWorkoutSelection(date) {
        if (!date) {
            return;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        const workoutSessions = workouts.filter(
            session=>session.date===formattedDate
        )
        const dayWorkouts= workoutSessions.flatMap(
            session=>session.workouts
        )
        
        setSelectedDayWorkouts(dayWorkouts);
        setSelectedDate(formattedDate);

        setIsCalendarOpen(false);
    }

    function formatDisplayedDate(dateString) {
        if (!dateString) {
            return '';
        }

        const date = new Date(`${dateString}T00:00:00`);

        const day = date.toLocaleDateString(undefined, {
            day: 'numeric'
        });

        const month = date.toLocaleDateString(undefined, {
            month: 'long'
        });

        const year = date.toLocaleDateString(undefined, {
            year: 'numeric'
        });

        return `${day} ${month} ${year}`
    }

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    function closeWorkoutDetails() {
        setSelectedDate('');
        setSelectedDayWorkouts([]);
    }


    async function handleAddWorkout(workoutData) {
        const createdWorkout = await createWorkoutsRequest(workoutData);

        setWorkouts((currentWorkouts) => [
            ...currentWorkouts,
            createdWorkout
        ]);
    };

    const selectedStrengthWorkouts=selectedDayWorkouts.filter(
        workout=>workout.type==='strength'
        );
    

    if (isLoadingWorkouts) {
        return <p>Loading workouts...</p>
    }

    if (workoutsError) {
        return <p>Failed to load workouts</p>
    }


    return (
        <div className={styles.workoutsPage}>
            <div className={styles.pageContent}>
                <header className={styles.pageHeader}>
                    <h1>Workouts</h1>
                </header>

                <section className={styles.workoutCard}>
                    <div className={styles.cardHeader}>
                        <h2>Workout activity</h2>

                        <button
                            className={styles.addWorkoutButton}
                            type="button"
                            onClick={openModal}
                        >
                            Add workout
                        </button>
                    </div>

                    <div className={styles.workoutGraphWrapper}>
                        <ActivityGraph
                            workoutSessions={workouts}
                            handleWorkoutSelection={
                                handleWorkoutSelection
                            }
                            selectedDate={selectedDate}
                        />

                        <GraphLegend />
                    </div>
                </section>

                <section className={styles.workoutViewer}>
                    <div
                        className={styles.datePicker}
                        ref={datePickerRef}
                    >
                        <button
                            className={styles.dateButton}
                            type="button"
                            onClick={() =>
                                setIsCalendarOpen(
                                    (currentValue) => !currentValue
                                )
                            }
                            aria-expanded={isCalendarOpen}
                            aria-haspopup="dialog"
                        >
                            <svg
                                className={styles.calendarIcon}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="M7 2v3M17 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <span className={styles.dateButtonContent}>
                                <span className={styles.dateLabel}>
                                    View workout
                                </span>

                                <span className={styles.dateValue}>
                                    {formatDisplayedDate(selectedDate) ||
                                        'Select a date'}
                                </span>
                            </span>

                            <svg
                                className={styles.chevronIcon}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="m7 10 5 5 5-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {isCalendarOpen && (
                            <div className={styles.calendarPopover}>
                                <DayPicker
                                    mode="single"
                                    selected={
                                        selectedDate
                                            ? new Date(
                                                `${selectedDate}T00:00:00`
                                            )
                                            : null
                                    }
                                    onSelect={handleWorkoutSelection}
                                    defaultMonth={
                                        selectedDate
                                            ? new Date(
                                                `${selectedDate}T00:00:00`
                                            )
                                            : new Date()
                                    }
                                    showOutsideDays
                                />
                            </div>
                        )}
                    </div>

                    <div
                        className={`${styles.detailsLayout} ${selectedDate
                            ? styles.detailsLayoutActive
                            : ''
                            }`}
                    >
                        <div className={styles.diagramPanel}>
                            <MuscleDiagram
                                strengthWorkouts={selectedStrengthWorkouts}
                                useIntensity
                            />
                        </div>

                        <aside
                            className={styles.workoutDetailsPanel}
                            aria-hidden={!selectedDate}
                        >
                            <button
                                type='button'
                                onClick={closeWorkoutDetails}
                                aria-label='Close workout details'
                                className={styles.detailsCloseButton}
                            >×</button>
                            {selectedDate &&
                                (selectedDayWorkouts.length > 0 ? (
                                    <WorkoutDetails
                                        workouts={selectedDayWorkouts}
                                        date={selectedDate}
                                    />
                                ) : (
                                    <div
                                        className={
                                            styles.emptyWorkoutState
                                        }
                                    >
                                        <svg
                                            className={
                                                styles.emptyWorkoutIcon
                                            }
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M7 2v3M17 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        <p
                                            className={
                                                styles.noWorkoutTitle
                                            }
                                        >
                                            No workout recorded
                                        </p>

                                        <p
                                            className={
                                                styles.noWorkoutMessage
                                            }
                                        >
                                            There is no workout saved
                                            for{' '}<br />
                                            {formatDisplayedDate(
                                                selectedDate
                                            )}
                                            .
                                        </p>
                                    </div>
                                ))}
                        </aside>
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <div
                    className={styles.modalBackdrop}
                    onMouseDown={closeModal}
                >
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-workout-title"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className={styles.modalHeader}>
                            <h2 id="add-workout-title">
                                Add workout
                            </h2>

                            <button
                                className={styles.closeButton}
                                type="button"
                                aria-label="Close modal"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <AddWorkoutForm onSubmit={handleAddWorkout} onClose={closeModal} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}