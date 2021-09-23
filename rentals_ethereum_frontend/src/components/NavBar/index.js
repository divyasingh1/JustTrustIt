import React, {useEffect} from 'react';
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {removeAuthUSer, setAuthUser} from "../../slices/Auth.slice";
import {getUser} from "../../services/storage";
import {api, FETCH_USER_URL} from "../../services/api";
import { useHistory } from "react-router-dom";
function Index () {

    const dispatch = useDispatch();
    const history = useHistory();

    const {user} = useSelector(state => state?.auth);

    useEffect(() => {
        (async ()=>{
            await getAuthUser()
        })();
    }, [])

    const getAuthUser = async ()=>{
        const response = await api.get(FETCH_USER_URL);
        if(response.status===200)
        {
            const authUser = getUser();
            if(authUser?.publicKey)
            {
                const {data} =  response.data;
                const filtered = data.filter(function(e){
                    return e.publicKey?.toString() === authUser?.publicKey?.toString();
                });
                console.log(filtered);
                dispatch(setAuthUser(filtered[0]));
            }
        }
    }

    const logout = ()=>{
        localStorage.clear();
        dispatch(removeAuthUSer());
        history.push('/login');
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light mx-0">
            <div className="container">
                <Link className="navbar-brand" to={"/"}>Trusted Properties</Link>
                <div className="collapse navbar-collapse" id="navbarToggle">
                    <ul className="navbar-nav mr-auto">
                        {
                            user && Object.values(user)?.length ? <>
                             <li className="nav-item">
                                <Link to={"/dashboard"}   className="nav-link fw-bold">DashBoard</Link>
                            </li> <li className="nav-item">
                                <button  onClick={()=>logout()}  className="nav-link fw-bold text-danger">Log Out</button>
                            </li> </>: <li className="nav-item">
                                <Link className="nav-link fw-bold" to={"/login"}>Login</Link>
                            </li>
                        }


                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Index;
