import styles from './AddWorkoutForm.module.css';

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from 'react';

import { DayPicker } from '@daypicker/react';
import '@daypicker/react/style.css';

import WorkoutFields from './WorkoutFields';

import strengthImage
    from '../assets/workout-types/strength.jpg';

import runningImage
    from '../assets/workout-types/running.jpg';

import cyclingImage
    from '../assets/workout-types/cycling.jpg';

import walkingImage
    from '../assets/workout-types/walking.jpg';


const WORKOUT_TYPES = [
    {
        label: 'Strength',
        value: 'strength',
        image: strengthImage
    },
    {
        label: 'Running',
        value: 'running',
        image: runningImage
    },
    {
        label: 'Cycling',
        value: 'cycling',
        image: cyclingImage
    },
    {
        label: 'Walking',
        value: 'walking',
        image: walkingImage
    }
];


function getTodayDateString() {
    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            today.getDate()
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


function formatDisplayedDate(
    dateString
) {
    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    return date.toLocaleDateString(
        undefined,
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );
}


function formatDateForState(
    date
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            date.getDate()
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


function getDuration(
    formData,
    workoutType
) {
    const hours =
        Number(
            formData.get(
                `${workoutType}DurationHours`
            ) || 0
        );

    const minutes =
        Number(
            formData.get(
                `${workoutType}DurationMinutes`
            ) || 0
        );

    const totalMinutes =
        hours * 60 + minutes;

    return totalMinutes > 0
        ? totalMinutes
        : undefined;
}


function StepHeading({
    step,
    title,
    isComplete
}) {
    return (
        <div
            className={
                styles.sectionHeading
            }
        >
            <span
                className={`
                    ${styles.stepBadge}

                    ${isComplete
                        ? styles.stepBadgeComplete
                        : ''
                    }
                `}
            >
                {step}
            </span>

            <h3
                className={
                    styles.sectionTitle
                }
            >
                {title}
            </h3>
        </div>
    );
}


function isStrengthComplete(
    formData
) {
    const muscleGroups =
        formData.getAll(
            'strengthMuscleGroups'
        );


    const intensity =
        formData.get(
            'strengthIntensity'
        );

    return (
        muscleGroups.length > 0
        && Boolean(intensity)
    );
}


function isRunningComplete(
    formData
) {


    const duration =
        getDuration(
            formData,
            'running'
        );

    const intensity =
        formData.get(
            'runningIntensity'
        );

    return (
        duration !== undefined
        && Boolean(intensity)
    );
}


function isWalkingComplete(
    formData
) {


    const duration =
        getDuration(
            formData,
            'walking'
        );

    const intensity =
        formData.get(
            'walkingIntensity'
        );

    return (
        duration !== undefined
        && Boolean(intensity)
    );
}


function isCyclingComplete(
    formData
) {

    const duration =
        getDuration(
            formData,
            'cycling'
        );

    const intensity =
        formData.get(
            'cyclingIntensity'
        );

    return (
        duration !== undefined
        && Boolean(intensity)
    );
}


function isWorkoutComplete(
    formData,
    workoutType
) {
    if (workoutType === 'strength') {
        return isStrengthComplete(
            formData
        );
    }

    if (workoutType === 'running') {
        return isRunningComplete(
            formData
        );
    }

    if (workoutType === 'walking') {
        return isWalkingComplete(
            formData
        );
    }

    if (workoutType === 'cycling') {
        return isCyclingComplete(
            formData
        );
    }

    return false;
}


function buildWorkoutData(
    formData,
    workoutType
) {
    const durationMinutes =
        getDuration(
            formData,
            workoutType
        );

    const intensity =
        Number(
            formData.get(
                `${workoutType}Intensity`
            )
        );


    if (workoutType === 'strength') {
        return {
            type: 'strength',

            muscleGroups:
                formData.getAll(
                    'strengthMuscleGroups'
                ),

            durationMinutes,

            intensity
        };
    }


    const distanceValue =
        
            formData.get(
                `${workoutType}DistanceKm`
            
        );
    
        const distanceKm=distanceValue==='' ? undefined : Number(distanceValue);


    if (workoutType === 'cycling') {

        const averageSpeedValue=formData.get('cyclingAverageSpeed');
        const averageSpeedKmh=averageSpeedValue===''? undefined : Number(averageSpeedValue);

        return {
            type: 'cycling',

            distanceKm,

            averageSpeedKmh,

            durationMinutes,

            intensity
        };
    }


    const paceMinutesValue=formData.get(
                `${workoutType}PaceMinutes`
            );
    
    const paceSecondsValue=formData.get(
                `${workoutType}PaceSeconds`
            );

    const hasPace = paceMinutesValue !=='' || paceSecondsValue !== '';

    const paceSecondsPerKm=hasPace ? Number(paceMinutesValue || 0) *60 + Number(paceSecondsValue || 0) : undefined;

    return {
        type: workoutType,

        distanceKm,

        paceSecondsPerKm,

        durationMinutes,

        intensity
    };
}


export default function AddWorkoutForm({
    onSubmit,
    onClose
}) {
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState('');

    const [
        selectedDate,
        setSelectedDate
    ] = useState(
        getTodayDateString
    );

    const [
        isCalendarOpen,
        setIsCalendarOpen
    ] = useState(false);

    const [
        selectedWorkoutTypes,
        setSelectedWorkoutTypes
    ] = useState([]);

    const [
        isWorkoutDetailsStepComplete,
        setIsWorkoutDetailsStepComplete
    ] = useState(false);


    /*
        Height of the entire WorkoutFields grid.

        This is what lets the form smoothly
        grow when a third/fourth card creates
        another row.
    */

    const [
        workoutFieldsHeight,
        setWorkoutFieldsHeight
    ] = useState(0);


    /*
        Individual card heights.

        Example:

        {
            strength: 470,
            running: 470,
            cycling: 430
        }

        Cards in the same row receive the
        same target height.
    */

    const [
        workoutCardHeights,
        setWorkoutCardHeights
    ] = useState({});


    const formRef =
        useRef(null);

    const calendarRef =
        useRef(null);

    const workoutFieldsRef =
        useRef(null);


    const hasWorkoutDetails =
        selectedWorkoutTypes.length > 0;

    const isDateStepComplete =
        Boolean(selectedDate);

    const isWorkoutTypeStepComplete =
        selectedWorkoutTypes.length > 0;


    /*
        CALENDAR OUTSIDE CLICK
    */

    useEffect(() => {
        if (!isCalendarOpen) {
            return;
        }


        function handleClickOutside(
            event
        ) {
            if (
                calendarRef.current
                &&
                !calendarRef.current.contains(
                    event.target
                )
            ) {
                setIsCalendarOpen(
                    false
                );
            }
        }


        function handleEscape(
            event
        ) {
            if (
                event.key === 'Escape'
            ) {
                setIsCalendarOpen(
                    false
                );
            }
        }


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        document.addEventListener(
            'keydown',
            handleEscape
        );


        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

            document.removeEventListener(
                'keydown',
                handleEscape
            );
        };

    }, [
        isCalendarOpen
    ]);


    /*
        CALCULATE EQUAL CARD HEIGHTS.

        We measure the INNER CONTENT of each
        card rather than the card itself.

        That means an already stretched card
        doesn't corrupt our measurement.
    */

    useLayoutEffect(() => {
        const grid =
            workoutFieldsRef.current;

        if (!grid) {
            return;
        }


        let frameId;


        function calculateCardHeights() {
            const cards =
                Array.from(
                    grid.querySelectorAll(
                        '[data-workout-card]'
                    )
                );


            if (cards.length === 0) {
                setWorkoutCardHeights({});

                return;
            }


            const naturalHeights =
                cards.map(
                    (card) => {
                        const content =
                            card.querySelector(
                                '[data-workout-card-content]'
                            );

                        return {
                            workoutType:
                                card.dataset.workoutCard,

                            height:
                                content
                                    ? content.scrollHeight
                                    : 0
                        };
                    }
                );


            const nextHeights = {};


            /*
                We have two cards per row.

                0 + 1 = row one
                2 + 3 = row two
            */

            for (
                let index = 0;
                index < naturalHeights.length;
                index += 2
            ) {
                const first =
                    naturalHeights[index];

                const second =
                    naturalHeights[index + 1];


                const rowHeight =
                    Math.max(
                        first?.height || 0,
                        second?.height || 0
                    );


                if (first) {
                    nextHeights[
                        first.workoutType
                    ] = rowHeight;
                }


                if (second) {
                    nextHeights[
                        second.workoutType
                    ] = rowHeight;
                }
            }


            setWorkoutCardHeights(
                nextHeights
            );
        }


        frameId =
            requestAnimationFrame(
                calculateCardHeights
            );


        const observer =
            new ResizeObserver(() => {
                cancelAnimationFrame(
                    frameId
                );

                frameId =
                    requestAnimationFrame(
                        calculateCardHeights
                    );
            });


        const contents =
            grid.querySelectorAll(
                '[data-workout-card-content]'
            );


        contents.forEach(
            (content) =>
                observer.observe(content)
        );


        return () => {
            cancelAnimationFrame(
                frameId
            );

            observer.disconnect();
        };

    }, [
        selectedWorkoutTypes
    ]);


    /*
        MEASURE THE WHOLE GRID.

        As the individual cards animate their
        heights, ResizeObserver keeps updating
        this wrapper height too.

        This makes the entire Add Workout form
        follow the movement instead of jumping.
    */

    useLayoutEffect(() => {
        const grid =
            workoutFieldsRef.current;

        if (!grid) {
            return;
        }


        let frameId;


        function updateHeight() {
            setWorkoutFieldsHeight(
                grid.getBoundingClientRect()
                    .height
            );
        }


        frameId =
            requestAnimationFrame(
                updateHeight
            );


        const observer =
            new ResizeObserver(() => {
                cancelAnimationFrame(
                    frameId
                );

                frameId =
                    requestAnimationFrame(
                        updateHeight
                    );
            });


        observer.observe(grid);


        return () => {
            cancelAnimationFrame(
                frameId
            );

            observer.disconnect();
        };

    }, [
        selectedWorkoutTypes
    ]);


    useEffect(() => {
        updateWorkoutDetailsCompletion();

    }, [
        selectedWorkoutTypes
    ]);


    function handleDateSelection(
        date
    ) {
        if (!date) {
            return;
        }


        setSelectedDate(
            formatDateForState(
                date
            )
        );

        setIsCalendarOpen(
            false
        );
    }


    function selectToday() {
        setSelectedDate(
            getTodayDateString()
        );

        setIsCalendarOpen(
            false
        );
    }


    function handleWorkoutTypeChange(
        event
    ) {
        const {
            value,
            checked
        } = event.target;


        if (checked) {
            setSelectedWorkoutTypes(
                (currentTypes) => [
                    ...currentTypes,
                    value
                ]
            );

            return;
        }


        setSelectedWorkoutTypes(
            (currentTypes) =>
                currentTypes.filter(
                    (workoutType) =>
                        workoutType !== value
                )
        );
    }


    function updateWorkoutDetailsCompletion() {
        if (!formRef.current) {
            return;
        }


        if (
            selectedWorkoutTypes.length
            === 0
        ) {
            setIsWorkoutDetailsStepComplete(
                false
            );

            return;
        }


        const formData =
            new FormData(
                formRef.current
            );


        const allComplete =
            selectedWorkoutTypes.every(
                (workoutType) =>
                    isWorkoutComplete(
                        formData,
                        workoutType
                    )
            );


        setIsWorkoutDetailsStepComplete(
            allComplete
        );
    }


    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        setError('');


        const formData =
            new FormData(
                event.currentTarget
            );


        const allComplete =
            selectedWorkoutTypes.length > 0
            &&
            selectedWorkoutTypes.every(
                (workoutType) =>
                    isWorkoutComplete(
                        formData,
                        workoutType
                    )
            );


        if (!allComplete) {
            setError(
                'Complete all workout details before saving.'
            );

            setIsWorkoutDetailsStepComplete(
                false
            );

            return;
        }


        setIsSubmitting(true);


        try {
            const workoutData = {
                date:
                    selectedDate,

                workouts:
                    selectedWorkoutTypes.map(
                        (workoutType) =>
                            buildWorkoutData(
                                formData,
                                workoutType
                            )
                    )
            };

            console.log(workoutData);
            await onSubmit(
                workoutData
            );

            onClose();

        } catch (error) {
            setError(
                error.message
            );

        } finally {
            setIsSubmitting(
                false
            );
        }
    }


    return (
        <form
            ref={formRef}
            className={styles.form}
            onSubmit={handleSubmit}
            onChange={
                updateWorkoutDetailsCompletion
            }
        >

            {/* STEP 1 */}

            <section
                className={
                    styles.formSection
                }
            >
                <StepHeading
                    step="1"
                    title="Choose the workout date"
                    isComplete={
                        isDateStepComplete
                    }
                />


                <div
                    ref={calendarRef}
                    className={
                        styles.datePicker
                    }
                >
                    <button
                        type="button"
                        className={
                            styles.dateButton
                        }
                        onClick={() =>
                            setIsCalendarOpen(
                                (current) =>
                                    !current
                            )
                        }
                        aria-haspopup="dialog"
                        aria-expanded={
                            isCalendarOpen
                        }
                    >
                        <svg
                            className={
                                styles.dateIcon
                            }
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="
                                    M7 2v3
                                    M17 2v3
                                    M3.5 9h17
                                    M5 4h14
                                    a2 2 0 0 1 2 2
                                    v14
                                    a2 2 0 0 1-2 2
                                    H5
                                    a2 2 0 0 1-2-2
                                    V6
                                    a2 2 0 0 1 2-2
                                    Z
                                "
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>


                        <span
                            className={
                                styles.dateValue
                            }
                        >
                            {
                                formatDisplayedDate(
                                    selectedDate
                                )
                            }
                        </span>


                        <svg
                            className={`
                                ${styles.dateChevron}

                                ${isCalendarOpen
                                    ? styles.dateChevronOpen
                                    : ''
                                }
                            `}
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 8l4 4 4-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>


                    {
                        isCalendarOpen
                        && (
                            <div
                                className={
                                    styles.calendarPopover
                                }
                                role="dialog"
                                aria-label="Choose workout date"
                            >
                                <DayPicker
                                    mode="single"
                                    selected={
                                        new Date(
                                            `${selectedDate}T00:00:00`
                                        )
                                    }
                                    onSelect={
                                        handleDateSelection
                                    }
                                    showOutsideDays
                                />


                                <div
                                    className={
                                        styles.calendarFooter
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.todayButton
                                        }
                                        onClick={
                                            selectToday
                                        }
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </section>


            {/* STEP 2 */}

            <fieldset
                className={
                    styles.formSection
                }
            >
                <legend
                    className={
                        styles.visuallyHidden
                    }
                >
                    Select your workout types
                </legend>


                <StepHeading
                    step="2"
                    title="Select your workout types"
                    isComplete={
                        isWorkoutTypeStepComplete
                    }
                />


                <div
                    className={
                        styles.workoutTypeGrid
                    }
                >
                    {
                        WORKOUT_TYPES.map(
                            (workoutType) => (
                                <label
                                    className={
                                        styles.workoutTypeCard
                                    }
                                    key={
                                        workoutType.value
                                    }
                                >
                                    <input
                                        className={
                                            styles.workoutTypeInput
                                        }
                                        name="workoutType"
                                        type="checkbox"
                                        value={
                                            workoutType.value
                                        }
                                        onChange={
                                            handleWorkoutTypeChange
                                        }
                                    />


                                    <img
                                        className={
                                            styles.workoutTypeImage
                                        }
                                        src={
                                            workoutType.image
                                        }
                                        alt=""
                                    />


                                    <span
                                        className={
                                            styles.workoutTypeOverlay
                                        }
                                        aria-hidden="true"
                                    />


                                    <span
                                        className={
                                            styles.workoutTypeGradient
                                        }
                                        aria-hidden="true"
                                    />


                                    <span
                                        className={
                                            styles.workoutTypeLabel
                                        }
                                    >
                                        {
                                            workoutType.label
                                        }
                                    </span>
                                </label>
                            )
                        )
                    }
                </div>
            </fieldset>


            {/* STEP 3 */}

            <div
                className={`
                    ${styles.detailsTransition}

                    ${hasWorkoutDetails
                        ? styles.detailsTransitionOpen
                        : ''
                    }
                `}
            >
                <div
                    className={
                        styles.detailsTransitionInner
                    }
                >
                    <section
                        className={
                            styles.formSection
                        }
                    >
                        <StepHeading
                            step="3"
                            title="Complete the workout details"
                            isComplete={
                                isWorkoutDetailsStepComplete
                            }
                        />


                        <div
                            className={
                                styles.workoutFieldsHeightWrapper
                            }
                            style={{
                                height:
                                    hasWorkoutDetails
                                        ? `${workoutFieldsHeight}px`
                                        : '0px'
                            }}
                        >
                            <div
                                ref={
                                    workoutFieldsRef
                                }
                                className={
                                    styles.workoutFieldsList
                                }
                            >
                                {
                                    selectedWorkoutTypes.map(
                                        (workoutType) => (
                                            <WorkoutFields
                                                key={
                                                    workoutType
                                                }
                                                workoutType={
                                                    workoutType
                                                }
                                                targetHeight={
                                                    workoutCardHeights[
                                                    workoutType
                                                    ]
                                                }
                                            />
                                        )
                                    )
                                }
                            </div>
                        </div>
                    </section>
                </div>
            </div>


            {/* ACTIONS */}

            <div
                className={
                    styles.actions
                }
            >
                <p
                    className={`
                        ${styles.errorMessage}

                        ${error
                            ? styles.errorVisible
                            : ''
                        }
                    `}
                    role="alert"
                >
                    {
                        error
                        || '\u00A0'
                    }
                </p>


                <button
                    className={
                        styles.submitButton
                    }
                    type="submit"
                    disabled={
                        isSubmitting
                    }
                >
                    {
                        isSubmitting
                            ? 'Saving...'
                            : 'Add workout'
                    }
                </button>
            </div>
        </form>
    );
}