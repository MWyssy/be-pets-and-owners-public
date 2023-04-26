const express = require('express');
const fs = require('fs/promises');
const { getOwnerById, getOwners } = require('./controllers/owners.controllers');
const app = express();

app.use(express.json());

function logMethod(req, res, next) {
    console.log('Request Type:', req.method)
    const dataToWrite = `Request Type: ${req.method} \n`
    fs.appendFile('./log.txt', dataToWrite).then(() => {
        next()
    })
}
function logUrl(req, res, next) {
    console.log('Requested Url', req.url)
    const dataToWrite = `Requested Url: ${req.url} \n`
    fs.appendFile('./log.txt', dataToWrite).then(() => {
        next()
    })
}

function logRequestTime(req, res, next) {
    console.log('Time of Request:', new Date(Date.now()).toString())
    const dataToWrite = `Time of Request ${new Date(Date.now()).toString()} \n\n`
    fs.appendFile('./log.txt', dataToWrite).then(() => {
        next()
    })
} 

const logStuff = [ logMethod, logUrl, logRequestTime ]

app.get('/owners/:id', logStuff, getOwnerById);

app.get('/owners', logStuff, (req, res, next) => {
    const ownersArr = [];
    fs.readdir('./data/owners').then((data) => {
        data.forEach((owner) => {
            fs.readFile(`./data/owners/${owner}`).then((ownerData) => {
                const parsedData = JSON.parse(ownerData);
                ownersArr.push(parsedData);
                if (ownersArr.length === data.length) {
                    res.send({ owners: ownersArr })
                    next()
                }
            })
        })
    })
})

app.get('/owners/:id/pets', logStuff, (req, res, next) => {
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
    next();
})

app.get('/pets', logStuff, (req, res, next) => {
    const petsArr = [];
    const q = req.query
    const qk= Object.keys(q)
    
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
                        next()
                    }
                    res.send({ pets: petsArr })
                    next()
                }
            })
        })
    })
})


app.get('/pets/:id', logStuff, (req, res, next) => {
    fs.readFile(`./data/pets/p${req.params.id}.json`, 'utf8').then((data) => {
        const parsedData = JSON.parse(data);
        res.send({ pet: parsedData })        
        next();
    })
}) 

app.patch('/owners/:id',(req,res)=>{
    const ownerId=req.params.id;
    const parsedBody= req.body

    fs.readFile(`./data/owners/o${ownerId}.json`, 'utf8').then((data) => {
        const parsedData = JSON.parse(data);
        console.log(parsedData)
        parsedData.name=parsedBody.name
        parsedData.age=parsedBody.age

        return Promise.all([parsedData,fs.writeFile(`./data/owners/o${ownerId}.json`,
        JSON.stringify(parsedData,null,2)
        )])

                
    }).then((data)=>{
        const updatedOwnerData = data[0]
        res.status(200).send({owner:updatedOwnerData});
        next()
    })
})

app.post('/owners', logStuff, (req, res, next) => {
    const parsedBody = req.body;
    const idNum = Date.now()
    const newOwner = { id: `o${idNum}`, ...parsedBody}

    fs.writeFile(`./data/owners/o${idNum}.json`, JSON.stringify(newOwner, null, 2)).then(() => {
        res.status(200).send({ owner: newOwner });
        next()
    })
})

app.post('/owners/:id/pets', logStuff, (req, res, next) => {
    const id = req.params.id
    const idNum = Date.now()
    const parsedBody = req.body;
    const newPet = { id: `p${idNum}`, owner: id, ...parsedBody }

    fs.readdir('./data/owners').then((owners) => {
        if (owners.includes(`${id}.json`)) {
            return Promise.all([
                newPet,
                fs.writeFile(`./data/pets/p${idNum}.json`, JSON.stringify(newPet, null, 2))
            ])
        };
    })
    .then((data) => {
        res.status(200).send({ pet: data[0] })
        next()
    })
})

app.delete('/pets/:id', logStuff, (req, res, next) => {
    const id = req.params.id;

    fs.rm(`./data/pets/p${id}.json`).then(() => {
        res.status(200).send(`p${id} successfully deleted`)
        next()
    })
})

app.delete('/owners/:id', logStuff, (req, res, next) => {
    const id = req.params.id;

    fs.readdir('./data/pets').then((data) => {
        data.forEach((pets) => {
            fs.readFile(`./data/pets/${pets}`)
            .then((petsData) => {
                const pet = JSON.parse(petsData)
                return pet
            })
            .then((pet) => {
                if (pet.owner === `o${id}`) {
                    fs.rm(`./data/pets/${pet.id}.json`)
                }
            })
        })
    })
    .then(() => {
        fs.rm(`./data/owners/o${id}.json`)
    })
    .then(() => {
        res.status(200).send(`o${id} and their pets and have been successfully deleted`)
        next()
    })
}) 

app.listen(9090, () => console.log('App listening on port 9090!'));