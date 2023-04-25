const express = require('express');
const fs = require('fs/promises');
const app = express();

app.use(express.json());

app.get('/owners/:id', (req, res) => {
    fs.readFile(`./data/owners/o${req.params.id}.json`, 'utf8').then((data) => {
        const parsedData = JSON.parse(data);
        res.send({ owner: parsedData })        
    })
})  
app.get('/owners', (req, res) => {
    const ownersArr = [];
    fs.readdir('./data/owners').then((data) => {
        data.forEach((owner) => {
            fs.readFile(`./data/owners/${owner}`).then((ownerData) => {
                const parsedData = JSON.parse(ownerData);
                ownersArr.push(parsedData);
                if (ownersArr.length === data.length) {
                    res.send({ owners: ownersArr })
                }
            })
        })
    })
})
app.get('/owners/:id/pets', (req, res) => {
    const petsArr = [];
    fs.readdir('./data/pets').then((files) => {
        files.forEach((pet) => {
            fs.readFile(`./data/pets/${pet}`).then((petData) => {
                const parsedPetData = JSON.parse(petData);
                petsArr.push(parsedPetData);
                if (petsArr.length === files.length) {
                    const filteredPets = petsArr.filter((pet) => {
                        return pet.owner === `o${req.params.id}`
                    })
                    res.send({ pets: filteredPets })
                }
            })
        })
    })
})


app.listen(9090, () => console.log('App listening on port 9090!'));