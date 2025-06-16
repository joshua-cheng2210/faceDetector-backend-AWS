import { Request, Response } from 'express';
import { Knex } from 'knex';
import { 
  User, 
  UserLogin, 
  SignInRequestBody, 
  RegisterRequestBody 
} from '../types/index.js';

export const handleSignIn = (req: Request, res: Response, db: Knex, bcrypt: any): void => {
    // console.log("req.body", req.body);
    const { email, password }: SignInRequestBody = req.body;
    if (req.body.email === "" || req.body.password === "") {
        res.status(400).json("failed to login with appropriate info");
        return;
    }
    
    db.select("email", "hash").from<UserLogin>("login").where(
        "email", "=", email
    ).then((data: UserLogin[]) => {
        // console.log(data)
        const isValid: boolean = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            db.select("*").from<User>("users").where("email", "=", email).then((user: User[]) => {
                res.json(user[0]);
            }).catch(() => {
                res.status(400).json("login failed");
            });
        } else {
            res.status(400).json("login failed");
        }
    }).catch(() => {
        res.status(400).json("login failed");
    });
};

export const handleRegister = (req: Request, res: Response, db: Knex, bcrypt: any): void => {
    // console.log("/register --> req.body", req.body)
    const { email, name, password }: RegisterRequestBody = req.body;
    if (email === "" || password === "") {
        res.status(400).json("unable to register");
        return;
    }

    const hash: string = bcrypt.hashSync(password);
    db.transaction((trx: Knex.Transaction) => {
        trx.insert({
            hash: hash,
            email: email
        }).into("login").returning("email").then((loginEmail: { email: string }[]) => {
            return trx("users").returning('*').insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            }).then((response: User[]) => {
                res.json(response[0]);
            }).catch(() => {
                res.status(400).json("unable to register");
            });
        }).then(trx.commit).catch(() => {
            trx.rollback();
            res.status(400).json("unable to register");
        });
    });
};
