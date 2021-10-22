// const shortid = require('short-id')
// const IPFS = require('ipfs-api');
// const ipfs = IPFS({
//     host: 'ipfs.infura.io',
//     port: 5001, protocol: 'https'
// });

// function routes(app, dbe, lms, accounts) {
//     let db = dbe.collection('users')
//     let contract = dbe.collection('contract')
//     app.post('/register', (req, res) => {
//         let email = req.body.email
//         let idd = shortid.generate()
//         if (email) {
//             db.findOne({ email }, (err, doc) => {
//                 if (doc) {
//                     console.log(doc)
//                     res.status(400).json({ "status": "Failed", "reason": "Already registered" })
//                 } else {
//                     db.insertOne({ email })
//                     res.json({ "status": "success", "id": idd })
//                 }
//             })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })

//     app.post('/login', (req, res) => {
//         let email = req.body.email
//         if (email) {
//             db.findOne({ email }, (err, doc) => {
//                 if (doc) {
//                     res.json({ "status": "success", "id": doc.id })
//                 } else {
//                     res.status(400).json({ "status": "Failed", "reason": "Not recognised" })
//                 }
//             })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })
//     app.put('/rental_request', async (req, res) => {
//         let contractId = Math.floor(Math.random() * 1000);
//         let startDate = new Date().toDateString();
//         let { tenantAddress, securityDeposit, rentAmount, duration, fromAddress } = req.body

//         if (tenantAddress && securityDeposit && rentAmount && duration && fromAddress) {
//             lms.initializeRentContract(contractId, tenantAddress, securityDeposit, rentAmount, duration, startDate, { from: fromAddress })
//                 .then((hash) => {
//                     contract.insertOne({ contractId, tenantAddress, securityDeposit, rentAmount, duration, fromAddress, txId: hash.tx, transactionHash: hash.receipt.transactionHash })
//                     return hash;
//                 })
//                 .then((hash) => {
//                     res.json({ "status": "success", contractId, hash })
//                 })
//                 .catch(err => {
//                     res.status(500).json({ "status": "Failed", "reason": "createProduct error occured", err })
//                 })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })

//     router.post('/rental_request', function (req, res) {
//         var rentalRequestServiceInst = new RentalRequestService();
//         req.userId = req.user.userId;
//         if(!req.body.propertyId){
//             return res.status(400).send({ status: "Failed" , message: "PropertyId is required"});
//         }
//         return rentalRequestServiceInst.createRentalRequest(req.userId, req.body)
//             .then((data) => {
//                 res.send({ "status": "SUCCESS", message: "Rental request Sent successfully",data});
//             })
//             .catch((err) => {
//                 res.status(400).send({ status: "Failed" , message: "Rental request couldn't be created successfully", error: err});
//             });
//     });

//     app.post('/depositSecurity/:contractId', async (req, res) => {
//         let { contractId } = req.params;
//         let { address, depositValue } = req.body;
//         if (contractId && address && depositValue) {
//             db.findOne({ contractId }, (err, doc) => {
//                 if (err) {
//                     res.status(500).json({ "status": "Failed", "reason": "depositSecurity db error occured", err })
//                 } else {
//                     console.log("doc", doc, doc.securityDeposit)
//                     if (doc) {
//                         lms.depositSecurity(contractId, { from: address, value: doc.securityDeposit })
//                             .then((_hash, _address) => {
//                                 res.json({ "status": "success", _hash, _address })
//                             })
//                             .catch(err => {
//                                 res.status(500).json({ "status": "Failed", "reason": "depositSecurity error occured", err })
//                             })
//                 }

//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })



//     app.post('/payRent', async (req, res) => {
//         let { contractId, address, rentAmount } = req.body
//         if (contractId && rentAmount && address) {
//             lms.payRent(contractId, { from: address, value: rentAmount })
//                 .then((_hash, _address) => {
//                     res.json({ "status": "success", _hash, _address })
//                 })
//                 .catch(err => {
//                     res.status(500).json({ "status": "Failed", "reason": "payRent error occured", err })
//                 })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })

//     app.post('/withdraw', async (req, res) => {
//         let address = req.body.address
//         if (address) {
//             lms.withdraw({ from: address })
//                 .then((_hash, _address) => {
//                     res.json({ "status": "success", _hash, _address })
//                 })
//                 .catch(err => {
//                     res.status(500).json({ "status": "Failed", "reason": "withdraw error occured", err })
//                 })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })
//     app.get('/getContractDetails/:contractId/:address', (req, res) => {
//         if (req.params.contractId) {
//             lms.getContractDetails(req.params.contractId, { from: req.params.address })
//                 .then(async (hash, data) => {
//                     res.json({ "status": "success", hash: hash, data })
//                 })
//                 .catch(err => {
//                     res.status(500).json({ "status": "Failed", "reason": "getContractDetails error occured", err })
//                 })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })

//     app.get('/getPendingFunds/:address', (req, res) => {
//         if (req.params.address) {
//             lms.getPendingFunds({ from: req.params.address })
//                 .then(async (hash, data) => {

//                     console.log("---", hash, data)
//                     res.json({ "status": "success", contractId: hash, data })
//                 })
//                 .catch(err => {
//                     res.status(500).json({ "status": "Failed", "reason": "getPendingFunds error occured", err })
//                 })
//         } else {
//             res.status(400).json({ "status": "Failed", "reason": "wrong input" })
//         }
//     })

// }

// module.exports = routes
