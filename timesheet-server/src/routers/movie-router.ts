import { Request, Response, NextFunction } from 'express';
import express from 'express';
import * as movieDao from '../dao/movie-dao';

/**
 * all routers here should first have /movies
 */
export const movieRouter = express.Router(); // routers represent a subset of routes for the express application

/**
 * Find all movies for a given year
 */
movieRouter.get('/year/:year', (req: Request, res: Response) => {
  movieDao.findAllByYear(Number.parseInt(req.params.year))
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

/**
 * Find movie by year and title
 */
movieRouter.get('/year/:year/title/:title', (req: Request, res: Response) => {
  movieDao.findByYearAndTitle(Number.parseInt(req.params.year), req.params.title)
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
});

/**
 * Save the provided movie
 */
movieRouter.post('', (req: Request, res: Response) => {
  movieDao.saveMovie(req.body)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

/**
 * Update a movie
 */
movieRouter.patch('', (req: Request, res: Response) => {
  movieDao.updateMovie(req.body)
    .then((updatedMovie) => {
      console.log('updated movie');
      res.send(updatedMovie);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
