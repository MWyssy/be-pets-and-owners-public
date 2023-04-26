const {fetchOwnerById}=require('../models/owners.models.js')

exports.getOwnerById=(req,res)=>{

    const {id}=req.params

    fetchOwnerById(id).then((owner)=>{
        console.log("controller")
        res.status(200).send({ owner: owner})
    })
}