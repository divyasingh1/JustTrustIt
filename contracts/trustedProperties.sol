// ----------------------------------------------------------------------------
// Uhodchain Dapp
// https://github.com/vincentshangjin/trustedPropertieschain
// Based on ClubEth.App Project https://github.com/bokkypoobah/ClubEth
// https://github.com/saurfang/erc809-billboard/blob/master/contracts/BasicBillboard.sol
// https://github.com/BookLocal/proofOfConcept
// the TrustedPropertieschain Dapp Project - 2018. The MIT Licence.
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
// ----------------------------------------------------------------------------

pragma solidity 0.4.24;

import "./ERC721Token/ERC721Basic.sol";
import "./ERC721Token/ERC721BasicToken.sol";
/* import "./ERC721Token/ERC721Token.sol"; */


contract ERC20Interface {
    function totalSupply() public view returns (uint);
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function allowance(address tokenOwner, address spender) public view returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}


// ----------------------------------------------------------------------------
// TrustedPropertiesToken Interface = ERC20 + symbol + decimals + burn
// + approveAndCall
// ----------------------------------------------------------------------------
contract TrustedPropertiesTokenInterface is ERC20Interface {
    function symbol() public view returns (string);
    // function location() public view returns (string);
    function decimals() public view returns (uint8);
    function approveAndCall(address spender, uint tokens, bytes data) public returns (bool success);
    // function mint(address tokenOwner, uint tokens) public returns (bool success);
    function burn(address tokenOwner, uint tokens) public returns (bool success);
}


// ----------------------------------------------------------------------------
// Contract function to receive approval and execute function in one call
//
// Borrowed from MiniMeToken
// ----------------------------------------------------------------------------
contract ApproveAndCallFallBack {
    event LogBytes(bytes data);

    function receiveApproval(address from, uint256 tokens, address token, bytes data) public {
        ERC20Interface(token).transferFrom(from, address(this), tokens);
        emit LogBytes(data);
    }
}


// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }

    function acceptOwnership() public {
        require(msg.sender == newOwner);
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }

    function transferOwnershipImmediately(address _newOwner) public onlyOwner {
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}


/// @title ERC809: a standard interface for renting rival non-fungible tokens.
contract ERC809 is ERC721Basic {
    /// @dev This emits when a successful rhttps://github.com/saurfang/erc809-billboard/blob/master/contracts/BasicBillboard.soleservation is made for accessing any NFT.
    event Reserve(address indexed _renter, uint256 _tokenId, uint256 _start, uint256 _end);

    /// @dev This emits when a successful cancellation is made for a reservation.
    event CancelReservation(address indexed _renter, uint256 _tokenId, uint256 _start, uint256 _end);

    /// @notice Reserve access to token `_tokenId` from time `_start` to time `_end`
    /// @dev A successful reservation must ensure each time slot in the range _start to _end
    ///  is not previously reserved (by calling the function checkAvailable() described below)
    ///  and then emit a Reserve event.
    function reserve(uint256 _tokenId, uint256 _start, uint256 _end) external payable returns (bool success);

    /// @notice Cancel reservation for `_tokenId` between `_start` and `_end`
    /// @dev All reservations between `_start` and `_end` are cancelled. `_start` and `_end` do not guarantee
    //   to be the ends for any one of the reservations
    function cancelReservation(uint256 _tokenId, uint256 _start, uint256 _end) external returns (bool success);

    /// @notice Revoke access to token `_tokenId` from `_renter` and settle payments
    /// @dev This function should be callable by either the owner of _tokenId or _renter,
    ///  however, the owner should only be able to call this function if now >= _end to
    ///  prevent premature settlement of funds.
    function settle(uint256 _tokenId, address _renter, uint256 _end) external returns (bool success);

    /// @notice Find the renter of an NFT token as of `_time`
    /// @dev The renter is who made a reservation on `_tokenId` and the reservation spans over `_time`.
    function renterOf(uint256 _tokenId, uint256 _time) public view returns (address);


    /// @notice Query if token `_tokenId` if available to reserve between `_start` and `_end` time
    function checkAvailable(uint256 _tokenId, uint256 _start, uint256 _end) public view returns (bool available);
}


// ----------------------------------------------------------------------------
// Property Data Structure
// ----------------------------------------------------------------------------
library Properties {
    enum PropertyType {
        House,                         //  0 House
        ApartmentAndUnit,              //  1 Apartment and unit
        Townhouse,                     //  2 Townhouse
        Villa,                         //  3 Villa
        Acreage,                       //  4 Acreage
        BlockOfUnits,                  //  5 Block of units
        RetirementLiving               //  6 Retirement living
    }

    // The number of bedrooms, bathrooms, garage spaces
    enum NumberOf {
        Zero,                          //  0 Zero
        One,                           //  1 One
        Two,                           //  2 Two
        Three,                         //  3 Three
        Four,                          //  4 Four
        Five,                          //  5 Five
        SixOrMore                      //  6 Six or more
    }

    struct Property {
        bool exists;
        uint index;
        address owner;
        string location;
        PropertyType propertyType;
        NumberOf bedrooms;
        NumberOf bathrooms;
        NumberOf garageSpaces;
        string comments;
        uint initialAvailableDate;
    }

    struct Data {
        bool initialised;

        // The bytes32 key is the property identifier
        mapping(bytes32 => Property) entries;
        bytes32[] index;
    }

    event PropertyAdded(bytes32 propertyHash, address indexed ownerAddress, string location, uint totalAfter);
    event PropertyRemoved(bytes32 propertyHash, address indexed ownerAddress, string location, uint totalAfter);
    // event propertyLocationUpdated(address indexed ownerAddress, string oldLocation, string newLocation);

    function init(Data storage self) public {
        require(!self.initialised);
        self.initialised = true;
    }

    function isPropertyOwner(Data storage self, address _ownerAddress,
        bytes32 _propertyHash) public view returns (bool) {
        /* bytes32 propertyHash = keccak256(abi.encodePacked(ownerAddress, propertyLocation)); */
        return (self.entries[_propertyHash].exists && self.entries[_propertyHash].owner == _ownerAddress);
    }

    function add(
        Data storage self,
        address _ownerAddress,
        string _propertyLocation,
        PropertyType _propertyType,
        NumberOf _bedrooms,
        NumberOf _bathrooms,
        NumberOf _garageSpaces,
        string _comments,
        uint _initialAvailableDate)
    public
    {
        bytes32 propertyHash = keccak256(abi.encodePacked(_ownerAddress, _propertyLocation));

        require(!self.entries[propertyHash].exists);
        require(_ownerAddress != 0x0);
        require(bytes(_propertyLocation).length > 0);

        self.index.push(propertyHash);
        self.entries[propertyHash] = Property(true, self.index.length - 1,
            _ownerAddress, _propertyLocation, _propertyType, _bedrooms,
            _bathrooms, _garageSpaces, _comments, _initialAvailableDate);
        emit PropertyAdded(propertyHash, _ownerAddress, _propertyLocation, self.index.length);
    }

    function remove(Data storage self, bytes32 _propertyHash) public {

        /* bytes32 propertyHash = keccak256(abi.encodePacked(_ownerAddress, _propertyLocation)); */

        require(self.entries[_propertyHash].exists);
        uint removeIndex = self.entries[_propertyHash].index;
        address _ownerAddress = self.entries[_propertyHash].owner;
        string memory _propertyLocation = self.entries[_propertyHash].location;
        emit PropertyRemoved(_propertyHash, _ownerAddress, _propertyLocation, self.index.length - 1);
        uint lastIndex = self.index.length - 1;
        bytes32 lastIndexAddress = self.index[lastIndex];
        self.index[removeIndex] = lastIndexAddress;
        self.entries[lastIndexAddress].index = removeIndex;
        delete self.entries[_propertyHash];
        if (self.index.length > 0) {
            self.index.length--;
        }

    }

    // TODO: implement a setOwner function by calling remove and then add
    // function setOwner(Data storage self, address ownerAddress,
    // string propertyLocation, address newOwnerAddress) public {
    //     bytes32 propertyHash = keccak256(abi.encodePacked(ownerAddress, propertyLocation));
    //     Property storage property = self.entries[ownerAddress];
    //     require(property.exists);
    //     emit propertyLocationUpdated(ownerAddress, property.location, propertyLocation);
    //     property.location = propertyLocation;
    // }
    function length(Data storage self) public view returns (uint) {
        return self.index.length;
    }

}


// ----------------------------------------------------------------------------
// PropertyToken
// ----------------------------------------------------------------------------
contract PropertyToken is ERC721BasicToken, Owned {
    enum PropertyType {
        House,                         //  0 House
        ApartmentAndUnit,              //  1 Apartment and unit
        Townhouse,                     //  2 Townhouse
        Villa,                         //  3 Villa
        Acreage,                       //  4 Acreage
        BlockOfUnits,                  //  5 Block of units
        RetirementLiving               //  6 Retirement living
    }

    // The number of bedrooms, bathrooms, garage spaces
    enum NumberOf {
        Zero,                          //  0 Zero
        One,                           //  1 One
        Two,                           //  2 Two
        Three,                         //  3 Three
        Four,                          //  4 Four
        Five,                          //  5 Five
        SixOrMore                      //  6 Six or more
    }

    struct Property {
        bool exists;
        uint index;
        address originalOwner;
        string location;
        PropertyType propertyType;
        NumberOf bedrooms;
        NumberOf bathrooms;
        NumberOf garageSpaces;
        string comments;
        uint initialAvailableDate;
        uint tokensAsBond;
        address currentRenter;
    }

    struct RentalTokenRights {
        bool canBurn;
        bool canTransferToAll;
        bool canTransferToPreapproved;
        bool canCopyAcrossRights;
    }

    event PropertyAdded(bytes32 propertyHash, address indexed ownerAddress, string location, uint totalAfter);
    event PropertyRemoved(bytes32 propertyHash, address indexed ownerAddress, string location, uint totalAfter);
    event MintRental(uint _tokenId, uint _start, uint _end, address indexed _renter);
    event RentalTokenApproval(address owner, uint _tokenId, uint _start, uint _end, address indexed renter, address indexed _to);
    event TransferRentalFrom(address indexed _from, address indexed _to, uint _tokenId, uint _start, uint _end);

    TrustedPropertiesTokenInterface public token;
    uint public tokensToAddNewProperties;
    address public tokenAddress;
    mapping(bytes32 => Property) public entries;
    bytes32[] public index;
    uint public minRentTime;
    // Mapping from token ID to start time index to rental token owner
    mapping (uint => mapping (uint => address)) public rentals;

    // Mapping from token ID to start time index to rental token approved party
    mapping (uint => mapping (uint => address)) public rentalTokenApprovals;

    // Mapping from token ID to renter address to RentalTokenRights
    mapping (uint => mapping (address => RentalTokenRights)) public renterRights;

    // Mapping for preapproved retners
    mapping (uint => mapping (address => bool)) public preapprovedRenters;

    mapping (uint => mapping (address => bool)) public rentalIntention;

    mapping (address => mapping (uint => uint)) public bondTaken;

    modifier onlyPropertyOwnerOrRenter (uint _tokenId, uint _start, uint _end) {
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);
        if (ownerOf(_tokenId) != msg.sender) {
            for (uint i = _startIndex; i < _endIndex; i++) {
                require(rentals[_tokenId][i] == msg.sender);
            }
        }
        _;
    }

    modifier onlyRenter (uint _tokenId, uint _start, uint _end) {
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);
        for (uint i = _startIndex; i < _endIndex; i++) {
            require(rentals[_tokenId][i] == msg.sender);
        }
        _;
    }

    modifier onlyRenterOrApproved (uint _tokenId, uint _start, uint _end) {
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);
        bool isRenter = true;
        bool isRentalTokenApproved = true;

        for (uint i = _startIndex; i < _endIndex; i++) {

            if (rentals[_tokenId][i] != msg.sender) {
                isRenter = false;
            }

            if (rentalTokenApprovals[_tokenId][i] != msg.sender) {
                isRentalTokenApproved = false;
            }
        }

        require(isRenter || isRentalTokenApproved);
        _;
    }

    constructor(address _trustedPropertiesToken, uint _tokensToAddNewProperties, uint _minRentTime) public {
        token = TrustedPropertiesTokenInterface(_trustedPropertiesToken);
        tokenAddress = _trustedPropertiesToken;
        tokensToAddNewProperties = _tokensToAddNewProperties;
        minRentTime = _minRentTime;
    }

    function addProperty(
        address _originalOwnerAddress,
        string _propertyLocation,
        PropertyType _propertyType,
        NumberOf _bedrooms,
        NumberOf _bathrooms,
        NumberOf _garageSpaces,
        string _comments,
        uint _initialAvailableDate,
        uint _tokensAsBond,
        address _currentRenter)
    public
    {
        bytes32 propertyHash = keccak256(abi.encodePacked(_originalOwnerAddress, _propertyLocation));

        require(!entries[propertyHash].exists);
        require(_originalOwnerAddress != 0x0);
        require(bytes(_propertyLocation).length > 0);
        require(_tokensAsBond > 0);
        require(token.transferFrom(msg.sender, this, tokensToAddNewProperties));

        index.push(propertyHash);
        entries[propertyHash] = Property(true, index.length - 1,
            _originalOwnerAddress, _propertyLocation, _propertyType, _bedrooms,
            _bathrooms, _garageSpaces, _comments, _initialAvailableDate,
            _tokensAsBond, _currentRenter);
        _mint(_originalOwnerAddress, uint(propertyHash));
        emit PropertyAdded(propertyHash, _originalOwnerAddress, _propertyLocation, index.length);
    }

    function removeProperty(bytes32 _propertyHash) public onlyOwnerOf(uint(_propertyHash)) {
        require(entries[_propertyHash].exists);
        uint removeIndex = entries[_propertyHash].index;
        /* address _ownerAddress = entries[_propertyHash].owner; */
        address _ownerAddress = ownerOf(uint(_propertyHash));
        string memory _propertyLocation = entries[_propertyHash].location;
        emit PropertyRemoved(_propertyHash, _ownerAddress, _propertyLocation, index.length - 1);
        uint lastIndex = index.length - 1;
        bytes32 lastIndexAddress = index[lastIndex];
        index[removeIndex] = lastIndexAddress;
        entries[lastIndexAddress].index = removeIndex;
        delete entries[_propertyHash];
        if (index.length > 0) {
            index.length--;
        }
        _burn(_ownerAddress, uint(_propertyHash));
    }

    function updateInitialAvailableDate(
        bytes32 _propertyHash,
        uint _initialAvailableDate)
    public
    onlyOwnerOf(uint(_propertyHash))
    {
        require(_initialAvailableDate > 0);
        Property storage property = entries[_propertyHash];
        property.initialAvailableDate = _initialAvailableDate;
    }

    function updatePropertyData(
        bytes32 _propertyHash,
        PropertyType _propertyType,
        NumberOf _bedrooms,
        NumberOf _bathrooms,
        NumberOf _garageSpaces,
        string _comments,
        uint _tokensAsBond,
        address _currentRenter)
    public
    onlyOwnerOf(uint(_propertyHash))
    {
        Property storage property = entries[_propertyHash];
        property.propertyType = _propertyType;
        property.bedrooms = _bedrooms;
        property.bathrooms = _bathrooms;
        property.garageSpaces = _garageSpaces;
        property.comments = _comments;
        property.tokensAsBond = _tokensAsBond;
        property.currentRenter = _currentRenter;
    }

    function numberOfProperties() public view returns (uint) {
        return index.length;
    }

    function getPropertyData(
        bytes32 _propertyHash
    )
    public
    view
    returns (
        bool exists,
        uint index_,
        address owner,
        string location,
        PropertyType propertyType,
        NumberOf bedrooms,
        NumberOf bathrooms,
        NumberOf garageSpaces,
        string comments,
        uint initialAvailableDate,
        uint tokensAsBond,
        address currentRenter)
    {
        Property memory property = entries[_propertyHash];
        return (property.exists, property.index, property.originalOwner, property.location, property.propertyType,
        property.bedrooms, property.bathrooms, property.garageSpaces, property.comments,
        property.initialAvailableDate, property.tokensAsBond, property.currentRenter);
    }

    function getPropertyByIndex(uint _index) public view returns (bytes32 property) {
        return index[_index];
    }

    function updateRentalIntention(uint _tokenId) public {
        bytes32 _propertyHash = bytes32(_tokenId);
        Property memory property = entries[_propertyHash];
        require(token.allowance(msg.sender, this) > property.tokensAsBond);
        rentalIntention[_tokenId][msg.sender] = true;
    }

    // Additional functions for ERC1201
    function mintRental(uint _tokenId, uint _start, uint _end, address _renter)
    public
    onlyOwnerOf(_tokenId)
    {
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);

        // check availability (for all time slots in range)
        for (uint i = _startIndex; i <= _endIndex; i++) {
            require(!rentalExists(_tokenId, i));
        }

        // // check if there is intention to rent
        require(rentalIntention[_tokenId][_renter] == true);
        // // charge bondTaken
        bytes32 _propertyHash = bytes32(_tokenId);
        Property memory property = entries[_propertyHash];

        require(token.transferFrom(_renter, this, property.tokensAsBond));
        bondTaken[msg.sender][_tokenId] = bondTaken[msg.sender][_tokenId].add(property.tokensAsBond);

        require(_start > property.initialAvailableDate);

        // mint rental tokens
        for (i = _startIndex; i < _endIndex; i++) {
            rentals[_tokenId][i] = _renter;
        }

        emit MintRental(_tokenId, _start, _end, _renter);
    }

    function setRenterRights(
        uint _tokenId,
        address _renter,
        bool _canBurn,
        bool _canTransferToAll,
        bool _canTransferToPreapproved,
        bool _canCopyAcrossRights
    )
    public
    {
        require(ownerOf(_tokenId) == msg.sender);
        renterRights[_tokenId][_renter] = RentalTokenRights(
            _canBurn, _canTransferToAll, _canTransferToPreapproved, _canCopyAcrossRights);
    }

    function getRenterRights(
        uint _tokenId,
        address _renter
    )
    public
    view
    returns(bool canBurn, bool canTransferToAll, bool canTransferToPreapproved, bool canCopyAcrossRights)
    {
        RentalTokenRights memory rentalTokenRights = renterRights[_tokenId][_renter];
        return(rentalTokenRights.canBurn, rentalTokenRights.canTransferToAll, rentalTokenRights.canTransferToPreapproved, rentalTokenRights.canCopyAcrossRights);
    }

    function addPreapprovedRenters(uint _tokenId, address[] _preapprovedList) public {
        require(ownerOf(_tokenId) == msg.sender);
        require(_preapprovedList.length > 0);

        for (uint i = 0; i < _preapprovedList.length; i++) {
            preapprovedRenters[_tokenId][_preapprovedList[i]] = true;
        }
    }

    function removePreapprovedRenters(uint _tokenId, address[] _preapprovedList) public {
        require(ownerOf(_tokenId) == msg.sender);
        require(_preapprovedList.length > 0);

        for (uint i = 0; i < _preapprovedList.length; i++) {
            preapprovedRenters[_tokenId][_preapprovedList[i]] = false;
        }
    }

    function approveRentalTransfer(address _to, uint _tokenId, uint _start, uint _end)
    public
    {
        require(_to != 0x0);
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);

        for (uint i = _startIndex; i < _endIndex; i++) {
            require(rentals[_tokenId][i] == msg.sender);
        }

        for (i = _startIndex; i < _endIndex; i++) {
            rentalTokenApprovals[_tokenId][i] = _to;
        }
        emit RentalTokenApproval(owner, _tokenId, _start, _end, msg.sender, _to);
    }

    function transferRentalFrom(address _from, address _to, uint _tokenId, uint _start, uint _end) public {
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);

        bool isRenter = true;
        bool isRentalTokenApproved = true;

        for (uint i = _startIndex; i < _endIndex; i++) {
            if (rentals[_tokenId][i] != msg.sender) {
                isRenter = false;
            }
            if (rentalTokenApprovals[_tokenId][i] != msg.sender) {
                isRentalTokenApproved = false;
            }
        }
        require(isRenter || isRentalTokenApproved);

        RentalTokenRights memory rentalTokenRights = renterRights[_tokenId][_from];
        require((rentalTokenRights.canBurn && _to == 0x0) ||
        (rentalTokenRights.canTransferToAll) ||
            (rentalTokenRights.canTransferToPreapproved && preapprovedRenters[_tokenId][_to] == true));

        if (rentalTokenRights.canCopyAcrossRights) {
            copyAcrossRights(_tokenId, _from, _to);
        }

        // check if there is intention to rent, unless we are burning the tokens
        if (_to != address(0x0)) {
            require(rentalIntention[_tokenId][_to] == true);
            // charge bondTaken
            bytes32 _propertyHash = bytes32(_tokenId);
            Property memory property = entries[_propertyHash];

            require(token.transferFrom(_to, this, property.tokensAsBond));
            bondTaken[_to][_tokenId] = bondTaken[_to][_tokenId].add(property.tokensAsBond);
        }

        for (i = _startIndex; i < _endIndex; i++) {
            rentals[_tokenId][i] = _to;
        }

        emit TransferRentalFrom(_from, _to, _tokenId, _start, _end);
    }

    function cancelRental(address _from, uint _tokenId, uint _start, uint _end) public {
        transferRentalFrom(_from, 0x0, _tokenId, _start, _end);
    }

    // @dev check availability
    function rentalExists(uint _tokenId, uint _timeIndex) public view returns (bool) {
        return rentals[_tokenId][_timeIndex] != address(0);
    }

    // @dev find renter of token at specific time
    // @param _time: unix time stamp
    function ownerOfRental(uint _tokenId, uint _time)
    public
    view
    returns (address renter)
    {
        uint timeIndex = _time.div(minRentTime);
        renter = rentals[_tokenId][timeIndex];
    }

    // @dev find approved of rental token at specific time
    function approvedOfRental(uint _tokenId, uint _time)
    public
    view
    returns (address renter)
    {
        uint timeIndex = _time.div(minRentTime);
        renter = rentalTokenApprovals[_tokenId][timeIndex];
    }

    // Not working
    function balanceOfRental(address _renter, uint _tokenId, uint _start, uint _end)
    public view returns(uint rentalTokenCount)
    {
        require(_start <= _end);
        uint _startIndex = _start.div(minRentTime);
        uint _endIndex = _end.div(minRentTime);
        rentalTokenCount = 0;
        for (uint i = _startIndex; i < _endIndex; i++) {
            if (address(rentals[_tokenId][i]) == address(_renter)) {
                rentalTokenCount++;
            }
        }
        // return rentalTokenCount;
    }

    // Not working
    function balanceOfRentalApproval(address _approved, uint _tokenId, uint _start, uint _end)
    public view returns(uint)
    {
        uint _startIndex;
        uint _endIndex;
        (_startIndex, _endIndex) = getTimeIndices(_start, _end);

        uint rentalTokenApprovedCount = 0;

        for (uint i = _startIndex; i < _endIndex; i++) {
            if (rentalTokenApprovals[_tokenId][i] == _approved) {
                rentalTokenApprovedCount = rentalTokenApprovedCount + 1;
            }
        }
        return rentalTokenApprovedCount;
    }

    /* Helper functions */
    function hashToInt(bytes32 _propertyHash) public pure returns (uint) {
        return uint(_propertyHash);
    }

    function intToHash(uint _tokenId) public pure returns (bytes32) {
        return bytes32(_tokenId);
    }

    function getTimeIndices(uint _start, uint _end) public view returns (uint startIndex, uint endIndex) {
        require(_start <= _end);
        uint _startIndex = _start.div(minRentTime);
        uint _endIndex = _end.div(minRentTime);
        return (_startIndex, _endIndex);
    }

    // @dev internal check if reservation date is _isFuture
    function isFuture(uint _time) internal view returns (bool future) {
        uint256 _now = now.div(minRentTime);
        return _time > _now;
    }

    function copyAcrossRights(uint _tokenId, address _from, address _to) internal {
        RentalTokenRights memory rentalTokenRightsFrom = renterRights[_tokenId][_from];
        RentalTokenRights storage rentalTokenRightsTo = renterRights[_tokenId][_to];
        rentalTokenRightsTo.canBurn = rentalTokenRightsFrom.canBurn;
        rentalTokenRightsTo.canTransferToAll = rentalTokenRightsFrom.canTransferToAll;
        rentalTokenRightsTo.canTransferToPreapproved = rentalTokenRightsFrom.canTransferToPreapproved;
        rentalTokenRightsTo.canCopyAcrossRights = rentalTokenRightsFrom.canCopyAcrossRights;
    }
}


// ----------------------------------------------------------------------------
// TrustedPropertiesToken
// ----------------------------------------------------------------------------
contract TrustedPropertiesToken is TrustedPropertiesTokenInterface, Owned {
    using SafeMath for uint;

    string public _symbol;
    string public _name;
    uint8 public _decimals;
    uint public _totalSupply;

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;

    constructor(string symbol, string name, uint8 decimals, uint totalSupply) public {
        _symbol = symbol;
        _name = name;
        _decimals = decimals;
        _totalSupply = totalSupply;
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function () public payable {
        revert();
    }

    function symbol() public view returns (string) {
        return _symbol;
    }

    function name() public view returns (string) {
        return _name;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public constant returns (uint) {
        return _totalSupply - balances[address(0)];
    }

    function balanceOf(address tokenOwner) public constant returns (uint balance) {
        return balances[tokenOwner];
    }

    function transfer(address to, uint tokens) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        balances[from] = balances[from].sub(tokens);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        emit Transfer(from, to, tokens);
        return true;
    }

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }

    function approveAndCall(address spender, uint tokens, bytes data) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, tokens, this, data);
        return true;
    }
    // function mint(address tokenOwner, uint tokens) public onlyOwner returns (bool success) {
    //     balances[tokenOwner] = balances[tokenOwner].add(tokens);
    //     _totalSupply = _totalSupply.add(tokens);
    //     emit Transfer(address(0), tokenOwner, tokens);
    //     return true;
    // }

    function burn(address tokenOwner, uint tokens) public onlyOwner returns (bool success) {
        if (tokens > balances[tokenOwner]) {
            tokens = balances[tokenOwner];
        }
        _totalSupply = _totalSupply.sub(tokens);
        balances[tokenOwner] = 0;
        emit Transfer(tokenOwner, address(0), tokens);
        return true;
    }

    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return ERC20Interface(tokenAddress).transfer(owner, tokens);
    }
}


// ----------------------------------------------------------------------------
// TrustedProperties
// ----------------------------------------------------------------------------
contract TrustedProperties is Owned {
    // TODO: create multiple owner/admins to approve property listing
    using SafeMath for uint;
    using Properties for Properties.Data;
    // using Proposals for Proposals.Data;

    // string public name;

    TrustedPropertiesTokenInterface public token;
    Properties.Data public properties;
    // Proposals.Data public proposals;
    bool public initialised;

    uint public tokensToAddNewProperties;
    address public tokenAddress;
    // uint public tokensGivenToNewUser = 500;
    mapping(address => mapping(address => uint)) public balances;

    // uint public quorum = 80;
    // uint public quorumDecayPerWeek = 10;
    // uint public requiredMajority = 70;

    // Must be copied here to be added to the ABI
    event PropertyAdded(address indexed ownerAddress, string name, uint totalAfter);
    event PropertyRemoved(address indexed ownerAddress, string name, uint totalAfter);
    event PropertyNameUpdated(address indexed ownerAddress, string oldName, string newName);
    event TokensDeposited(address depositor, address tokenAddress, uint tokens, uint balanceAfter);
    event TokensToAddNewPropertiesUpdated(uint oldTokens, uint newTokens);
    // event EtherDeposited(address indexed sender, uint amount);
    // event EtherTransferred(uint indexed proposalId, address indexed sender, address indexed recipient, uint amount);

    modifier onlyPropertyOwner (bytes32 _propertyHash) {
        require(properties.isPropertyOwner(msg.sender, _propertyHash));
        _;
    }

    constructor(address _trustedPropertiesToken, uint _tokensToAddNewProperties) public {
        properties.init();
        token = TrustedPropertiesTokenInterface(_trustedPropertiesToken);
        tokenAddress = _trustedPropertiesToken;
        tokensToAddNewProperties = _tokensToAddNewProperties;
    }

    function init() public {
        require(!initialised);
        initialised = true;
    }

    function getPropertyHash(address _propertyOwner, string _propertyLocation) public pure returns (bytes32) {
        bytes32 propertyHash = keccak256(abi.encodePacked(_propertyOwner, _propertyLocation));
        return propertyHash;
    }

    function addProperty(
        address _propertyOwner,
        string _propertyLocation,
        Properties.PropertyType _propertyType,
        Properties.NumberOf _bedrooms,
        Properties.NumberOf _bathrooms,
        Properties.NumberOf _garageSpaces,
        string _comments,
        uint _initialAvailableDate)
    public
    {
        // TODO: implement approveAndCall
        // require(token.approveAndCall(this, tokensToAddNewProperties, ""));
        require(token.transferFrom(msg.sender, this, tokensToAddNewProperties));
        balances[tokenAddress][msg.sender] = balances[tokenAddress][msg.sender].add(tokensToAddNewProperties);
        emit TokensDeposited(msg.sender, tokenAddress, tokensToAddNewProperties, balances[tokenAddress][msg.sender]);
        properties.add(_propertyOwner, _propertyLocation, _propertyType,
            _bedrooms, _bathrooms, _garageSpaces, _comments, _initialAvailableDate);
    }

    function removeProperty(
        bytes32 _propertyHash)
    public
    onlyPropertyOwner(_propertyHash)
    {
        properties.remove(_propertyHash);
    }

    /* function transferProperty(
        address _propertyOwner,
        string _propertyLocation)
        public
        onlyPropertyOwner(_propertyLocation)
    { // solhint-disable-line

        // TODO: Implementation

    } */
    function updateInitialAvailableDate(
        bytes32 _propertyHash,
    /* address _propertyOwner,
    string _propertyLocation, */
        uint _initialAvailableDate)
    public
    onlyPropertyOwner(_propertyHash)
    {
        require(_initialAvailableDate > 0);
        /* bytes32 propertyHash = keccak256(abi.encodePacked(_propertyOwner, _propertyLocation)); */
        Properties.Property storage property = properties.entries[_propertyHash];
        property.initialAvailableDate = _initialAvailableDate;
    }

    // function setPropertyLocation(string propertyLocation) public {
    //     properties.setLocation(msg.sender, propertyLocation);
    // }
    function numberOfProperties() public view returns (uint) {
        return properties.length();
    }

    function getProperties() public view returns (bytes32[]) {
        return properties.index;
    }

    function getPropertyData(
        bytes32 _propertyHash
    /* address _ownerAddress,
    string _propertyLocation */
    )
    public
    view
    returns (
        bool exists,
        uint index,
        address owner,
        string location,
        Properties.PropertyType propertyType,
        Properties.NumberOf bedrooms,
        Properties.NumberOf bathrooms,
        Properties.NumberOf garageSpaces,
        string comments,
        uint initialAvailableDate)
    {
        /* bytes32 propertyHash = keccak256(abi.encodePacked(_ownerAddress, _propertyLocation)); */
        Properties.Property memory property = properties.entries[_propertyHash];
        return (property.exists, property.index, property.owner, property.location, property.propertyType,
        property.bedrooms, property.bathrooms, property.garageSpaces, property.comments,
        property.initialAvailableDate);
    }

    function getPropertyByIndex(uint _index) public view returns (bytes32 property) {
        return properties.index[_index];
    }

}
