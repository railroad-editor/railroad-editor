const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const {COGNITO_IDENTITY_ID_HEADER} = require("./constants");

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  // set header for testability
  event.headers[COGNITO_IDENTITY_ID_HEADER] = event.requestContext.identity.cognitoIdentityId
  awsServerlessExpress.proxy(server, event, context);
};
