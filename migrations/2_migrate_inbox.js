var TrustedPropertiesBasicRentContract= artifacts.require("./TrustedPropertiesBasicRentContract")

module.exports =async (deployer) => {  
    await deployer.deploy(TrustedPropertiesBasicRentContract, 100)
}
