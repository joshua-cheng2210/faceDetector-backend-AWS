import { Request, Response } from 'express';
import { Knex } from 'knex';

// User interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  entries: number;
  joined: Date;
}

export interface UserLogin {
  id: number;
  hash: string;
  email: string;
}

// Request body interfaces
export interface SignInRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ImageRequestBody {
  id: number;
}

export interface ClarifaiRequestBody {
  imgURL: string;
}

// Custom request interfaces
export interface AuthRequest extends Request {
  body: SignInRequestBody | RegisterRequestBody;
}

export interface ImageRequest extends Request {
  body: ImageRequestBody;
}

export interface ClarifaiRequest extends Request {
  body: ClarifaiRequestBody;
}

// Handler function types
export type AuthHandler = (req: Request, res: Response, db: Knex, bcrypt: any) => void;
export type ProfileHandler = (req: Request, res: Response, db: Knex) => void;
export type ImageHandler = (req: Request, res: Response, db: Knex) => void;
export type ClarifaiHandler = (req: Request, res: Response) => void;

// Clarifai API types
export interface ClarifaiRequestOptions {
  method: string;
  headers: {
    Accept: string;
    Authorization: string;
  };
  body: string;
}

export interface ClarifaiApiResponse {
  status: {
    code: number;
  };
  outputs: Array<{
    data: {
      regions: Array<{
        region_info: any;
        data: any;
      }>;
    };
  }>;
}
