import React from 'react';
import {Modal,Button} from "react-bootstrap";
import {api, APPROVE_RENTAL_REQUEST} from "../services/api";
import {fetchOwnerRentalRequests} from "../slices/RentalRequest.slice";
import {useDispatch} from "react-redux";



const ConfirmRentalRequestModal = ({isVisible,setIsVisible,requestId})=> {

    const dispatch = useDispatch();
    const approveRequest = async id=> {
        try {
            const response = await api.patch(APPROVE_RENTAL_REQUEST+'/'+id);
            if(response.status===200)
            {
                dispatch(fetchOwnerRentalRequests());
                alert("Rental Request Approved");
            }
            setIsVisible(false);
        }
        catch (e)
        {
            alert(e.toString());
        }

    }

    return (
        <Modal show={isVisible} onHide={()=>setIsVisible(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Rental Request Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to confirm this rental request.</p>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={()=>setIsVisible(false)} variant="secondary">No</Button>
                <Button onClick={()=>approveRequest(requestId)} variant="primary">Yes</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmRentalRequestModal;
