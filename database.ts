import { Collection, MongoClient } from "mongodb";
import { Movie } from "./app/interfaces/movie";
import { Actor } from "./app/interfaces/actor";

export const client = new MongoClient("mongodb://localhost:27017");
export const moviesCollection: Collection<Movie> = client.db("Movies").collection<Movie>("Movies");
export const actorsCollection: Collection<Actor> = client.db("Actors").collection<Actor>("Actors");

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function getMovies() {
    return await moviesCollection.find().toArray();
} 

export async function getActors() {
    return await actorsCollection.find().toArray();
}

export async function connect() {
    try {
        await client.connect();
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}