import React from 'react';
import '../assets/css/dashboard.css';
import Navbar from '../components/NavBar';
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

const Dashboard= () => {

    const {user} = useSelector(state=>state?.auth);

    return (
        <div>
            <Navbar/>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1>
                            <strong className={"text-white fw-bold"}>Hello {user?.userName}, Welcome back</strong>
                        </h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <Link to="/owner" className="tile purple">
                            <h3 className="title">Owner</h3>
                            <p>Continue as property owner.</p>
                        </Link>
                    </div>
                    <div className="col-sm-4">
                        <Link to="/tenant" className="tile orange">
                            <h3 className="title">Tenant</h3>
                            <p>Continue as tenant.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
