
import { Router } from "express";
import { registerSchema, loginSchema } from "../validation/auth.validation.js";
import prisma from "../lib/prisma.js";
import argon2 from 'argon2';

import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post('/register', async (req, res) => {

    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid registration data",
            errors: result.error.flatten().fieldErrors
        })
    }

    const { firstName, lastName, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });


    if (existingUser) {
        return res.status(409).json({
            message: "Unable to create account with these details"
        })
    };

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,

    });

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            passwordHash

        }
    });

    await new Promise( (resolve, reject)=>{
        req.session.regenerate(err=>{
            if(err){
                return reject(err)
            }
            resolve();
        })
    });

    req.session.userId=user.id;

    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt
        }
    })

})

router.post('/login', async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid login data",
            errors: result.error.flatten().fieldErrors
        })
    };

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        return res.status(401).json({
            message: 'Invalid email or password'
        })
    };

    const passwordMatches = await argon2.verify(user.passwordHash, password);

    if (!passwordMatches) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    };

    await new Promise((resolve, reject) => {
        req.session.regenerate(err => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })

    req.session.userId = user.id;

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,

        }
    })
})


router.get('/me', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({
            message: 'Not authenticated'
        })
    };
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) {
        return res.status(401).json({
            message: 'Not authenticated'
        });
    };

    return res.status(200).json({
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt
        }
    })
})

router.post("/logout", async (req, res) => {
    await new Promise((resolve, reject) => {
        req.session.destroy(err => {
            if (err) {
                return reject(err)
            }
        });

        resolve();

    });
    res.clearCookie("connect.sid");

    return res.status(200).json({
        message: 'Logout successful'
    })

})





export default router;