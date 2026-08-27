import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { createWorkoutSchema } from '../validation/workout.validation.js';


const router = Router();

router.post(
    '/',
    requireAuth,
    async (req, res, next) => {
        try {
            const result = createWorkoutSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: 'Invalid workout data',
                    errors: result.error.flatten()
                })
            }

            const { date, workouts } = result.data;
            const userId = req.session.userId;

            const workoutSession = await prisma.workoutSession.create({
                data: {
                    date: new Date(`${date}T00:00:00.000Z`),
                    userId,
                    entries: {
                        create:
                            workouts.map(workout => ({
                                type: workout.type,
                                durationMinutes: workout.durationMinutes,
                                distanceKm: workout.distanceKm,
                                paceSecondsPerKm: workout.paceSecondsPerKm,
                                averageSpeedKmh: workout.averageSpeedKmh,
                                intensity: workout.intensity,
                                muscleGroups: workout.muscleGroups ?? []
                            }))
                    }
                },
                include: {
                    entries: true
                }
            });

            return res.status(201).json({
                message: 'Workout created successfully',
                workout: {
                    id: workoutSession.id,
                    date,
                    createdAt: workoutSession.createdAt,
                    workouts: workoutSession.entries
                }
            })

        } catch (error) {
            next(error)
        }
    }
)




router.get('/', requireAuth, async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const workoutSessions = await prisma.workoutSession.findMany({
            where: {
                userId
            },
            include: {
                entries: true
            },
            orderBy: {
                date: 'asc'
            }
        });

        const formattedWorkouts=workoutSessions.map(
            session=>({
                id: session.id,
                date: session.date.toISOString().slice(0,10),
                createdAt:session.createdAt,
                workouts: session.entries
            })
        );

        return res.status(200).json({
            workouts:formattedWorkouts
        });


    } catch (error) {
        next(error)
    }
})


export default router;