import React, {useState} from 'react';
import '../assets/css/my-property.css';
import Navbar from "../components/NavBar";
import {Link, useLocation} from "react-router-dom";
import {api, CREATE_RENTAL_REQUEST} from "../services/api";
import LoginModal from "../components/LoginModal";
import {useSelector} from "react-redux";
const Property = () => {
    let location = useLocation();
    const [item] = useState(location.state);

    const [isVisible,setIsVisible] = useState(false);

    const {user} = useSelector(state=>state?.auth);

    const sendRentalRequest = async propertyId =>{

        try {
            const response = await api.post(CREATE_RENTAL_REQUEST,{propertyId});
            if(response.status===200)
            {
                alert("rent request sent successfully");
            }
        }
        catch (e)
        {
            if(!user)
            {
                setIsVisible(true);
            }
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
                                <li className="breadcrumb-item active text-white fw-bold" aria-current="page">Property View</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h6>Property Title : {item?.propertyName}</h6>
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
            <LoginModal isVisible={isVisible} setIsVisible={setIsVisible} propertyId={item?.propertyId}/>
        </div>
    );
}
export default Property;
