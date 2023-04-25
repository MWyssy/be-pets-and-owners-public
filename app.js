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

app.get('/pets', (req, res) => {
    const petsArr = [];
    console.log(req.query)
    const q = req.query
    const qk= Object.keys(q)
    const qv=Object.values(q)
    console.log(qk)
    console.log(qv)
    
    fs.readdir('./data/pets').then((data) => {
        data.forEach((pets) => {
            fs.readFile(`./data/pets/${pets}`).then((petsData) => {
                const parsedData = JSON.parse(petsData);
                petsArr.push(parsedData);
                if (petsArr.length === data.length) {
                    //console.log(petsArr)
                    if(Object.keys(q).length>0){
                        const filterPets=petsArr.filter((pet)=>{                            
                            return qk.every(key=>{
                                return q[key]===pet[key]
                            })
                        })

                        
                        res.send({pets:filterPets})
                    }
                    res.send({ pets: petsArr })
                }
            })
        })
    })
})






app.listen(9090, () => console.log('App listening on port 9090!'));