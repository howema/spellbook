const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { mongoURI } = require('./config.json');

const app = express();

app.set('view engine', 'ejs'); // insert before any app.use, app.get, app.post methods
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to database!');

    const db = client.db('spellbook');
    const customSpellCollection = db.collection('custom-spells');
    
    // ====== CREATE
    app.post('/custom-spells', (req, res) => {
      customSpellCollection.insertOne(req.body)
        .then(result => {
          res.redirect('/');
        })
        .catch(error => console.error(error));
    });

    // ====== READ
    app.get('/', (req, res) => {
      customSpellCollection.find().toArray()
        .then(results => {
          res.render('index.ejs', { customSpells: results })
        })
        .catch(error => console.error(error));
    });

    // ====== UPDATE
    app.put('/custom-spells', (req, res) => {
      customSpellCollection.findOneAndUpdate(
        { name: { $regex: /^((?!Magic Missile).)*$/ } },
        {
          $set: {
            name: req.body.name,
            desc: req.body.desc
          }
        },
        {
          upsert: true
        }
      )
        .then(result => {
          res.json('Success!');
        })
        .catch(error => console.error(error));
    });

    // ====== DELETE
    app.delete('/custom-spells', (req, res) => {
      customSpellCollection.deleteOne(
        { name: req.body.name }
      )
        .then(result => {
          if (result.deletedCount === 0) {
            return res.json('No spell to delete');
          }
          res.json('Deleted magic missile spell');
        })
        .catch(error => console.error(error));
    });
    
    app.listen(3000, () => {
      console.log('Listening on port 3000!');
    });
  })
  .catch(error => console.error(error));