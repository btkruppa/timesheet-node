import aws from 'aws-sdk';
import { ConfigurationOptions } from 'aws-sdk/lib/config';
import { Movie } from '../model/Movie';

const awsConfig: ConfigurationOptions = {
  region: 'us-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
aws.config.update(awsConfig);

const dynamodb = new aws.DynamoDB();
const docClient = new aws.DynamoDB.DocumentClient();

export function createMovieTable() {
  const params = {
    TableName: 'Movies',
    KeySchema: [
      { AttributeName: 'year', KeyType: 'HASH' },
      { AttributeName: 'title', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'year', AttributeType: 'N' },
      { AttributeName: 'title', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };

  dynamodb.createTable(params, function (err, data) {
    if (err) {
      console.log(`Unable to create table: \n ${JSON.stringify(err, undefined, 2)}`);
    } else {
      console.log(`Created table: \n ${JSON.stringify(data, undefined, 2)}`);
    }
  });
}

export function deleteMovies() {
  const params = {
    TableName: 'Movies'
  };

  dynamodb.deleteTable(params, function (err, data) {
    if (err) {
      console.log(`Unable to delete table: \n ${JSON.stringify(err, undefined, 2)}`);
    } else {
      console.log('Table deleted.');
    }
  });
}

export function listTables() {
  const params = {};
  dynamodb.listTables(params, function (err, data) {
    if (err) {
      console.log(`Unable to list tables: ' \n ${JSON.stringify(err, undefined, 2)}`);
    }
    else {
      console.log(`List of tables: \n ${JSON.stringify(data, undefined, 2)}`);
    }
  });
}

export function saveMovie(movie: Movie): Promise<any> {
  const params = {
    TableName: 'Movies',
    Item: movie
  };
  return docClient.put(params).promise();
}

export function findByYearAndTitle(year: number, title: string): Promise<any> {
  const table = 'Movies';

  const params = {
    TableName: table,
    Key: {
      'year': year,
      'title': title
    }
  };
  return docClient.get(params).promise();
}

export function updateMovie(movie: Movie): Promise<any> {
  const table = 'Movies';

  const params = {
    TableName: table,
    Key: {
      'year': movie.year,
      'title': movie.title
    },
    UpdateExpression: 'set info.rating = :r, info.plot=:p',
    ExpressionAttributeValues: {
      ':r': movie.info.rating,
      ':p': movie.info.plot
    },
    ReturnValues: 'UPDATED_NEW'
  };

  return docClient.update(params).promise();
}

export function deleteMovie() {
  const table = 'Movies';
  const year = 2015;
  const title = 'The Big New Movie';

  const params = {
    TableName: table,
    Key: {
      'year': year,
      'title': title
    }
  };
  docClient.delete(params, function (err, data) {
    if (err) {
      console.log(`Unable to delete item: \n ${JSON.stringify(err, undefined, 2)}`);
    } else {
      console.log(`DeleteItem succeeded: \n ${JSON.stringify(data, undefined, 2)}`);
    }
  });
}

export function findAllByYear(year: number): Promise<any> {
  console.log(`Querying for movies from ${year}.`);

  const params = {
    TableName: 'Movies',
    KeyConditionExpression: '#yr = :yyyy',
    ExpressionAttributeNames: {
      '#yr': 'year'
    },
    ExpressionAttributeValues: {
      ':yyyy': year
    }
  };

  return docClient.query(params).promise(); // Most of the time we will want to do it this way
}


export let findAllByYearBetween = (startYear: number, endYear: number) => {
  console.log(`Scanning for movies between ${startYear} and ${endYear}`);

  const params: any = {
    TableName: 'Movies',
    ProjectionExpression: '#yr, title, info.rating',
    FilterExpression: '#yr between :start_yr and :end_yr',
    ExpressionAttributeNames: {
      '#yr': 'year'
    },
    ExpressionAttributeValues: {
      ':start_yr': 1950,
      ':end_yr': 2015
    },
  };

  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.log(`Unable to scan the table: \n ${JSON.stringify(err, undefined, 2)}`);
    } else {
      // Print all the movies
      console.log('Scan succeeded: ');
      data.Items.forEach(function (movie: any) {
        console.log(movie);
        if (!movie.info) {
          console.log(movie);
        }
      });

      if (data.LastEvaluatedKey) {
        // Continue scanning if we have more movies (per scan 1MB limitation)
        console.log('Scanning for more...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }

    }
  }
};
