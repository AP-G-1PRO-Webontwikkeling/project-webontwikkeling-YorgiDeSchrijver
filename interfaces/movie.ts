import { Actor } from "./actor";
import { Rating } from "./rating";

export interface Movie {
  id: number;
  title: string;
  year: number;
  released: Date;
  genre: string[];
  director: string;
  writer: string;
  actors: Actor[];
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: Rating[];
  type: string;
  production: string;
}