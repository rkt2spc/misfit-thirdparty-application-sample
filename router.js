// Dependencies (Please Ignore)
const requestSender = require('request');
const express = require('express');
const router = express.Router();

// API List
// GET  /misfit-login
// GET  /misfit-callback
// POST /misfit-notification

// Endpoint: GET /misfit-login
// Redirect user to Misfit where Misfit ask user if they agree to share 
// their information stored on Misfit with your Application.
router.get('/misfit-login', (request, response, next) => {
  let url = Config.misfit.authorize_url;
  url += '?response_type=code' + '&';
  url += 'client_id=' + Config.misfit.client_id + '&';
  url += 'redirect_uri=' + Config.misfit.redirect_uri + '&';
  url += 'scope=public,birthday,email';

  // HTTP 302 redirect
  response.redirect(url);
});

// Endpoint: GET /misfit-callback
// Misfit redirect user here with an authorization code in query parameter
// if the login after "misfit-login" happen smoothly.
router.get('/misfit-callback', (request, response, next) => {
  // Send a post request to misfit token endpoint
  // to exchange given authorization code for user access token
  requestSender.post({
    url: Config.misfit.token_url,
    json: true,
    body: {
      grant_type: 'authorization_code',
      client_id: Config.misfit.client_id,
      client_secret: Config.misfit.client_secret,
      redirect_uri: Config.misfit.redirect_uri,
      code: request.query.code // Authorization Code returned by Misfit
    },
  }, (err, result) => {
    if (err) return next(err);

    // Result body contain user access token, you should do something else rather than response it
    response.status(200).json(result.body);
  });
});

// Endpoint: POST /misfit-notification
// After user have agreed to share their information stored on Misfit with your Application
// Enabling Resource Notification on our Developer Portal https://build.misfit.com will make
// us send you notifications on user's resources changes to this endpoint.
// Note that in order for Misfit to send you notifications, this endpoint has to be reachable
// from the internet, that means we can't send notifications to your local machine at
// http://localhost/misfit-notification you'll need an actual server behind the valid domain
// you verified on our Developer Portal to see this work
router.post('/misfit-notification', (request, response, next) => {
  // Request body is sent with Content-Type text/plain
  // although it actually JSON, this application was
  // configured to understand text/plain but you still
  // have to manually parse request body
  const message = JSON.parse(request.body); // Text -> Json
  console.log(message); // In case you need to see what it looks like

  // Message Type is used to distinguish 
  // between SubscriptionConfirmation and actual Notification
  if (message.Type === 'SubscriptionConfirmation') {
    // Send Confirmation Message
    console.log(">>> Confirming subscription at " + message.SubscribeURL);
    requestSender.get({
      url: message.SubscribeURL, // Visit SubscribeURL to confirm Subscription
    }, (err, result) => {
      if (err) return next(err);
      
      // Confirmation Success
      console.log(body);
      return response.status(200).end();
    });
  }
  // Normal user data notifications
  else {
    // Message contain information about user resource changes
    // You should use this info and find the appropriate user access_token
    // given at "misfit-callback". With the access_token, you then
    // retrieve updated user information using our open api
    // documented here https://build.misfit.com/docs/cloudapi/get_started
    console.log(message);
    response.status(200).end();
  }
});

// Export the router so we can use it in server.js
module.exports = router;