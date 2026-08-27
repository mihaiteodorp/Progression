import { Prisma } from "../../generated/prisma/client.ts";

export function errorHandler(err, req,res,next){
    console.error(err);

    if(err instanceof Prisma.PrismaClientKnownRequestError && err.code==='P2002'){
        return res.status(409).json({
            message:'Unable to create account with these details'
        });
    };


    return res.status(500).json({
        message: "Something went wrong"
    })
}