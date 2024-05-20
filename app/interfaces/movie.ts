import { Actor } from "./actor";
import { Rating } from "./rating";

export interface Movie {
  id: string;
  title: string;
  year: string;
  released: string;
  runtime: string;
  genre: string[];
  director: string;
  writer: string;
  actors: string | string[];
  plot: string;
  language: string | string[];
  country: string | string[];
  awards: string;
  poster: string;
  ratings: Rating[]
  type: string;
  production: string;
}