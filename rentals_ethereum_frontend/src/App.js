import React, {useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./pages/Login";

import Owner from './pages/Owner';
import Tenant from './pages/Tenant';

import PropertyListing from './pages/PropertyListing';
import PropertyView from './pages/PropertyView';
import MyPropertyView from './pages/MyPropertyView';
import PostProperty from './pages/PostProperty';
import MyProperties from './pages/MyProperties';
import EditProperty from "./pages/EditProperty";
import OwnerRentalRequest from "./pages/OwnerRentalRequest";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {getUser} from "./services/storage";
import {setAuthUser} from "./slices/Auth.slice";
import TenantRentalRequest from "./pages/TenantRentalRequest";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Property from "./pages/Property";

function App() {


    const dispatch = useDispatch();
    const {user} = useSelector(state => state?.auth);
    const [isAppReady,setIsAppReady] = useState(false);

    useEffect(() => {
        if (!user || !Object.keys(user)?.length) {
            const authUser = getUser();
            if (authUser?.publicKey) {
                dispatch(setAuthUser(authUser));
            }
        }

        return setIsAppReady(true);
    }, []);

    if(isAppReady)
    {
        if (user && (Object.keys(user)?.length>0)) {



            return (
                <Router>
                    <Switch>
                        <Route exact path="/dashboard">
                            <Dashboard/>
                        </Route>
                        <Route exact path="/owner">
                            <Owner/>
                        </Route>
                        <Route exact path="/tenant">
                            <Tenant/>
                        </Route>
                        <Route exact path="/tenant/property-listing">
                            <PropertyListing/>
                        </Route>
                        <Route exact path="/tenant/property-view">
                            <PropertyView/>
                        </Route>
                        <Route exact path="/owner/my-property-view">
                            <MyPropertyView/>
                        </Route>
                        <Route exact path="/owner/post-new-property">
                            <PostProperty/>
                        </Route>
                        <Route exact path="/owner/my-property-list">
                            <MyProperties/>
                        </Route>
                        <Route exact path="/owner/edit/property">
                            <EditProperty/>
                        </Route>
                        <Route exact path="/owner/rental-requests">
                            <OwnerRentalRequest/>
                        </Route>
                        <Route exact path="/tenant/rental-requests">
                            <TenantRentalRequest/>
                        </Route>

                        <Route exact path="/view/property">
                            <Property/>
                        </Route>

                        <Route exact path="/">
                            <Home/>
                        </Route>

                    </Switch>
                </Router>
            );


        }
        else
        {
            return (<Router>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route exact path="/view/property">
                        <Property/>
                    </Route>
                    <Route exact path="/login">
                        <Login/>
                    </Route>
                </Switch>
            </Router>)
        }
    }
    else
    {
        return (<div>
            <h6>Loading</h6>
        </div>)
    }


}

export default App;
