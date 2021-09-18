var TrustedPropertiesBasicContract= artifacts.require("./TrustedPropertiesBasicContract")

module.exports =async (deployer) => {  
    await deployer.deploy(TrustedPropertiesBasicContract, 100)
}
