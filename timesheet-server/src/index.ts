// this will be the entry point for our application
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import * as movieDao from './dao/movie-dao';
import { Movie } from './model/Movie';
import { movieRouter } from './routers/movie-router';
import aws from 'aws-sdk';
import * as awsCognito from 'amazon-cognito-identity-js';

import fetch from 'node-fetch';

// var fetch = fetch;

// eval

// create the app object from express
const app = express();

// set the port
const port = process.env.PORT || 3000; // will use port from computers environment variables or 3000 if there is none
app.set('port', port);

// log the request being made
app.use((req, res, next) => {
  console.log(`request made with path: ${req.path} \nand type: ${req.method}`);
  next();
});

// set cors headers
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// allow static content to be served, navigating to url with nothing after / will serve index.html from public
app.use(
  express.static(path.join(__dirname, 'public'))
);

// use the body parser to convert request json
app.use(bodyParser.json());

app.get('/test', (req, res) => {
  fetch('http://api.icndb.com/jokes/random?limitTo=[nerdy,explicit]').then(succ => succ.json()).then((succ) => {
    console.log(`succ ${JSON.stringify(succ)}`);
    res.send(succ);
  }).catch((err) => {
    console.log(err);
  });
});


// login functionality
app.post('/login', (req, resp) => {
  const credentials = req.body;

  const authenticationData = {
    Username: credentials.username,
    Password: credentials.password,
  };
  const authenticationDetails = new awsCognito.AuthenticationDetails(authenticationData);
  console.log(1);
  const poolData = {
    UserPoolId: process.env.TIMESHEET_USER_POOL_ID, // Your user pool id here
    ClientId: process.env. TIMESHEET_CLIENT_ID // Your client id here
  };
  const userPool = new awsCognito.CognitoUserPool(poolData);
  console.log(2);
  const userData = {
    Username: credentials.username,
    Pool: userPool
  };
  const cognitoUser = new awsCognito.CognitoUser(userData);
  console.log(3);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      console.log('access token + ' + result.getAccessToken().getJwtToken());

      // POTENTIAL: Region needs to be set if not already set previously elsewhere.
      aws.config.region = '<region>';

      aws.config.credentials = new aws.CognitoIdentityCredentials({
        IdentityPoolId: '...', // your identity pool id here
        Logins: {
          // Change the key below according to the specific region your user pool is in.
          'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>': result.getIdToken().getJwtToken()
        }
      });

      // refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
      // AWS.config.credentials.refresh((error) => {
      //   if (error) {
      //     console.error(error);
      //   } else {
      //     // Instantiate aws sdk service objects now that the credentials have been updated.
      //     // example: var s3 = new AWS.S3();
      //     console.log('Successfully logged!');
      //   }
      // });
    },

    onFailure: function (err) {
      console.log(err.message || JSON.stringify(err));
    },

  });
});

/*********************************************************************************************
 * API Routers
 ********************************************************************************************/
app.use('/movies', movieRouter);

app.listen(port, () => {
  console.log(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
});