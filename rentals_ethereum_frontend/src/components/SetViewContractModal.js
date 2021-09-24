import React, {useState} from 'react';
import {Modal,Button} from "react-bootstrap";
import {api, GET_CONTRACT_DETAILS} from "../services/api";

const SetViewContractModal = ({isViewContractVisible,setIsViewContractVisible,selectedContractId})=> {

    const [responseData,setResponseData] = useState({
        property_id: '',
        owner: '',
        tenant: '',
        security_deposit: '',
        rent_amount: '',
        start_date: '',
        duration: ''
    });

    const setViewContractRequest = async (contractId)=> {
        try {
            const response = await api.get(GET_CONTRACT_DETAILS+contractId);
            if(response.status===200)
            {
                alert("FETCHING DATA FROM BLOCKCHAIN : "+response.data.status);
                var result = response.data.data;
                setResponseData({property_id: result.property_id,
                                         owner: result.owner,
                                         tenant: result.tenant,
                                         security_deposit: result.security_deposit,
                                         rent_amount: result.rent_amount,
                                         start_date: result.start_date,
                                         duration: result.duration});
            }
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
                        {
                        responseData.property_id != '' ?
                           <>
                        <table class="table">

                                          <tbody>
                                            <tr>
                                              <th>PROPERTY_ID</th>
                                              <td scope="row">{responseData.property_id}</td>
                                            </tr>
                                            <tr>
                                              <th>OWNER</th>
                                              <td scope="row">{responseData.owner}</td>
                                            </tr>
                                            <tr>
                                              <th>TENANT</th>
                                              <td scope="row">{responseData.tenant}</td>
                                            </tr>
                                            <tr>
                                              <th>DURATION</th>
                                              <td scope="row">{responseData.duration} months</td>
                                            </tr>
                                            <tr>
                                              <th>SECURITY_AMOUNT</th>
                                              <td scope="row">Rs {responseData.security_deposit}</td>
                                            </tr>
                                            <tr>
                                              <th>RENT_AMOUNT</th>
                                              <td scope="row">Rs {responseData.rent_amount}</td>
                                            </tr>
                                            <tr>
                                              <th>START_DATE</th>
                                              <td scope="row">2021-09-25</td>
                                            </tr>
                                          </tbody>
                                        </table>
                        </>
                        :
                        <p>Will get you details from blockchain!!! Do you want to proceed?</p>
                        }
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={()=>setIsViewContractVisible(false)} variant="secondary">Cancel</Button>
                <Button onClick={()=>setViewContractRequest(selectedContractId)} variant="primary">Proceed</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SetViewContractModal;
