const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookieParser = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //these have next in them
app.use(express.static(path.join(__dirname, '../public')));
// app.use(cookieParser);
// app.use(Auth.createSession);

app.get('/', //models.sessions.isLoggedIn,
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup',
  (req, res) => {
    return models.Users.get({'username': req.body.username})
      // if user does not exist then create new user
      .then((user) => {
        if (user === undefined) {
          models.Users.create({'username': req.body.username, 'password': req.body.password});
        } else {
          res.redirect('/signup');
          throw Error('Username taken');
        }
      })
      // then update session
      .then(() => {
        models.Sessions.create();
      })
      // redirect to index
      .then(() => {
        res.redirect('/');
      })
      .catch(() => {
        throw Error('Username taken');
      });
  });

app.post('/login',
  (req, res) => {
    return models.Users.get({'username': req.body.username})
      // check password and salt using model.users.compare
      .then((userInfo) => {
        console.log('attempted pw: ', req.body.password);
        console.log('hash pw: ', userInfo.password);
        // returns a boolean value (user exists?)
        var userExists = models.Users.compare(req.body.password, userInfo.password, userInfo.salt);
        if (userExists) {
          res.redirect('/');
          models.Sessions.update();
        }
      })
      // update session if user exists
      .then((doesUserExist) => {
        console.log('exists: ', doesUserExist);
        if (doesUserExist) {
          models.Sessions.update();
        // otherwise throw error
        } else {
          throw Error('Incorrect username or password');
        }
      })
      // redirect to index after successful login
      .then(() => {
        res.redirect('/');
      })
      // errors for username/password dont match
      .catch(() => {
        throw Error('Incorrect username or password');
      });
  });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
