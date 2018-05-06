export class Movie {
  title: string;
  year: number;
  info: {
    plot: string;
    rating: number;
  };

  constructor(title: string, year: number, plot: string, rating: number) {
    this.title = title;
    this.year = year;
    this.info = {
      plot: plot,
      rating: rating
    };
  }
}