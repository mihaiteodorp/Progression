import styles from './WorkoutDetails.module.css';

const WORKOUT_EMOJIS = {
    strength: {
        neutral: '🏋️',
        male: '🏋️‍♂️',
        female: '🏋️‍♀️'
    },
    swimming: {
        neutral: '🏊',
        male: '🏊‍♂️',
        female: '🏊‍♀️'
    },
    running: {
        neutral: '🏃',
        male: '🏃‍♂️',
        female: '🏃‍♀️'
    },
    cycling: {
        neutral: '🚴',
        male: '🚴‍♂️',
        female: '🚴‍♀️'
    },
    walking: {
        neutral: '🚶',
        male: '🚶‍♂️',
        female: '🚶‍♀️'
    }
};

function getWorkoutEmoji(type, gender) {
    const workoutEmoji = WORKOUT_EMOJIS[type];

    if (!workoutEmoji) {
        return '🏅';
    }

    if (gender === 'male' || gender === 'female') {
        return workoutEmoji[gender];
    }

    return workoutEmoji.neutral ?? workoutEmoji.male;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(dateString) {
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

    return `${day} ${month} ${year}`;
};

function formatWorkoutDuration(durationMinutes) {
    if (!durationMinutes) {
        return '';
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    const parts = [];

    if (hours) {
        parts.push(`${hours}h`);
    };
    if (minutes) {
        parts.push(`${minutes}min`);
    }

    return parts.join(' ');

}



export default function WorkoutDetails({ date, workouts, gender }) {

    if (workouts.length === 0) {
        return null;
    }
   

    const workoutTypes = workouts.map(
        workout => workout.type
    );
    const uniqueWorkoutTypes = [...new Set(workoutTypes)];
    const workoutMuscleGroups = workouts.flatMap(
        workout => workout.muscleGroups ?? []
    );
    const uniqueMuscleGroups = [...new Set(workoutMuscleGroups)];

    const totalDurationMinutes = workouts.reduce((acc, current) => {

        return acc + (current.durationMinutes ?? 0);
    }, 0);

    const totalCaloriesBurned = workouts.reduce((acc, current) => {
        return acc + (current.caloriesBurned ?? 0)
    }, 850);

    const totals = workouts.reduce((acc, current) => {
        const duration = current.durationMinutes ?? 0;
        return ({
            weightedIntensity: acc.weightedIntensity + (current.intensity * duration),
            totalDuration: acc.totalDuration + duration

        })
    }, {
        weightedIntensity: 0,
        totalDuration: 0
    });

    const averageIntensity =
    workouts.reduce(
        (acc, workout) => acc + workout.intensity,
        0
    ) / workouts.length;

    const hasWorkoutWithoutDuration=workouts.some(
        workout=>!workout.durationMinutes
    )

    const weightedIntensity = Math.round(
        hasWorkoutWithoutDuration
        ? averageIntensity :
        totals.weightedIntensity/totals.totalDuration
    );




    return (
        <div className={styles.workoutDetails}>
            <dl>
                <dt>Date</dt>
                <dd>{formatDate(date)}</dd>

                <dt>Type</dt>

                <dd className={styles.workoutTypes}>
                    {uniqueWorkoutTypes.map((type) => (
                        <span
                            key={type}
                            className={styles.workoutTypeItem}
                        >
                            <span
                                className={styles.workoutTypeEmoji}
                                aria-hidden="true"
                            >
                                {getWorkoutEmoji(type, gender)}
                            </span>

                            {capitalize(type)}
                        </span>
                    ))}
                </dd>


                {uniqueWorkoutTypes.includes('strength') && (
                    <>
                        <dt>Muscle groups</dt>

                        <dd className={styles.muscleGroups}>
                            {uniqueMuscleGroups.map((muscleGroup) => (
                                <span
                                    key={muscleGroup}
                                    className={styles.muscleBadge}
                                >
                                    {capitalize(muscleGroup)}
                                </span>
                            ))}
                        </dd>
                    </>
                )}


                {(totalDurationMinutes > 0 || totalCaloriesBurned > 0) && <div className={styles.metricContainer}>
                    {totalDurationMinutes > 0 && (
                        <div className={styles.durationContainer}>
                            <dt>Duration</dt>
                            <dd className={styles.duration}>
                                {formatWorkoutDuration(totalDurationMinutes)}
                            </dd>
                        </div>
                    )}
                    {totalCaloriesBurned > 0 && (
                        <div className={styles.caloriesContainer} >
                            <dt>Calories</dt>
                            <dd>-{totalCaloriesBurned} kcal</dd>
                        </div>
                    )}
                </div>}


                <dt>Intensity</dt>

                <dd className={styles.intensity}>
                    <span className={styles.fireRating}>
                        {[1, 2, 3, 4, 5].map((level) => (
                            <span
                                key={level}
                                aria-hidden="true"
                                className={
                                    level <= weightedIntensity
                                        ? styles.fireActive
                                        : styles.fireInactive
                                }
                            >
                                🔥
                            </span>
                        ))}
                    </span>

                    <span className={styles.intensityText}>
                        {weightedIntensity} out of 5
                    </span>
                </dd>
            </dl>

            {
                /* 
                
                <div className={styles.detailsActions}>
                }
                    <button
                        type="button"
                        className={styles.editButton}
                    >
                        Edit
                    </button>
    
                    <button
                        type="button"
                        className={styles.deleteButton}
                    >
                        Delete
                    </button>
                </div>
                */
            }
        </div>
    )}