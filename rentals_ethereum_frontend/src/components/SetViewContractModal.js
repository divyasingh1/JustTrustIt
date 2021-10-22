import React, {useState} from 'react';
import {Modal,Button} from "react-bootstrap";
import {api, GET_CONTRACT_DETAILS} from "../services/api";
import {useDispatch} from "react-redux";
import {fetchProperty} from "../slices/Property.slice";



const SetRentModal = ({isViewContractVisible,setIsViewContractVisible,selectedPropertyId})=> {


    //const dispatch = useDispatch();

    const setViewContractRequest = async (id)=> {
        try {
            const params = {
                   "securityDeposit":500,
                   "rentAmount":400
            };
            const response = await api.get(GET_CONTRACT_DETAILS+id);
            if(response.status===200)
            {
                //dispatch(fetchProperty());
                alert("Populating contract.");
            }
            //setIsSetRentVisible(false);
        }
        catch (e)
        {

            alert(e.toString());
        }

    }

    return (
        <Modal show={isViewContractVisible} onHide={()=>setIsViewContractVisible(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Contract Details </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row my-1">
                    <div className="col-md-12">
                        <p>Will get you details from blockchain!!! Do you want to proceed?</p>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={()=>setIsViewContractVisible(false)} variant="secondary">Cancel</Button>
                <Button onClick={()=>setViewContractRequest(selectedPropertyId)} variant="primary">Proceed</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SetRentModal;
