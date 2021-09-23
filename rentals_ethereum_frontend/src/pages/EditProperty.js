import React, {useState} from 'react';
import Navbar from "../components/NavBar";
import {api, CREATE_NEW_PROPERTY} from "../services/api";
import {useDispatch} from "react-redux";
import {fetchProperty} from "../slices/Property.slice";
import {Link, useLocation} from "react-router-dom";

const EditProperty = () => {

    const dispatch = useDispatch();

    const location = useLocation();

    const item = location.state;

    const [availability] = useState(true);
    const [propertyId,setPropertyId] = useState(item?.propertyId);
    const [propertyName, setPropertyName] = useState(item?.propertyName);
    const [houseNo, setHouseNo] = useState(item?.houseNo);
    const [flatNo, setFlatNo] = useState(item?.flatNo);
    const [street, setStreet] = useState(item?.street);
    const [address, setAddress] = useState(item?.address);
    const [pincode, setPincode] = useState(item?.pincode);
    const [floor, setFloor] = useState(item?.floor);
    const [kyc, setKyc] = useState(item?.KYC);
    const [latitude, setLatitude] = useState(item?.latitude);
    const [longitude, setLongitude] = useState(item?.longitude);
    const [rentPerMonth, setRentPerMonth] = useState(item?.rentPerMonth);
    const [securityDepositAmount, setSecurityDepositAmount] = useState(item?.securityDepositAmount);

    const submit = async (e) => {
        e.preventDefault();
        if (!propertyName?.length) {
            alert("Please enter property name");
            return false;
        }
        if (!houseNo) {
            alert("Please enter house no");
            return false;
        }
        if (!street?.length) {
            alert("Please enter street");
            return false;
        }
        if (!address?.length) {
            alert("Please enter address");
            return false;
        }
        if (!pincode) {
            alert("Please enter Pincode");
            return false;
        }
        if (!floor) {
            alert("Please enter floor");
            return false;
        }
        if (!latitude?.length) {
            alert("Please enter latitude");
            return false;
        }
        if (!longitude?.length) {
            alert("Please enter longitude");
            return false;
        }
        if (!rentPerMonth) {
            alert("Please enter rent per month");
            return false;
        }
        if (!securityDepositAmount) {
            alert("Please enter security deposit amount ");
            return false;
        }



        const params = {
            "availability":true,
            "propertyName" : propertyName,
            "houseNo" : houseNo,
            "flatNo" : flatNo,
            "street" : street,
            "address" : address,
            "pincode" : pincode,
            "floor" : floor,
            "KYC" : kyc,
            "latitude" : latitude?.toString(),
            "longitude" : longitude?.toString(),
            "rentPerMonth": rentPerMonth,
            "securityDepositAmount": securityDepositAmount
        }

        try {
            const response = await api.patch(CREATE_NEW_PROPERTY+'/'+propertyId, params);
            if(response.status===200)
            {
                dispatch(fetchProperty());
                alert('property updated successfully');

            }
        }
        catch (e)
        {

        }
    }
    return (
        <div>
            <Navbar/>
            <div className="container my-5">
                <div className="row my-2">
                    <div className="col-md-12">
                        <nav className="text-white" aria-label="breadcrumb">
                            <ol className="breadcrumb text-white fw-bold">
                                <li className="breadcrumb-item"><Link className="text-white fw-bold" to="/">Home</Link></li>
                                <li className="breadcrumb-item"><Link className="text-white fw-bold" to="/owner">Owner</Link></li>
                                <li className="breadcrumb-item"><Link className="text-white fw-bold" to="/owner/my-property-list">Property Listing</Link></li>
                                <li className="breadcrumb-item active text-white fw-bold" aria-current="page">Edit Property</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <form onSubmit={submit} className="g-3 needs-validation" noValidate>
                    <div className="card">
                        <div className="card-header bg-warning">
                            <h6 className="text-white fw-bold">Edit Property</h6>
                        </div>
                        <div className="card-body">

                            <div className="row my-1">
                                <div className="col-md-8">
                                    <label htmlFor="propertyName" className="form-label">Property Name</label>
                                    <input type="text" className="form-control" name="propertyName" id="propertyName"
                                             value={propertyName}
                                           onChange={e => setPropertyName(e.target.value)} required/>
                                    <div className="invalid-feedback">
                                        Please enter property name
                                    </div>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-md-4">
                                    <label htmlFor="houseNo" className="form-label">House No</label>
                                    <input type="text" className="form-control" name={"houseNo"} id="houseNo"
                                           value={houseNo}
                                           onChange={e => setHouseNo(parseInt(e.target.value))}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please enter house no.
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="flatNo" className="form-label">Flat No</label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text" id="inputGroupPrepend">@</span>
                                        <input type="text" className="form-control" name={"flatNo"} id="flatNo"
                                               value={flatNo}
                                               aria-describedby="inputGroupPrepend"
                                               onChange={e => setFlatNo(e.target.value)}
                                               required/>
                                        <div className="invalid-feedback">
                                            Please enter flat no.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="floor" className="form-label">Floor No</label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text" id="inputGroupPrepend">@</span>
                                        <input type="text" className="form-control" name="floor" id="floor"
                                               aria-describedby="inputGroupPrepend"
                                               value={floor}
                                               onChange={e => setFloor(parseInt(e.target.value))}
                                               required/>
                                        <div className="invalid-feedback">
                                            Please enter floor no.
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="kyc" className="form-label">KYC</label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text" id="inputGroupPrepend">@</span>
                                        <input type="text" className="form-control" name="kyc" id="kyc"
                                               value={kyc}
                                               aria-describedby="inputGroupPrepend"
                                               onChange={e => setKyc(e.target.value)}
                                               required/>
                                        <div className="invalid-feedback">
                                            Please enter kyc no.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row my-1">
                                <div className="col-md-4">
                                    <label htmlFor="street" className="form-label">Street</label>
                                    <input type="text" className="form-control" name={"street"} id="street"
                                           value={street}
                                           onChange={e => setStreet(e.target.value)}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please provide a valid city.
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="address" className="form-label">Address</label>
                                    <textarea type="text" className="form-control" name={"address"} id="address"
                                              value={address}
                                              onChange={e => setAddress(e.target.value)}
                                              required/>
                                    <div className="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                            </div>

                            <div className="row my-1">
                                <div className="col-md-4">
                                    <label htmlFor="pincode" className="form-label">Pincode</label>
                                    <input type="text" className="form-control" name={"pincode"} id="pincode"
                                           value={pincode}
                                           onChange={e => setPincode(parseInt(e.target.value))}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please provide a valid zip.
                                    </div>
                                </div>

                            </div>

                            <div className="row my-1">
                                <div className="col-md-4">
                                    <label htmlFor="latitude" className="form-label">latitude</label>
                                    <input type="text" className="form-control" name={"latitude"} id="latitude"
                                           value={latitude}
                                           onChange={e => setLatitude(e.target.value)}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please provide a valid zip.
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="longitude" className="form-label">Longitude</label>
                                    <input type="text" className="form-control" name={"longitude"} id="longitude"
                                           value={longitude}
                                           onChange={e => setLongitude(e.target.value)}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please provide a valid zip.
                                    </div>
                                </div>

                            </div>

                            <div className="row my-1">
                                <div className="col-md-4">
                                    <label htmlFor="rentPerMonth" className="form-label">Rent/Month</label>
                                    <input type="text" className="form-control" name={'rentPerMonth'} id="rentPerMonth"
                                           value={rentPerMonth}
                                           onChange={e => setRentPerMonth(parseFloat(e.target.value))}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please provide a valid zip.
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="securityDeposit" className="form-label">Security Deposit</label>
                                    <input type="text" className="form-control" id="securityDeposit"
                                           value={securityDepositAmount}
                                           onChange={e => setSecurityDepositAmount(parseFloat(e.target.value))}
                                           required/>
                                    <div className="invalid-feedback">
                                        Please provide a valid zip.
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="card-footer bg-warning">
                            <button className="btn btn-primary text-white fw-bold" type="submit">Update Property</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default EditProperty;
