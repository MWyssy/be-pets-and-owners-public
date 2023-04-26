const fs=require('fs/promises')

exports.fetchOwnerById=(id)=>{

    return fs.readFile(`${__dirname}/../data/owners/o${id}.json`, 'utf8')
    .then((data) => {
        const parsedData = JSON.parse(data);
        return parsedData
    }).catch((err)=>{
        console.log('MODEL: ', err)
        return 'Error, that page does not exist'
    })


}

