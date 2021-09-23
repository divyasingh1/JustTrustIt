import React from 'react';
import '../assets/css/tenant.css';

import Navbar from '../components/NavBar';
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

const Tenant= () => {

    const {user} = useSelector(state=>state?.auth);

    return (
        <div>
            <Navbar/>
            <div className="container">
                <div className="row my-2">
                    <div className="col-md-12">
                        <nav className="text-white" aria-label="breadcrumb">
                            <ol className="breadcrumb text-white fw-bold">
                                <li className="breadcrumb-item"><Link className="text-white fw-bold" to="/">Home</Link></li>
                                <li className="breadcrumb-item active text-white fw-bold" aria-current="page">Tenant</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <h6>
                            <strong className={"text-white fw-bold"}>Hello {user?.userName}, Welcome back</strong>
                        </h6>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <Link to="/tenant/property-listing" className="tile purple">
                            <h3 className="title">Search Properties</h3>
                            <p>Checkout listings in our website.</p>
                        </Link>
                    </div>
                    <div className="col-sm-4">
                        <Link to="/tenant/rental-requests" className="tile orange">
                            <h3 className="title">Rental Request</h3>
                            <p>List of all property agreements.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tenant;
