import { Router } from "express";
import { Actor, Movie } from "../types";
import { getActorById, getActorByName, getActors, getMovieByTitle, getMovies } from "../database";
import { ObjectId, WithId } from "mongodb";

export function DashboardRouter(){
  const router = Router();

  router.get("/", (req, res) => {
    const username = req.session.user?.username;
    res.render("index", {
      activePage: 'home',
      username: username
    });
});

  router.get("/movies", async (req, res) => {
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
  
  router.get("/movies/:title", async (req, res) => {
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
  
  
  
  // Actors
  
  router.get("/actors", async (req, res) => {
    const sortField = req.query.sortField ?? '';
    const sortDirection = req.query.sortDirection ?? '';
    const search = req.query.q ?? '';
    let actors: Actor[] = await getActors();
    if(search){
      const searchRegex = new RegExp(search as string, 'i');
      actors = actors.filter(actor => {
        return searchRegex.test(actor.name);
      });
    }
    actors.sort((a, b) => {
      let key = sortField as keyof Actor;
        if (a[key] > b[key]) return sortDirection === 'asc' ? 1 : -1;
        if (a[key] < b[key]) return sortDirection === 'asc' ? -1 : 1;
      return 0;
    });
    res.render("actors", {
      actors: actors,
      activePage: 'actors',
      sortDirection: sortDirection,
      sortField: sortField,
      search: search
    });
  });
  
  router.get("/actors/:name", async (req, res) => {
    let name = req.params.name;
    const actor: Actor | null = await getActorByName(name);
    if (actor === null) {
      res.status(404).send('Actor not found');
    } else {
      res.render("actor", {
        actor: actor,
        activePage: 'actors',
      });
    }
  });

  return router;
}
