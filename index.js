// to run this on postman, insert this command
// - npm run start // not npm run dev. we need to use nodemon
import { handleSignIn, handleRegister } from './controllers/logIns.js'
import { getProfile, updateUserRank, getoutput } from './controllers/appUtilities.js'
import knex from 'knex'
import bcrypt from 'bcrypt-nodejs'

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

export const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const path = event.path;

  if (httpMethod === 'POST') {
    if (path === '/signin') {
      // Parse request body
      const req = { body: JSON.parse(event.body || '{}') };
      let statusCode = 200;
      let responseBody;
      await handleSignIn(req, {
        status: (code) => { statusCode = code; return { json: (body) => { responseBody = body; } } },
        json: (body) => { responseBody = body; }
      }, db, bcrypt);
      return {
        statusCode,
        body: JSON.stringify(responseBody),
      };
    } else if (path === '/register') {
      const req = { body: JSON.parse(event.body || '{}') };
      let statusCode = 200;
      let responseBody;
      await handleRegister(req, {
        status: (code) => { statusCode = code; return { json: (body) => { responseBody = body; } } },
        json: (body) => { responseBody = body; }
      }, db, bcrypt);
      return {
        statusCode,
        body: JSON.stringify(responseBody),
      };
    } else if (path === '/promptingClarifai') {
      const req = { body: JSON.parse(event.body || '{}') };
      let statusCode = 200;
      let responseBody;
      await getoutput(req, {
        status: (code) => { statusCode = code; return { json: (body) => { responseBody = body; } } },
        json: (body) => { responseBody = body; }
      });
      return {
        statusCode,
        body: JSON.stringify(responseBody),
      };
    }
  } else if (httpMethod === 'GET') {
    if (path.startsWith('/profile/')) {
      const id = path.split('/')[2];
      const req = { params: { id } };
      let statusCode = 200;
      let responseBody;
      await getProfile(req, {
        status: (code) => { statusCode = code; return { json: (body) => { responseBody = body; } } },
        json: (body) => { responseBody = body; }
      }, db);
      return {
        statusCode,
        body: JSON.stringify(responseBody),
      };
    } else if (path === '/testing') {
      return {
        statusCode: 200,
        body: JSON.stringify('AWS testing successful'),
      };
    }
  } else if (httpMethod === 'PUT') {
    if (path === '/image') {
      const req = { body: JSON.parse(event.body || '{}') };
      let statusCode = 200;
      let responseBody;
      await updateUserRank(req, {
        status: (code) => { statusCode = code; return { json: (body) => { responseBody = body; } } },
        json: (body) => { responseBody = body; }
      }, db);
      return {
        statusCode,
        body: JSON.stringify(responseBody),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not Found' }),
  };
};