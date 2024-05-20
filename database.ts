import { Collection, Document, MongoClient, OptionalId } from "mongodb";
import { Movie } from "./app/interfaces/movie";
import { Actor } from "./app/interfaces/actor";
import fs from 'fs';
import path from 'path';

export const client = new MongoClient("mongodb://localhost:27017");
export const moviesCollection: Collection<Movie> = client.db("WebDevProject").collection<Movie>("Movies");
export const actorsCollection: Collection<Actor> = client.db("WebDevProject").collection<Actor>("Actors");

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
        seed();
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}

export async function seed(){
    try {
        const data = fs.readFileSync(path.resolve(__dirname, 'movies.json'), 'utf-8');
        const movies = JSON.parse(data);
        const db = client.db("WebDevProject");
        for (const movie of movies) {
            const actorIds = await Promise.all(movie.actors.map(async (actor: OptionalId<Document>) => {
                const actorId = await db.collection('Actors').findOne({ name: actor.name });
                if(actorId == null) {
                    const { insertedId } = await db.collection('Actors').insertOne(actor);
                    return insertedId;
                }
                return actorId._id;
            }));
            delete movie.actors;
            movie.actorIds = actorIds;
            if (await db.collection('Movies').findOne({ title: movie.title }) == null) {
                await db.collection('Movies').insertOne(movie);
            }
        }
        console.log('Data seeded successfully');
    } catch (error) {
        console.error(error);
    }
}