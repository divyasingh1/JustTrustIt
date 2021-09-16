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
    app.post('/addManufacturer', async (req,res)=>{
        let license = req.body.license
        let address = req.body.address
        let id = shortid.generate() + shortid.generate()
        if(license && address){
            lms.addManufacturer(address, license, {from: accounts[0]})
            .then(()=>{
                res.json({"status":"success", id})
            })
            .catch(err=>{
                res.status(500).json({"status":"Failed", "reason":"addManufacturer error occured"})
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
    app.get('/access/:email', (req,res)=>{
        if(req.params.email){
            db.findOne({email: req.params.email}, (err,doc)=>{
                if(doc){
                    let data = music.find().toArray()
                    console.log("data", data)
                    res.json({"status":"success", data})
                }
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
    app.get('/access/:email/:id', (req,res)=>{
      let id = req.params.id
        if(req.params.id && req.params.email){
            db.findOne({email:req.params.email},(err,doc)=>{
                if(doc){
                    lms.getHash(id, {from: accounts[0]})
                    .then(async(hash)=>{
                        let data = await ipfs.files.get(hash)
                        console.log("data:::", data)
                        res.json({"status":"success", data: data})
                    })
                }else{
                    res.status(400).json({"status":"Failed", "reason":"wrong input"})
                }
            })
        }else{
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })
}

module.exports = routes
