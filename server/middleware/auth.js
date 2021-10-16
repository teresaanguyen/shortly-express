const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils');

module.exports.createSession = (req, res, next) => {
  //req promise? req.cookies -> hash then use .tap???
  // Promise.resolve(req.cookies.shortlyId);
  // .then check if hash exists
  // if no hash, throw error
  // if there is a hash
  // grab session models.sessions.get
  // use .tap?

  // // if no cookies --> req.cookies = null
  // if (req.cookies === null) {
  //   // then create new session
  //   models.Sessions.create();
  // } else if (req.cookies !== null) {
  //   // promise --> promise.resolve(req.cookies.shortlyId)
  //   models.Sessions.get(req.cookies)
  //     // then hash
  //     .then(cookies => {
  //       console.log('cookies', cookies);

  //       const hashedCookies = utils.createHash(cookies);
  //     })
  //     // then check session
  //     .then()
  //     // catch error(s)
  //     .catch();
  // }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
