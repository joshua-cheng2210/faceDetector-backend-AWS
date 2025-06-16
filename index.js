// to run this on postman, insert this command
// - npm run start // not npm run dev. we need to use nodemon
import express from 'express'
import bcrypt from 'bcrypt-nodejs'
import cors from 'cors'
import knex from 'knex'
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import serverless from 'serverless-http'; // Added for Lambda compatibility

dotenv.config();

import { handleSignIn, handleRegister } from './controllers/logIns.js'
import { getProfile, updateUserRank, getoutput } from './controllers/appUtilities.js'

const db = knex({
    client: 'pg',
    connection: {
      connectionString : process.env.RENDER_URL,
      ssl: { rejectUnauthorized: false },
      database: process.env.RENDER_DB,
      host: process.env.RENDER_HOSTNAME,
      port: process.env.RENDER_PORT,
      password: process.env.RENDER_PW,
      user: process.env.RENDER_USERNAME,
    },
});
db.migrate.latest();

const app = express()
const port = process.env.port || 3069
app.use(express.json())
app.use(cors({
    // "origin" : "http://localhost:5173"
    "origin" : "*"
}))
app.use(bodyParser.json());

// routings
app.post("/signin", (req, res) => {return handleSignIn(req, res, db, bcrypt)});
app.post("/register", (req, res) => {return handleRegister(req, res, db, bcrypt)})
app.get("/profile/:id", (req, res) => {return getProfile(req, res, db)})
app.put("/image", (req, res) => {return updateUserRank(req, res, db)})
app.post("/promptingClarifai", (req, res) => {return getoutput(req, res)})
app.get("/testing", (req, res) => {return res.json("AWS testing sucessful")})

// Export handler for AWS Lambda
serverless(app, {
  basePath: '/default/face-detector-backend'
});