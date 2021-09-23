import React, {useState} from 'react';
import '../assets/css/login.css';
import axios from "axios";
import {setAuthUser} from "../slices/Auth.slice";
import {useDispatch} from "react-redux";
import {setToken, setUser} from "../services/storage";
import {USER_LOGIN} from '../services/api'
import {useHistory} from "react-router-dom";

function Login() {

    const dispatch = useDispatch();
    const history = useHistory();
    const [publicKey,setPublicKey] = useState(null);

    const login = async (event)=> {
        event.preventDefault();
        if(!publicKey)
        {
            alert("please enter public key");
            return false;
        }


        const params = {publicKey};

        try
        {
            const response = await axios.get(USER_LOGIN, {params});
            if(response.status===200)
            {
                const result = response.data;
                if(result.status==="SUCCESS")
                {

                    const filtered = result?.data.filter(function(e){
                        return e.publicKey?.toString() === publicKey?.toString();
                    });
                    console.log(filtered[0]);
                    setUser(filtered[0]);
                    setToken(filtered[0]?.publicKey);
                    dispatch(setAuthUser(filtered[0]));
                    history.push('/');
                }
                else
                {
                    alert(result.message);
                }
            }
            else
            {
                alert(response?.message);
            }
        }
        catch (e)
        {
            alert(e.toLocaleString());
        }


    }
    return (
        <div className="container">
            <div className="row justify-content-center my-5">
                <div className="col-md-5">
                    <div className="auth-wrapper">
                        <div className="auth-inner">
                            <form onSubmit={login} autoComplete="off">
                                <h3>Welcome Back !</h3>
                                <div className="form-group">
                                    <span className="my-1">
                                    <label htmlFor="publicKey">Public Key</label>
                                    </span>
                                    <input type="text" name="publicKey" id="publicKey" onChange={e=>setPublicKey(e.target.value)} className="form-control"
                                           placeholder=""/>
                                </div>
                                <div className="my-2">
                                    <button  className="btn btn-primary btn-block">Login</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Login;
