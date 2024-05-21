import { Actor } from "./actor";
import { Rating } from "./rating";

export interface Movie {
  title: string;
  year: string;
  released: string;
  runtime: string;
  genre: string[];
  director: string;
  writer: string;
  actors: Actor[];
  plot: string;
  language: string[];
  country: string[];
  awards: string;
  poster: string;
  ratings: Rating[]
  type: string;
  production: string;
}