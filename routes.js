const shortid = require('short-id')
const IPFS =require('ipfs-api');
const ipfs = IPFS({ host: 'ipfs.infura.io',
    port: 5001,protocol: 'https' });

function routes(app, dbe, lms, accounts){
    let db= dbe.collection('music-users')
    let music = dbe.collection('music-store')
    app.post('/register', (req,res)=>{
        let email = req.body.email
        let idd = shortid.generate()
        if(email){
            db.findOne({email}, (err, doc)=>{
                if(doc){
                    console.log(doc)
                    res.status(400).json({"status":"Failed", "reason":"Already registered"})
                }else{
                    db.insertOne({email})
                    res.json({"status":"success","id":idd})
                }
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    app.post('/login', (req,res)=>{
        let email = req.body.email
        if(email){
            db.findOne({email}, (err, doc)=>{
                if(doc){
                    res.json({"status":"success","id":doc.id})
                }else{
                    res.status(400).json({"status":"Failed", "reason":"Not recognised"})
                }
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
    app.post('/createProduct', async (req,res)=>{
        
        let {name,description,uuid,manufacturerName} = req.body
        if(name && description && uuid && manufacturerName){
            lms.createProduct(name, description,uuid,manufacturerName, {from: "0x86C9A6f5E1737695788505889F6eD4A244eAFF6F"})
            .then((_hash, _address)=>{
                res.json({"status":"success", _hash, _address})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"createProduct error occured", err})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    app.post('/transferProduct', async (req,res)=>{
        
        let {addressTo,uuid} = req.body
        if(addressTo && uuid){
            lms.transferProduct(addressTo,uuid, {from: "0x86C9A6f5E1737695788505889F6eD4A244eAFF6F"})
            .then((_hash, _address)=>{
                res.json({"status":"success", _hash, _address})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"transferProduct error occured", err})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    app.post('/addManufacturer', async (req,res)=>{
        let license = req.body.license
        let address = req.body.address
        let id = shortid.generate() + shortid.generate()
        if(license && address){
            lms.addManufacturer(address, license, {from: accounts[0]})
            .then((_hash, _address)=>{
                res.json({"status":"success", _hash, _address})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"addManufacturer error occured", err})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
    app.get('/getManufacturar/:address', (req,res)=>{
        if(req.params.address){
            lms.getManufacturar(req.params.address, {from: accounts[0]})
            .then(async(hash, data)=>{
                res.json({"status":"success", hash: hash, data})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"getManufacturar error occured", err})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    app.get('/getProductByProductId/:uuid', (req,res)=>{
        if(req.params.uuid){
            lms.getProductByProductId(req.params.uuid, {from: accounts[0]})
            .then(async(hash, data)=>{
                res.json({"status":"success", hash: hash, data})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"getProductByProductId error occured", err})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
        
    app.get('/isOwnerOf/:address/:uuid', (req,res)=>{
        if(req.params.uuid && req.params.address){
            lms.isOwnerOf(req.params.address, req.params.uuid, {from: accounts[0]})
            .then(async(hash, data)=>{
                res.json({"status":"success", hash: hash, data})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"isOwnerOf error occured", err})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
}

module.exports = routes
