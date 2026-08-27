import {
    useEffect,
    useState
} from 'react';

import styles
    from './WorkoutFields.module.css';


const MUSCLE_GROUPS = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Legs',
    'Abs',
    'Forearms',
    'Traps'
];


function formatWorkoutType(
    workoutType
) {
    return (
        workoutType
            .charAt(0)
            .toUpperCase()
        +
        workoutType.slice(1)
    );
}


function splitDuration(
    totalMinutes
) {
    const roundedMinutes =
        Math.round(
            totalMinutes
        );

    const hours =
        Math.floor(
            roundedMinutes / 60
        );

    const minutes =
        roundedMinutes % 60;

    return {
        hours,
        minutes
    };
}


function splitPace(
    totalSecondsPerKm
) {
    const roundedSeconds =
        Math.round(
            totalSecondsPerKm
        );

    const minutes =
        Math.floor(
            roundedSeconds / 60
        );

    const seconds =
        roundedSeconds % 60;

    return {
        minutes,
        seconds
    };
}


function roundToTwoDecimals(
    value
) {
    return (
        Math.round(
            value * 100
        )
        / 100
    );
}


export default function WorkoutFields({
    workoutType,
    targetHeight
}) {
    const [
        hoveredIntensity,
        setHoveredIntensity
    ] = useState(null);

    const [
        selectedIntensity,
        setSelectedIntensity
    ] = useState(null);


    const [
        distanceKm,
        setDistanceKm
    ] = useState('');

    const [
        durationHours,
        setDurationHours
    ] = useState('');

    const [
        durationMinutes,
        setDurationMinutes
    ] = useState('');

    const [
        paceMinutes,
        setPaceMinutes
    ] = useState('');

    const [
        paceSeconds,
        setPaceSeconds
    ] = useState('');

    const [
        averageSpeed,
        setAverageSpeed
    ] = useState('');

    const [
        lastEditedMetrics,
        setLastEditedMetrics
    ] = useState([]);


    const isStrength =
        workoutType === 'strength';

    const usesPace =
        workoutType === 'running'
        ||
        workoutType === 'walking';


    function markMetricAsEdited(
        metric
    ) {
        setLastEditedMetrics(
            (currentMetrics) => {
                const withoutCurrentMetric =
                    currentMetrics.filter(
                        (currentMetric) =>
                            currentMetric
                            !== metric
                    );

                return [
                    ...withoutCurrentMetric,
                    metric
                ].slice(-2);
            }
        );
    }


    useEffect(() => {
        if (isStrength) {
            return;
        }


        if (
            lastEditedMetrics.length < 2
        ) {
            return;
        }


        const editedMetrics =
            new Set(
                lastEditedMetrics
            );


        const distance =
            Number(
                distanceKm
            );


        const totalDurationMinutes =
            Number(
                durationHours
            ) * 60
            +
            Number(
                durationMinutes
            );


        const totalDurationSeconds =
            totalDurationMinutes
            * 60;


        /*
            RUNNING / WALKING
        */

        if (usesPace) {
            const totalPaceSeconds =
                Number(
                    paceMinutes
                ) * 60
                +
                Number(
                    paceSeconds
                );


            /*
                DISTANCE + DURATION
                -> CALCULATE PACE
            */

            if (
                editedMetrics.has(
                    'distance'
                )
                &&
                editedMetrics.has(
                    'duration'
                )
                &&
                distance > 0
                &&
                totalDurationSeconds > 0
            ) {
                const calculatedPace =
                    totalDurationSeconds
                    / distance;


                const {
                    minutes,
                    seconds
                } =
                    splitPace(
                        calculatedPace
                    );


                setPaceMinutes(
                    String(
                        minutes
                    )
                );

                setPaceSeconds(
                    String(
                        seconds
                    )
                );


                return;
            }


            /*
                DISTANCE + PACE
                -> CALCULATE DURATION
            */

            if (
                editedMetrics.has(
                    'distance'
                )
                &&
                editedMetrics.has(
                    'pace'
                )
                &&
                distance > 0
                &&
                totalPaceSeconds > 0
            ) {
                const calculatedDurationMinutes =
                    (
                        distance
                        *
                        totalPaceSeconds
                    )
                    / 60;


                const {
                    hours,
                    minutes
                } =
                    splitDuration(
                        calculatedDurationMinutes
                    );


                setDurationHours(
                    String(
                        hours
                    )
                );

                setDurationMinutes(
                    String(
                        minutes
                    )
                );


                return;
            }


            /*
                DURATION + PACE
                -> CALCULATE DISTANCE
            */

            if (
                editedMetrics.has(
                    'duration'
                )
                &&
                editedMetrics.has(
                    'pace'
                )
                &&
                totalDurationSeconds > 0
                &&
                totalPaceSeconds > 0
            ) {
                const calculatedDistance =
                    totalDurationSeconds
                    / totalPaceSeconds;


                setDistanceKm(
                    String(
                        roundToTwoDecimals(
                            calculatedDistance
                        )
                    )
                );
            }


            return;
        }


        /*
            CYCLING
        */

        if (
            workoutType === 'cycling'
        ) {
            const speed =
                Number(
                    averageSpeed
                );


            /*
                DISTANCE + DURATION
                -> CALCULATE SPEED
            */

            if (
                editedMetrics.has(
                    'distance'
                )
                &&
                editedMetrics.has(
                    'duration'
                )
                &&
                distance > 0
                &&
                totalDurationMinutes > 0
            ) {
                const durationInHours =
                    totalDurationMinutes
                    / 60;


                const calculatedSpeed =
                    distance
                    / durationInHours;


                setAverageSpeed(
                    String(
                        roundToTwoDecimals(
                            calculatedSpeed
                        )
                    )
                );


                return;
            }


            /*
                DISTANCE + SPEED
                -> CALCULATE DURATION
            */

            if (
                editedMetrics.has(
                    'distance'
                )
                &&
                editedMetrics.has(
                    'speed'
                )
                &&
                distance > 0
                &&
                speed > 0
            ) {
                const calculatedDurationMinutes =
                    (
                        distance
                        / speed
                    )
                    * 60;


                const {
                    hours,
                    minutes
                } =
                    splitDuration(
                        calculatedDurationMinutes
                    );


                setDurationHours(
                    String(
                        hours
                    )
                );

                setDurationMinutes(
                    String(
                        minutes
                    )
                );


                return;
            }


            /*
                DURATION + SPEED
                -> CALCULATE DISTANCE
            */

            if (
                editedMetrics.has(
                    'duration'
                )
                &&
                editedMetrics.has(
                    'speed'
                )
                &&
                totalDurationMinutes > 0
                &&
                speed > 0
            ) {
                const durationInHours =
                    totalDurationMinutes
                    / 60;


                const calculatedDistance =
                    speed
                    * durationInHours;


                setDistanceKm(
                    String(
                        roundToTwoDecimals(
                            calculatedDistance
                        )
                    )
                );
            }
        }

    }, [
        distanceKm,
        durationHours,
        durationMinutes,
        paceMinutes,
        paceSeconds,
        averageSpeed,
        lastEditedMetrics,
        isStrength,
        usesPace,
        workoutType
    ]);


    return (
        <section
            className={
                styles.card
            }
            data-workout-card={
                workoutType
            }
            style={{
                height:
                    targetHeight
                        ? `${targetHeight}px`
                        : undefined
            }}
        >
            <div
                className={
                    styles.cardContent
                }
                data-workout-card-content
            >

                {/* HEADER */}

                <div
                    className={
                        styles.header
                    }
                >
                    <h3
                        className={
                            styles.title
                        }
                    >
                        {
                            formatWorkoutType(
                                workoutType
                            )
                        }
                    </h3>

                    <span
                        className={
                            styles.subtitle
                        }
                    >
                        Workout details
                    </span>
                </div>


                {/* STRENGTH */}

                {
                    isStrength
                    && (
                        <fieldset
                            className={
                                styles.fieldset
                            }
                        >
                            <legend
                                className={
                                    styles.legend
                                }
                            >
                                Muscle groups
                            </legend>


                            <div
                                className={
                                    styles.muscleGroupTags
                                }
                            >
                                {
                                    MUSCLE_GROUPS.map(
                                        (
                                            muscleGroup
                                        ) => (
                                            <label
                                                className={
                                                    styles.muscleGroupTag
                                                }
                                                key={
                                                    muscleGroup
                                                }
                                            >
                                                <input
                                                    className={
                                                        styles.hiddenInput
                                                    }
                                                    name={
                                                        `${workoutType}MuscleGroups`
                                                    }
                                                    type="checkbox"
                                                    value={
                                                        muscleGroup.toLowerCase()
                                                    }
                                                />

                                                <span>
                                                    {
                                                        muscleGroup
                                                    }
                                                </span>
                                            </label>
                                        )
                                    )
                                }
                            </div>
                        </fieldset>
                    )
                }


                {/* DURATION */}

                <fieldset
                    className={
                        styles.fieldset
                    }
                >
                    <legend
                        className={
                            styles.legend
                        }
                    >
                        Duration

                        {
                            isStrength
                            && (
                                <span
                                    className={
                                        styles.optionalLabel
                                    }
                                >
                                    (Optional)
                                </span>
                            )
                        }
                    </legend>


                    <div
                        className={
                            styles.durationFields
                        }
                    >
                        <label
                            className={
                                styles.durationField
                            }
                        >
                            <input
                                type="number"
                                name={
                                    `${workoutType}DurationHours`
                                }
                                min="0"
                                step="1"
                                placeholder="0"
                                value={
                                    durationHours
                                }
                                onChange={
                                    (event) => {
                                        setDurationHours(
                                            event.target.value
                                        );

                                        if (!isStrength) {
                                            markMetricAsEdited(
                                                'duration'
                                            );
                                        }
                                    }
                                }
                            />

                            <span>
                                Hours
                            </span>
                        </label>


                        <label
                            className={
                                styles.durationField
                            }
                        >
                            <input
                                type="number"
                                name={
                                    `${workoutType}DurationMinutes`
                                }
                                min="0"
                                max="59"
                                step="1"
                                placeholder="0"
                                value={
                                    durationMinutes
                                }
                                onChange={
                                    (event) => {
                                        setDurationMinutes(
                                            event.target.value
                                        );

                                        if (!isStrength) {
                                            markMetricAsEdited(
                                                'duration'
                                            );
                                        }
                                    }
                                }
                            />

                            <span>
                                Minutes
                            </span>
                        </label>
                    </div>
                </fieldset>


                {/* CARDIO */}

                {
                    !isStrength
                    && (
                        <div
                            className={
                                styles.cardioFields
                            }
                        >

                            {/* DISTANCE */}

                            <label
                                className={
                                    styles.field
                                }
                            >
                                <span
                                    className={
                                        styles.fieldLabel
                                    }
                                >
                                    Distance

                                    <span
                                        className={
                                            styles.optionalLabel
                                        }
                                    >
                                        (Optional)
                                    </span>
                                </span>


                                <div
                                    className={
                                        styles.inputWithUnit
                                    }
                                >
                                    <input
                                        type="number"
                                        name={
                                            `${workoutType}DistanceKm`
                                        }
                                        min="0"
                                        step="1"
                                        placeholder="0.00"
                                        value={
                                            distanceKm
                                        }
                                        onChange={
                                            (event) => {
                                                setDistanceKm(
                                                    event.target.value
                                                );

                                                markMetricAsEdited(
                                                    'distance'
                                                );
                                            }
                                        }
                                    />

                                    <span
                                        className={
                                            styles.unit
                                        }
                                    >
                                        km
                                    </span>
                                </div>
                            </label>


                            {/* PACE */}

                            {
                                usesPace
                                && (
                                    <div
                                        className={
                                            styles.field
                                        }
                                    >
                                        <span
                                            className={
                                                styles.fieldLabel
                                            }
                                        >
                                            Pace

                                            <span
                                                className={
                                                    styles.optionalLabel
                                                }
                                            >
                                                (Optional)
                                            </span>
                                        </span>


                                        <div
                                            className={
                                                styles.paceFields
                                            }
                                        >
                                            <label>
                                                <input
                                                    type="number"
                                                    name={
                                                        `${workoutType}PaceMinutes`
                                                    }
                                                    min="0"
                                                    step="1"
                                                    placeholder="0"
                                                    value={
                                                        paceMinutes
                                                    }
                                                    onChange={
                                                        (event) => {
                                                            setPaceMinutes(
                                                                event.target.value
                                                            );

                                                            markMetricAsEdited(
                                                                'pace'
                                                            );
                                                        }
                                                    }
                                                />

                                                <span>
                                                    min
                                                </span>
                                            </label>


                                            <label>
                                                <input
                                                    type="number"
                                                    name={
                                                        `${workoutType}PaceSeconds`
                                                    }
                                                    min="0"
                                                    max="59"
                                                    step="1"
                                                    placeholder="00"
                                                    value={
                                                        paceSeconds
                                                    }
                                                    onChange={
                                                        (event) => {
                                                            setPaceSeconds(
                                                                event.target.value
                                                            );

                                                            markMetricAsEdited(
                                                                'pace'
                                                            );
                                                        }
                                                    }
                                                />

                                                <span>
                                                    sec
                                                </span>
                                            </label>


                                            <span
                                                className={
                                                    styles.perKm
                                                }
                                            >
                                                / km
                                            </span>
                                        </div>
                                    </div>
                                )
                            }


                            {/* CYCLING SPEED */}

                            {
                                workoutType
                                === 'cycling'
                                && (
                                    <label
                                        className={
                                            styles.field
                                        }
                                    >
                                        <span
                                            className={
                                                styles.fieldLabel
                                            }
                                        >
                                            Average speed

                                            <span
                                                className={
                                                    styles.optionalLabel
                                                }
                                            >
                                                (Optional)
                                            </span>
                                        </span>


                                        <div
                                            className={
                                                styles.inputWithUnit
                                            }
                                        >
                                            <input
                                                type="number"
                                                name="cyclingAverageSpeed"
                                                min="0"
                                                step="0.1"
                                                placeholder="0.0"
                                                value={
                                                    averageSpeed
                                                }
                                                onChange={
                                                    (event) => {
                                                        setAverageSpeed(
                                                            event.target.value
                                                        );

                                                        markMetricAsEdited(
                                                            'speed'
                                                        );
                                                    }
                                                }
                                            />

                                            <span
                                                className={
                                                    styles.unit
                                                }
                                            >
                                                km/h
                                            </span>
                                        </div>
                                    </label>
                                )
                            }
                        </div>
                    )
                }


                {/* INTENSITY */}

                <fieldset
                    className={
                        styles.fieldset
                    }
                >
                    <legend
                        className={
                            styles.legend
                        }
                    >
                        Intensity
                    </legend>


                    <div
                        className={
                            styles.intensityOptions
                        }
                        onMouseLeave={() =>
                            setHoveredIntensity(
                                null
                            )
                        }
                    >
                        {
                            [
                                1,
                                2,
                                3,
                                4,
                                5
                            ].map(
                                (
                                    intensity
                                ) => {
                                    const displayIntensity =
                                        hoveredIntensity
                                        ??
                                        selectedIntensity;

                                    const isActive =
                                        intensity
                                        <=
                                        displayIntensity;


                                    return (
                                        <label
                                            className={
                                                styles.intensityOption
                                            }
                                            key={
                                                intensity
                                            }
                                            onMouseEnter={() =>
                                                setHoveredIntensity(
                                                    intensity
                                                )
                                            }
                                        >
                                            <input
                                                className={
                                                    styles.hiddenInput
                                                }
                                                name={
                                                    `${workoutType}Intensity`
                                                }
                                                type="radio"
                                                value={
                                                    intensity
                                                }
                                                required
                                                onChange={() =>
                                                    setSelectedIntensity(
                                                        intensity
                                                    )
                                                }
                                            />

                                            <span
                                                className={
                                                    isActive
                                                        ? styles.fireActive
                                                        : styles.fireInactive
                                                }
                                            >
                                                🔥
                                            </span>

                                            <span
                                                className={
                                                    styles.intensityLabel
                                                }
                                            >
                                                {
                                                    intensity
                                                    === 1
                                                        ? 'Min'
                                                        : intensity
                                                            === 5
                                                            ? 'Max'
                                                            : '\u00A0'
                                                }
                                            </span>
                                        </label>
                                    );
                                }
                            )
                        }
                    </div>
                </fieldset>
            </div>
        </section>
    );
}