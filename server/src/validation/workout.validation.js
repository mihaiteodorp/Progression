import * as z from 'zod';

const muscleGroupSchema = z.enum([
    'chest',
    'triceps',
    'back',
    'biceps',
    'abs',
    'shoulders',
    'legs',
    'forearms',
    'traps'
]);

const intensitySchema = z.number().int().min(0).max(5);

const strengthWorkoutSchema = z.object({
    type: z.literal('strength'),
    muscleGroups: z.array(muscleGroupSchema).min(1, 'At least one muscle group is required'),
    durationMinutes:z.number().int().positive().optional(),
    intensity: intensitySchema
});


const runningWorkoutSchema=z.object({
    type:z.literal('running'),
    durationMinutes:z.number().int().positive(),
    distanceKm: z.number().positive().optional(),
    paceSecondsPerKm:z.number().positive().optional(),
    intensity:intensitySchema
});

const cyclingWorkoutSchema=z.object({
    type:z.literal('cycling'),
    durationMinutes:z.number().int().positive(),
    distanceKm:z.number().positive().optional(),
    averageSpeedKmh:z.number().positive().optional(),
    intensity:intensitySchema
});

const walkingWorkoutSchema=z.object({
    type:z.literal('walking'),
    durationMinutes: z.number().int().positive(),
    distanceKm:z.number().positive().optional(),
    paceSecondsPerKm:z.number().positive().optional(),
    intensity:intensitySchema
});

const workoutSchema=z.discriminatedUnion(
    'type',
    [
        strengthWorkoutSchema,
        runningWorkoutSchema,
        cyclingWorkoutSchema,
        walkingWorkoutSchema
    ]
);

export const createWorkoutSchema=z.object({
    date:z.string().date(),
    workouts:z.array(workoutSchema).min(1, 'At least one workout is required'),

});


