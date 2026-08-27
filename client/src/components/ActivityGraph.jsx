import { useState } from 'react';
import styles from './ActivityGraph.module.css';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

function getStartOfWeek(startDate) {
    const newStartDate = new Date(startDate);

    const day = (newStartDate.getDay() + 6) % 7;

    newStartDate.setDate(newStartDate.getDate() - day);

    return newStartDate;
}

function getEndOfWeek(endDate) {
    const newEndDate = new Date(endDate);

    const day = (newEndDate.getDay() + 6) % 7;

    newEndDate.setDate(newEndDate.getDate() + 6 - day);

    return newEndDate;
}

function generateDates(date) {
    const endDate = new Date(date);
    endDate.setHours(0, 0, 0, 0);

    const newEndDate = getEndOfWeek(endDate);

    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const newStartDate = getStartOfWeek(startDate);

    const daysOfYear = [];
    const current = new Date(newStartDate);

    while (current <= newEndDate) {
        daysOfYear.push(new Date(current));

        current.setDate(current.getDate() + 1);
    }

    return daysOfYear;
}

function generateWeeks(daysArray) {
    const weeksArray = [];

    for (let i = 0; i < daysArray.length; i += 7) {
        const oneWeek = [];

        for (let j = 0; j < 7; j++) {
            if (daysArray[i + j] !== undefined) {
                oneWeek.push(daysArray[i + j]);
            }
        }

        weeksArray.push(oneWeek);
    }

    return weeksArray;
}

function formatDate(date) {
    const formattedDate =
        String(date.getFullYear()) +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0');

    return formattedDate;
}

export default function ActivityGraph({
    workoutSessions,
    handleWorkoutSelection,
    selectedDate
}) {


    const days = generateDates(new Date());
    const weeks = generateWeeks(days);

    const gridColumns = ['var(--label-width)'];
    const weekLayouts = [];

    let currentColumn = 2;

    weeks.forEach((week, weekIndex) => {
        const monthStartIndex = week.findIndex(
            (day) => day.getDate() === 1
        );

        if (weekIndex !== 0 && monthStartIndex === 0) {
            gridColumns.push('var(--month-gap)');
            currentColumn += 1;
        }

        if (monthStartIndex > 0) {
            const beforeMonthColumn = currentColumn;

            gridColumns.push('var(--cell-size)');
            currentColumn += 1;

            gridColumns.push('var(--month-gap)');
            currentColumn += 1;

            const afterMonthColumn = currentColumn;

            gridColumns.push('var(--cell-size)');
            currentColumn += 1;

            weekLayouts.push({
                monthStartIndex,
                beforeMonthColumn,
                afterMonthColumn
            });

            return;
        }

        const weekColumn = currentColumn;

        gridColumns.push('var(--cell-size)');
        currentColumn += 1;

        weekLayouts.push({
            monthStartIndex,
            beforeMonthColumn: weekColumn,
            afterMonthColumn: weekColumn
        });
    });

    function getDayColumn(weekIndex, dayIndex) {
        const layout = weekLayouts[weekIndex];

        if (
            layout.monthStartIndex > 0 &&
            dayIndex >= layout.monthStartIndex
        ) {
            return layout.afterMonthColumn;
        }

        return layout.beforeMonthColumn;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstVisibleDate = new Date(today);
    firstVisibleDate.setDate(firstVisibleDate.getDate() - 364);

    const monthRanges = [];

    weeks.forEach((week, weekIndex) => {
        week.forEach((day, dayIndex) => {
            if (day < firstVisibleDate || day > today) {
                return;
            }

            const column = getDayColumn(weekIndex, dayIndex);

            const monthKey =
                `${day.getFullYear()}-${day.getMonth()}`;

            const existingMonth = monthRanges.find(
                (month) => month.key === monthKey
            );

            if (existingMonth) {
                existingMonth.startColumn = Math.min(
                    existingMonth.startColumn,
                    column
                );

                existingMonth.endColumn = Math.max(
                    existingMonth.endColumn,
                    column
                );

                return;
            }

            monthRanges.push({
                key: monthKey,
                month: day.getMonth(),
                startColumn: column,
                endColumn: column
            });
        });
    });

    return (
        <section
            className={styles['activity-graph-container']}
            style={{
                gridTemplateColumns: gridColumns.join(' ')
            }}
        >
            {monthRanges.map((month) => (
                <div
                    className={styles['month-label']}
                    key={month.key}
                    style={{
                        gridColumn:
                            `${month.startColumn} / ${month.endColumn + 1}`,
                        gridRow: 1
                    }}
                >
                    {MONTHS[month.month]}
                </div>
            ))}

            {WEEK_DAYS.map((day, dayIndex) => {
                if (dayIndex % 2 === 1) {
                    return null;
                }

                return (
                    <div
                        className={styles['weekday-label']}
                        key={day}
                        style={{
                            gridColumn: 1,
                            gridRow: dayIndex + 2
                        }}
                    >
                        {day}
                    </div>
                );
            })}

            {weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                    const formattedDate = formatDate(day);
                    console.log('workoutSessions inside ActivityGraph:', workoutSessions);
                    const workoutSessionForDay = workoutSessions.find((session) => {
                        return session.date === formattedDate;
                    });

                    const intensity=workoutSessionForDay 
                        ? workoutSessionForDay.workouts.reduce((maxIntensity,workout)=>{
                        if(workout.intensity>maxIntensity){
                            return workout.intensity;
                        }
                        return maxIntensity;
                    },0) : 0;


                    const isOutOfRange =
                        day < firstVisibleDate || day > today;

                    if (isOutOfRange) {
                        return null;
                    }

                    const isSelected =
                        selectedDate === formattedDate;

                    return (
                        <button
                            type="button"
                            className={
                                styles['day-cell'] +
                                ' ' +
                                styles[`intensity-${intensity}`] +
                                (
                                    isSelected
                                        ? ' ' + styles['day-cell-selected']
                                        : ''
                                )
                            }
                            key={day.getTime()}
                            title={day.toDateString()}
                            aria-label={`View workout for ${day.toDateString()}`}
                            aria-pressed={isSelected}
                            style={{
                                gridColumn: getDayColumn(
                                    weekIndex,
                                    dayIndex
                                ),
                                gridRow: dayIndex + 2
                            }}
                            onClick={() => {
                                
                                handleWorkoutSelection(day);
                            }}
                        />
                    );
                })
            )}
        </section>
    );
}