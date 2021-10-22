import React, {useState} from 'react';
import {Modal,Button} from "react-bootstrap";
import {api, CREATE_RENTAL_REQUEST} from "../services/api";
import { useSelector} from "react-redux";



const RentalRequestModal = ({isVisible,setIsVisible,propId})=> {
    const {user} = useSelector(state=>state?.auth);
    const [duration,setDuration] = useState(0);


    const sendRentalRequest = async propertyId =>{

        try {
            if(!duration)
            {
                alert("Please enter the rent duration in month");
                return false;
            }
            const response = await api.post(CREATE_RENTAL_REQUEST,{propertyId,duration});
            if(response.status===200)
            {
                setIsVisible(false);
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
        <Modal show={isVisible} onHide={()=>setIsVisible(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Send Rental Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row my-1">
                    <div className="col-md-4">
                        <label htmlFor="duration" className="form-label">Duration</label>
                        <input type="text" className="form-control" name={"duration"} id="duration"
                               onChange={e => setDuration(parseInt(e.target.value))}
                               required/>
                        <div className="invalid-feedback">
                            Please enter rental request
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={()=>setIsVisible(false)} variant="secondary">Cancel</Button>
                <Button onClick={()=>sendRentalRequest(propId)} variant="primary">Send Request</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RentalRequestModal;
