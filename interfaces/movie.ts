import { Actor } from "./actor";
import { Rating } from "./rating";

export interface Movie {
  id: number;
  title: string;
  year: number;
  released: string;
  genre: string[];
  director: string;
  writer: string;
  actors: string | Actor[];
  plot: string;
  language: string | string[];
  country: string | string[];
  awards: string;
  poster: string;
  ratings: Rating[]
  type: string;
  production: string;
}