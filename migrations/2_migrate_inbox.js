var SafeMath = artifacts.require("./SafeMath.sol")
var ERC721BasicToken = artifacts.require("./ERC721BasicToken.sol")
var AddressUtils = artifacts.require("./AddressUtils.sol")
var SupportsInterfaceWithLookup = artifacts.require("./SupportsInterfaceWithLookup.sol")
var TrustedProperties = artifacts.require("./TrustedProperties");
var ApproveAndCallFallBack= artifacts.require("./ApproveAndCallFallBack");
var Owned = artifacts.require("./Owned")
var TrustedPropertiesToken= artifacts.require("./TrustedPropertiesToken")

var Properties =  artifacts.require("./Properties")
module.exports =async (deployer) => {
    await deployer.deploy(SafeMath)
    await deployer.deploy(Properties)
    // await deployer.deploy(SupportsInterfaceWithLookup)
    // await deployer.link(SafeMath,ERC721BasicToken)
    // await deployer.link(AddressUtils,ERC721BasicToken)
    // await deployer.link(SupportsInterfaceWithLookup,ERC721BasicToken)
    // await deployer.deploy(ERC721BasicToken)
    await deployer.deploy(ApproveAndCallFallBack)
    await deployer.deploy(Owned)
    await deployer.deploy(TrustedPropertiesToken,"ate", "divya" , 1, 1 )
    await deployer.link(SafeMath,TrustedProperties)
    await deployer.link(Properties,TrustedProperties)
    
    await deployer.deploy(TrustedProperties,"0xe7A3c52fAF19d2623C3E2471bE1259C9f1F37350", 1)
}
