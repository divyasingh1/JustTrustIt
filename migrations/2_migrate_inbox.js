
var CProperties = artifacts.require("../contracts/TrustedProperty");

// var LibCommon = artifacts.require('../contracts/LibCommon')
// var LibCommon = artifacts.require("./LibCommon");

// module.exports =async (deployer) => {  
//     // await deployer.deploy(LibCommon)
//     // await deployer.deploy(CProperties)

//     deployer.deploy(LibCommon).then(function(){
//          return deployer.deploy(CProperties)
//     });
// }


// module.exports = function(deployer) {
//     deployer.deploy(Factory).then(function(){
//           return deployer.deploy(Tokendeployer, Factory.address)
//   });

async function doDeploy(deployer, network) {

    await deployer.deploy(CProperties, "trustedp", "TRT")
}


module.exports = (deployer, network) => {
    deployer.then(async () => {
        await doDeploy(deployer, network);
    });
};