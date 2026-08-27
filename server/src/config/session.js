import session from "express-session";
import connectPgSimple from 'connect-pg-simple';

const PgSession=connectPgSimple(session);

const sessionStore=new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing:true,

});

export const sessionMiddleware=session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        sameSite:"lax",
        secure:false,
        maxAge:1000*60*60*24*7,
        
    }
})