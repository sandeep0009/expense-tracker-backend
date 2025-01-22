

declare global {
    namespace Express {
        export interface Request {
            userId?: string;
        }
    }
}


export interface JwtPayload{
   id:string
}

export {}
