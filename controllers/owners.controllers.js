const {fetchOwnerById, fetchOwners}=require('../models/owners.models.js')

exports.getOwnerById=(req,res)=>{

    const {id}=req.params

    fetchOwnerById(id).then((owner)=>{
        if (typeof owner === 'string') {
            res.status(404).send(owner);
            next()
        }
        else {
            res.status(200).send({ owner: owner})
            next();
        }
    })
}
