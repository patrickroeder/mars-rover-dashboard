require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

// your API calls

app.get('/manifest/:roverName', async (req, res) => {
    try {
        const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        // we want to return the manifest without the photo object array
        delete manifest.photo_manifest.photos;
        console.log(manifest.photo_manifest);
        res.send(manifest.photo_manifest);
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/photos/:roverName/:sol', async (req, res) => {
    try {
        const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.roverName}/photos?sol=${req.params.sol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        // console.log(photos.photos);
        res.send(photos.photos);
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));