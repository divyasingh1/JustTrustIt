pragma solidity ^0.5.16;

contract  Inbox { 
    
   struct Product {
     string name;
     string description;
     string manufacturer;
     bool initialized;
   }
   
   struct Manufacturer {
     string license;
     bool initialized;
   }
   
   event ProductCreate(address account,  string   uuid,  string   manufacturer);
   event ProductTransfer(address from, address to, string uuid);
   event RejectCreate(address account, string uuid, string message);
   event RejectTransfer(address from, address to, string uuid, string message);
   event AddManufacturer(address from,  string message);
   event RejectAddManufacturar(address from, string message);
   event RejectDeleteManufacturar(address from, string message);
   event DeleteManufacturar(address from, string message);
   
   mapping(string  => Product) private productStore;
   
   mapping(address => mapping(string => bool)) private walletStore;
   
   mapping(address => Manufacturer) private manufacturer;
   
   address owner;
   
   constructor () public { 
       owner=msg.sender; 
   }
  
    modifier onlyOwner {
       require(msg.sender == owner);
       _; 
    }
    
    modifier onlyManufacturar {
         require(manufacturer[msg.sender].initialized == true);
         _; 
    }


   function addManufacturer(address _manufacturer , string  memory license) onlyOwner public {
         if(manufacturer[_manufacturer].initialized){
             emit RejectAddManufacturar(msg.sender, "Manufacturar already added");
             revert("Manufacturar already added");
         }
         
         manufacturer[_manufacturer] = Manufacturer(license, true);
         emit AddManufacturer(msg.sender, "Manufacturer added successfully");
   }
   
  function removeManufacturer(address _manufacturer) onlyOwner public {
      if(manufacturer[_manufacturer].initialized){
          manufacturer[_manufacturer].initialized =  false;
          emit DeleteManufacturar(msg.sender, "Manufecturar deleted");
          return;
       }
       emit RejectDeleteManufacturar(msg.sender, "Manufecturar already deleted");
       revert("Manufacturar already deleted");
  }
   
    
   function createProduct(string  memory name, string  memory description, string  memory uuid, string  memory manufacturerName) onlyManufacturar  public {
      if(productStore[uuid].initialized) {
        emit RejectCreate(msg.sender, uuid, "Asset with this UUID already exists.");
        revert("Asset with this UUID already exists");
      }

      productStore[uuid] = Product(name, description, manufacturerName, true );
      walletStore[msg.sender][uuid] = true;
      emit ProductCreate(msg.sender, uuid, manufacturerName);
   }
    
    function transferProduct(address to, string  memory uuid)  public {
        if(!productStore[uuid].initialized) {
          emit RejectTransfer(msg.sender, to, uuid, "No asset with this UUID exists");
          revert("No asset with this UUID exists");
        }

        if(!walletStore[msg.sender][uuid]) {
           emit RejectTransfer(msg.sender, to, uuid, "Sender does not own this asset.");
           revert("Sender does not own this asset.");
        }
        
        walletStore[msg.sender][uuid] = false;
        walletStore[to][uuid] = true;
        emit ProductTransfer(msg.sender,  to, uuid);
    }
    
    function getProductByProductId(string  memory uuid) public  returns (string  memory, string  memory, string  memory, bool) {
       return (productStore[uuid].name, productStore[uuid].description, productStore[uuid].manufacturer, productStore[uuid].initialized );
    }
    
    function getManufacturar(address _address) public  returns (string  memory, bool){
       return (manufacturer[_address].license, manufacturer[_address].initialized);
    }
    
    function isOwnerOf(address _owner, string  memory uuid) public  returns (bool) {
         if(walletStore[_owner][uuid]) {
           return true;
          }
         revert("Product does not exist");
     }
}