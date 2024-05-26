import express from "express";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import { connect, getActorById, getActors, getMovieByTitle, getMovies, login } from "./database";
import "dotenv/config";
import { ObjectId, WithId } from "mongodb";
import { Actor, Movie, User } from "./types";
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 10);
});

const app = express();

app.use(connectLiveReload());
app.use(session);

app.set("view engine", "ejs");
app.set("port", 3000);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", secureMiddleware, (req, res) => {
    res.render("index", {
      activePage: 'home'
    });
});

app.get("/login", (req, res) => {
  if(req.session.user){
    res.redirect("/");
  } else res.render("login");
});

app.post("/login", async(req, res) => {
  const email : string = req.body.email;
  const password : string = req.body.password;
  try {
    let user : User = await login(email, password);
    user = { ...user, password: '' }; // Remove password from user object
    req.session.user = user;
    res.redirect("/")
  } catch (e : any) {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});


app.get("/movies", secureMiddleware, async (req, res) => {
  const sortField = req.query.sortField ?? '';
  const sortDirection = req.query.sortDirection ?? '';
  const search = req.query.q ?? '';
  let movies: Movie[] = await getMovies();
  if(search){
    const searchRegex = new RegExp(search as string, 'i');
    movies = movies.filter(movie => {
      return searchRegex.test(movie.title);
    });
  }
  movies.sort((a, b) => {
    let key = sortField as keyof Movie;
      if (a[key] > b[key]) return sortDirection === 'asc' ? 1 : -1;
      if (a[key] < b[key]) return sortDirection === 'asc' ? -1 : 1;
    return 0;
  });
  res.render("movies", {
    movies: movies,
    activePage: 'movies',
    sortDirection: sortDirection,
    sortField: sortField,
    search: search
  });
});

app.get("/movies/new", secureMiddleware, async (req, res) => {
  res.render("newMovie");
});

app.get("/movies/:title", secureMiddleware, async (req, res) => {
  let title = req.params.title;
  const movie: WithId<Movie> | null = await getMovieByTitle(title);
  if (movie === null) {
    // Handle the case where no movie is found
    res.status(404).send('Movie not found');
  } else {
    const ids = movie.actors.map((actor: ObjectId) => {
      return actor;
    });
    const actorsPromises = ids.map(async (id) => {
      const actor = await getActorById(id);
      return actor;
    });
    const actors = await Promise.all(actorsPromises);
    res.render("movie", {
      movie: movie,
      actors: actors,
      activePage: 'movies',
    });
  }
});





app.get("/actors", secureMiddleware, async (req, res) => {
  const actors: Actor[] = await getActors();
  res.render("actors", {
    actors: actors,
    activePage: 'actors'
  });
});

app.get("/actors/new", secureMiddleware, async (req, res) => {
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
  try{
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
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