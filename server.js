require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  next();
};
app.use(allowCrossDomain);
app.use('/', express.static('frontend'));
app.use(express.json());
app.use(express.urlencoded());

const Sequelize = require('sequelize');
const sequelize = new Sequelize('art', 'madalina', '1234', {
    dialect: "mysql",
    host: "localhost"
});

sequelize.authenticate().then(() => {
    console.log("Connected to database");
}).catch(() => {
    console.log("Unable to connect to database");
});


const ArtApi = sequelize.define('art_api', {
  date: Sequelize.STRING,
  baseimageurl: Sequelize.STRING,
  copyright: Sequelize.STRING
});


const Painting = sequelize.define('paintings', {
    name: Sequelize.STRING,
    artist: Sequelize.STRING,
    date: Sequelize.STRING,
    museum: Sequelize.STRING,
    city: Sequelize.STRING,
    country: Sequelize.STRING,
    imageurl: Sequelize.STRING
});


const Person = sequelize.define('person', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    address: Sequelize.STRING,
    phone: Sequelize.STRING,
    imageurl: Sequelize.STRING
});



app.post('/artapi', (req, res) => {
    
  const data = req.body;
   
  console.log('I got an art api');
  console.log(data);
   
   
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(function() {
        ArtApi.bulkCreate(data, {ignoreDuplicates: true})
            .then((response) => {
                console.log('Created');
                res.json({
                    date: 2020,
                    baseimageurl: "http://created"
                });
            }).catch((err) => {
                console.log(err);
                res.status(500).send('cannot create bulk art apis');
            });
    });
   
});

app.get('/artapi', (req, res) =>{
  ArtApi.findAll().then((result) =>{
      res.status(200).json();
  }).catch((err) =>{
      console.log(err);
        res.status(500).send('cannot find art apis');
  }); 
});

app.get('/createdb', (req, res) => {
    sequelize.sync({force:true}).then(() => {
        res.status(200).send('tables created');
    }).catch((err) => {
        console.log(err);
        res.status(200).send('could not create tables');
    });
});


app.post('/paintings', (req, res) => {
    Painting.create(req.body).then((result) => {
        res.status(201).json(result);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("resource not created");
    });
});

app.post('/persons', (req, res) => {
    Person.create(req.body).then((result) => {
        res.status(201).json(result);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("resource not created");
    });
});

app.get('/persons', (req, res) => {
    Person.findAll().then((results) => {
        res.status(200).json(results);
    });
});

app.get('/paintings', (req, res) => {
    Painting.findAll().then((results) => {
        res.status(200).json(results);
    });
});

app.get('/paintings/:id', (req, res) => {
    Painting.findByPk(req.params.id).then((result) => {
        if(result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('resource not found');
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('database error');
    });
});

app.get('/artapi/:id', (req, res) => {
    ArtApi.findByPk(req.params.id).then((result) => {
        if(result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('resource not found');
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('database error');
    });
});

app.put('/paintings/:id', (req, res) => {
    Painting.findByPk(req.params.id).then((painting) => {
        if(painting) {
            painting.update(req.body).then((result) => {
                res.status(201).json(result);
            }).catch((err) => {
                console.log(err);
                res.status(500).send('database error');
            });
        } else {
            res.status(404).send('resource not found');
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('database error');
    });
});

app.delete('/paintings/:id', (req, res) => {
    Painting.findByPk(req.params.id).then((painting) => {
        if(painting) {
            painting.destroy().then((result) => {
                res.status(204).send();
            }).catch((err) => {
                console.log(err);
                res.status(500).send('database error');
            });
        } else {
            res.status(404).send('resource not found');
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('database error');
    });
});

async function downloadImage(url, path){
    
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });
    
    response.data.pipe(fs.createWriteStream(path));
    
    return new Promise((resolve, reject) =>{
        response.data.on('end', () =>{
            resolve();
        });
        
        response.data.on('error', err =>{
            reject(err);
        });
    });
}

app.post('/sendmail', (req , res) =>{
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'paintings.app@gmail.com',
            pass: 'bFVeQN2cGPA3UB6'
        }
    });
    
    const url = req.body.imageurl;
    
    var filename = url.split('/').pop();

    const path1 = path.resolve(__dirname, 'images', filename + '.jpg');
    
    downloadImage(url, path1).then(function (){
            let mailOptions = {
                from: 'paintings.app@gmail.com',
                to: req.body.email,
                subject: req.body.subject,
                text: req.body.text,
                html: req.body.text + '<br /><br />Image: <img src="cid:unique@kreata.ee"/>',
                attachments: [{
                    filename: filename + '.jpg',
                    path: path1,
                    cid: 'unique@kreata.ee' //same cid value as in the html img src
                }]
            };
            
            transporter.sendMail(mailOptions, function(err, data){
                if(err){
                    console.log(err);
                }
                else{
                    console.log('Nodemailer has sent an email!');
                }
                
            });
    });
    


    res.status(200).json();
});


app.listen(process.env.PORT||8080);