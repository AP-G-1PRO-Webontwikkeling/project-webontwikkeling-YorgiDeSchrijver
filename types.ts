import { ObjectId } from "mongodb";

export interface User{
  _id?: ObjectId;
  username: string;
  password: string;
  role: "ADMIN" | "USER";
}

export interface Actor {
  name: string;
  gender: string;
  age: number;
  image: string;
}

export interface Movie {
  title: string;
  year: string;
  released: string;
  runtime: string;
  genre: string[];
  director: string;
  writer: string;
  actors: ObjectId[];
  plot: string;
  language: string[];
  country: string[];
  awards: string;
  poster: string;
  ratings: Rating[]
  type: string;
  production: string;
}

export interface Rating {
  source: string;
  value: string;
}

export interface FlashMessage {
  type: "error" | "success"
  message: string;
}