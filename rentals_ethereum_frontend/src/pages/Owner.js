import React from 'react';
import '../assets/css/owner.css';

import Navbar from '../components/NavBar';
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

const Owner= () => {

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
                                <li className="breadcrumb-item active text-white fw-bold" aria-current="page">Owner</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <h6>
                            <strong className={"text-white fw-bold"}>Hello {user?.userName}, Welcome back you are accessing as owner</strong>
                        </h6>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <Link to="/owner/my-property-list" className="tile green">
                            <h3 className="title">My Properties</h3>
                            <p>Your Property list is here.</p>
                        </Link>
                    </div>
                    <div className="col-sm-4">
                        <Link to="/owner/post-new-property" className="tile purple">
                            <h3 className="title">Post a Property</h3>
                            <p>You can post your property using this menu</p>
                        </Link>
                    </div>
                    <div className="col-sm-4">
                        <Link to="/owner/rental-requests" className="tile orange">
                            <h3 className="title">Rental Requests</h3>
                            <p>List of all property agreements.</p>
                        </Link>
                    </div>
                    {/*<div className="col-sm-4">
                        <Link to="/owner/my-agreements" className="tile orange">
                            <h3 className="title">My Agreements</h3>
                            <p>List of all property agreements.</p>
                        </Link>
                    </div>*/}
                </div>
            </div>
        </div>
    );
}

export default Owner;
