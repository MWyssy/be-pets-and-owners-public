const express = require('express');
const fs = require('fs/promises');
const app = express();

app.use(express.json());

app.get('/owners/:id', (req, res) => {
    fs.readFile(`./data/owners/o${req.params.id}.json`, 'utf8').then((data) => {
        console.log(data)
        const parsedData = JSON.parse(data);
        res.send({ owner: parsedData })        
    })
})  

app.listen(9090, () => console.log('App listening on port 9090!'));