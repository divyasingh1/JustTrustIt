import React, {useState} from 'react';
import '../assets/css/property-view.css';
import Navbar from "../components/NavBar";
import {Link, useLocation} from "react-router-dom";
import RentalRequestModal from "../components/RentalRequestModal";
const PropertyView = () => {
    let location = useLocation();
    const [item] = useState(location.state);
    const [isRentalRequestModalVisible,setIsRentalRequestModalVisible] = useState(false);


    const sendRentalRequest = async () =>{
        setIsRentalRequestModalVisible(true);
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
                                <li className="breadcrumb-item"><Link className="text-white fw-bold" to="/tenant">Tenant</Link></li>
                                <li className="breadcrumb-item" aria-current="page"><Link className="text-white fw-bold" to="/tenant/property-listing">Property List</Link></li>
                                <li className="breadcrumb-item active text-white fw-bold" aria-current="page">Property View</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h6>Property Title</h6>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8">
                                <table className="table table-striped table-borderless">
                                    <tbody>
                                    <tr>
                                        <th>Unit No.</th>
                                        <td>{item?.unitNumber}</td>
                                    </tr>
                                    <tr>
                                        <th>Rooms</th>
                                        <td>{item?.rooms}</td>
                                    </tr>
                                    <tr>
                                        <th>Bathrooms</th>
                                        <td>{item?.bathrooms}</td>
                                    </tr>
                                    <tr>
                                        <th>Parking</th>
                                        <td>{item?.parking}</td>
                                    </tr>
                                    <tr>
                                        <th>Location</th>
                                        <td>{item?.location}</td>
                                    </tr>
                                    <tr>
                                        <th>Pincode</th>
                                        <td>{item?.pincode}</td>
                                    </tr>
                                    <tr>
                                        <th>Initial Available Date</th>
                                        <td>{item?.initialAvailableDate}</td>
                                    </tr>
                                    <tr>
                                        <th>Property Type</th>
                                        <td>{item?.propertyType}</td>
                                    </tr>
                                    <tr className={item?.availability ? 'bg-success' : 'bg-danger'}>
                                        <th className="text-white">Availability</th>
                                        <td className="text-white">{item?.availability ? 'Available' : 'Not Available'}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-4">
                                <div className="my-5">
                                    {
                                        item?.availability && <button onClick={()=>sendRentalRequest(item?.propertyId)} className="btn btn-success btn-lg">Sent Rental Request</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                isRentalRequestModalVisible && <RentalRequestModal isVisible={isRentalRequestModalVisible} setIsVisible={setIsRentalRequestModalVisible} propId={item?.propertyId}/>
            }

        </div>
    );
}
export default PropertyView;
