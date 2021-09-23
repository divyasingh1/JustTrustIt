import React, {useState} from 'react';
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import axios from "axios";
import {api, CREATE_RENTAL_REQUEST, USER_LOGIN} from "../services/api";
import {setToken, setUser} from "../services/storage";
import {setAuthUser} from "../slices/Auth.slice";

function LoginModal({isVisible, setIsVisible,propertyId}) {

    const dispatch = useDispatch();
    const [publicKey, setPublicKey] = useState(null);

    const sendRentalRequest = async () =>{

        try {
            const response = await api.post(CREATE_RENTAL_REQUEST,{propertyId});
            if(response.status===200)
            {
                alert("rent request sent successfully");
            }
        }
        catch (e)
        {
            console.log(e);
        }
    }


    const login = async () => {
        if (!publicKey) {
            alert("please enter public key");
            return false;
        }


        const params = {publicKey};

        try {
            const response = await axios.get(USER_LOGIN, {params});
            if (response.status === 200) {
                const result = response.data;
                if (result.status === "SUCCESS") {

                    const filtered = result?.data.filter(function (e) {
                        return e.publicKey?.toString() === publicKey?.toString();
                    });
                    setUser(filtered[0]);
                    setToken(filtered[0]?.publicKey);
                    dispatch(setAuthUser(filtered[0]));
                    setIsVisible(false);
                    sendRentalRequest().then(()=>{});
                } else {
                    alert(result.message);
                }
            } else {
                alert(response?.message);
            }
        } catch (e) {
            alert(e.toLocaleString());
        }


    }

    const handleClose = () => setIsVisible(false);
    return (
        <>
            <Modal show={isVisible} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Please Login to continue</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <div className="form-group">
                                    <span className="my-1">
                                    <label htmlFor="publicKey">Public Key</label>
                                    </span>
                            <input type="text" name="publicKey" id="publicKey"
                                   onChange={e => setPublicKey(e.target.value)} className="form-control"
                                   placeholder=""/>
                        </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button type="submit" variant="primary" onClick={()=>login()}>
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}


export default LoginModal;
