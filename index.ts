import express from "express";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import path from "path";
import movieData from "./movies.json";
import actorData from "./actors.json";
import { Movie } from "./app/interfaces/movie";
import { Actor } from "./app/interfaces/actor";
import { connect, getActors, getMovieByTitle, getMovies } from "./database";
import "dotenv/config";
import { WithId } from "mongodb";

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});


const app = express();

app.use(connectLiveReload());

app.set("view engine", "ejs");
app.set("port", 3000);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  const movies: Movie[] = []
  res.render("index", {
    movies: movies
  });
});

app.get("/movies", async (req, res) => {
  const movies: Movie[] = await getMovies();
  res.render("index", {
    movies: movies
  });
});

app.get("/movies/:title", async (req, res) => {
  let title = req.params.title;
  const movie: WithId<Movie> | null = await getMovieByTitle(title);
  if (movie === null) {
    // Handle the case where no movie is found
    res.status(404).send('Movie not found');
  } else {
    res.render("movie", {
      movie: movie
    });
  }
});



app.get("/movies/new", async (req, res) => {
  res.render("newMovie");
});

app.get("/actors", async (req, res) => {
  const actors: Actor[] = await getActors();
  res.render("actors", {
    actors: actors
  });
});

app.get("/actors/new", async (req, res) => {
  res.render("newActor");
});

// app.get("/movie/:id", (req, res) => {
//   const movies = null;
//   res.render("index", {
//     movies: movies
//   });
// });

// app.get("/actor/:id", (req, res) => {
//   const movies: Movie[] = movieData;
//   res.render("index", {
//     movies: movies
//   });
// });






app.listen(app.get("port"), async () => {
  await connect();
  console.log( "[server] http://localhost:" + app.get("port"));
});

module.exports = app;

// Move to another file!!!

// import data from "./movies.json";
// import { Movie } from "./interfaces/movie";
// import * as readline from "readline-sync";

// const menuOptions: string[] = [
//   "1. View all data",
//   "2. Filter by ID",
//   "3. Exit"
// ];

// async function main(): Promise<void>{
//   let input: number = 0;
//   console.log("Welcome to the JSON data viewer!\n");
//   menuOptions.forEach(element => {
//     console.log(element);
//   });
//   console.log("\n");

//   do{
//     input = parseInt(readline.question("Please enter your choice: "));
//     switch(input){
//       case 1:
//         await getAllMovies();
//         break;
//       case 2:
//         const id = parseInt(readline.question("Please enter the ID you want to filter by: "))
//         await getMovieById(id);
//         break;
//       default:
//         break;
//     };
//   } while(input != 3);
// }

// async function getAllMovies(){
//   try{
//     const movies: Movie[] = data;
//     movies.forEach(element => {
//       console.log(`- ${element.title} (${element.id})`)
//     });
//   } catch(error){
//     console.error("Error parsing JSON data: ", error);
//   }
// }

// async function getMovieById(id: number){
//   try{
//     const movies: Movie[] = data;
//     const movie = movies.find((movie) => movie.id == id);
//     if(movie){
//       console.log(movie);
//     } else {
//       console.log('Movie not found!')
//     }
//   } catch(error){
//     console.error("Error parsing JSON data: ", error);
//   }
// }


// main()