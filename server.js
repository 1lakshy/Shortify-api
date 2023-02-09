const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { default: mongoose } = require('mongoose');
const { customAlphabet } = require('nanoid');
require('dotenv').config();

let nanoid = customAlphabet('1234567890abcdefghi', 8);
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

// mongoose connection
const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('DataBase connection successful ');
  })
  .catch((e) => {
    console.log('no connection');
  });

// model imported
const URL = require('./models/UrlSchema.js');

app.get('/', (req, res) => {
  res.json({
    message: 'Home Page',
  });
});

app.get('/urls', async (req, res, next) => {
  let urls = await URL.find({}).exec();
  res.json(urls);
});

app.post('/api/shortify', async (req, res, next) => {
  try {
    if (req.body.url) {
      let uri = await URL.findOne({ originalUrl: req.body.url }).exec();

      if (uri) {
        res.json(uri);
      } else {
        // axios validation
        const response = await axios.get(req.body.url.toString(), {
          validateStatus: (status) => {
            return status < 500;
          },
        });

        if (response.status != 404) {
          let newUrl;
          while (true) {
            let random = nanoid();
            let checkRandom = await URL.findOne({ random: random }).exec();

            if (!checkRandom) {
              newUrl = await URL.create({
                originalUrl: req.body.url,
                random: random,
              });
              // console.log(random)
              res.json({
                short: `${process.env.URL}/${newUrl.random}`,
                
              });
            }
          }
        }
      }
    } else {
      res.status(400);
      const error = new Error('URL is notDefined');
      next(error);
    }
  } catch (err) {
    next(err);
  }
});

app.get('/:random', async (req, res, next) => {
  try {
    let url = await URL.findOne({ random: req.params.random }).exec();

    if (url) {
      res.status(301);
      res.redirect(url.originalUrl);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('NOt found' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    error: {
      status: res.statusCode,
      stack: process.env.ENV === 'development' ? err.stack : undefined,
    },
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, (req, res) => {
  console.log('server started');
});
