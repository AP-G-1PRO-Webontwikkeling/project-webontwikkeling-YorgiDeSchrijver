import data from "./movies.json";
import { Movie } from "./interfaces/movie";
import * as readline from "readline-sync";

const menuOptions: string[] = [
  "1. View all data",
  "2. Filter by ID",
  "3. Exit"
];

async function main(): Promise<void>{
  let input: number = 0;
  console.log("Welcome to the JSON data viewer!\n");
  menuOptions.forEach(element => {
    console.log(element);
  });
  console.log("\n");

  do{
    input = parseInt(readline.question("Please enter your choice: "));
    switch(input){
      case 1:
        await getAllMovies();
        break;
      case 2:
        const id = parseInt(readline.question("Please enter the ID you want to filter by: "))
        await getMovieById(id);
        break;
      default:
        break;
    };
  } while(input != 3);
}

async function getAllMovies(){
  try{
    const movies: Movie[] = data;
    movies.forEach(element => {
      console.log(`- ${element.title} (${element.id})`)
    });
  } catch(error){
    console.error("Error parsing JSON data: ", error);
  }
}

async function getMovieById(id: number){
  try{
    const movies: Movie[] = data;
    const movie = movies.find((movie) => movie.id == id);
    if(movie){
      console.log(movie);
    } else {
      console.log('Movie not found!')
    }
  } catch(error){
    console.error("Error parsing JSON data: ", error);
  }
}


main()