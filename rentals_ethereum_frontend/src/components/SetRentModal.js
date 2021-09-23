import React, {useState} from 'react';
import {Modal,Button} from "react-bootstrap";
import {api, SET_RENT_AMOUNT} from "../services/api";
import {useDispatch} from "react-redux";
import {fetchProperty} from "../slices/Property.slice";



const SetRentModal = ({isSetRentVisible,setIsSetRentVisible,selectedPropertyId})=> {


    const dispatch = useDispatch();

    const [securityDeposit,setSecurityDeposit]  = useState(0);
    const [rentAmount,setRentAmount]  = useState(0);
    const setRentRequest = async (id)=> {
        try {

            if(!securityDeposit)
            {
                alert("Enter security deposit amount");
                return false;
            }
            if(!rentAmount)
            {
                alert("Enter rent amount");
                return false;
            }

            const params = {
                   "securityDeposit":securityDeposit,
                   "rentAmount":rentAmount
            };
            const response = await api.post(SET_RENT_AMOUNT+id,params);
            if(response.status===200)
            {
                dispatch(fetchProperty());
                alert("Rental updated successfully");
            }
            setIsSetRentVisible(false);
        }
        catch (e)
        {

            alert(e.toString());
        }

    }

    return (
        <Modal show={isSetRentVisible} onHide={()=>setIsSetRentVisible(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Set Rent </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row my-1">
                    <div className="col-md-4">
                        <label htmlFor="securityDeposit" className="form-label">Security Deposit</label>
                        <input type="text" className="form-control" name={"securityDeposit"} id="securityDeposit"
                               onChange={e => setSecurityDeposit(parseInt(e.target.value))}
                               required/>
                        <div className="invalid-feedback">
                            Please enter security deposit
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label htmlFor="rentAmount" className="form-label">Rent Amount</label>
                        <input type="text" className="form-control" name={"rentAmount"} id="rentAmount"
                               onChange={e => setRentAmount(parseInt(e.target.value))}
                               required/>
                        <div className="invalid-feedback">
                            Please enter rent amount
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={()=>setIsSetRentVisible(false)} variant="secondary">Cancel</Button>
                <Button onClick={()=>setRentRequest(selectedPropertyId)} variant="primary">Set Rent</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SetRentModal;
