import { Collection, Db, Document, MongoClient, ObjectId, OptionalId, WithId } from "mongodb";
import fs from 'fs';
import path from 'path';
import bcrypt from "bcrypt";
import { Actor, Movie, User } from "./types";

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(MONGODB_URI);
export const moviesCollection: Collection<WithId<Movie>> = client.db("WebDevProject").collection<WithId<Movie>>("Movies");
export const actorsCollection: Collection<WithId<Actor>> = client.db("WebDevProject").collection<WithId<Actor>>("Actors");
export const usersCollection: Collection<WithId<User>> = client.db("WebDevProject").collection<WithId<User>>("Users");

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
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
            const movieDoc = {
                ...movie,
                actors: actorIds
            }
            if (await db.collection('Movies').findOne({ title: movieDoc.title }) == null) {
                await db.collection('Movies').insertOne(movieDoc);
            }
        }
        if(await db.collection('Users').findOne({ email: 'admin@ap.be' }) == null){
            await createUser('admin@ap.be', 'admin', 'ADMIN');
        }
        if(await db.collection('Users').findOne({ email: 'user@ap.be' }) == null){
            await createUser('user@ap.be', 'user', 'USER');
        }
        console.log('Data seeded successfully');
    } catch (error) {
        console.error(error);
    }
}

async function createUser(email: string, password: string, role: "ADMIN" | "USER"){
    try {
        const db = client.db("WebDevProject");
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            email: email,
            password: hashedPassword,
            role: role
        }
        return await db.collection('Users').insertOne(user);
    }
    catch (error) {
        console.error(error);
    }
}

export async function login(email: string, password: string){
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user : User | null = await usersCollection.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function getMovies() {
    return await moviesCollection.find().toArray();
} 

export async function getMovieByTitle(title: string) {
    return await moviesCollection.findOne({ title: title });
}

export async function getActors() {
    return await actorsCollection.find().toArray();
}

export async function getActorById(ObjectId: ObjectId) {
    return await actorsCollection.findOne({ _id: ObjectId });
}