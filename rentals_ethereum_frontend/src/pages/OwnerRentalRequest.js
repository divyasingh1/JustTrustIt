import React, {useEffect, useState} from 'react';
import '../assets/css/owner.css';
import Navbar from '../components/NavBar';
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {getUser} from "../services/storage";
import {fetchOwnerRentalRequests} from "../slices/RentalRequest.slice";
import ConfirmRentalRequestModal from "../components/ConfirmRentalRequestModal";
const OwnerRentalRequest = () => {

    const dispatch = useDispatch();
    const [requests, setRequests] = useState([]);
    const {ownerRentalRequests} = useSelector(state=>state?.rentalRequests);
    const user = getUser();

    const [isVisible,setIsVisible] = useState(false);
    const [requestId,setRequestId] = useState('');

    useEffect(() => {
        dispatch(fetchOwnerRentalRequests());
    }, [])

    useEffect(() => {

        if (ownerRentalRequests?.length > 0) {
            let list = ownerRentalRequests.filter(el => {
                return el?.ownerUserId === user?.userId
            });

            setRequests(list);
        }

    }, [ownerRentalRequests])

    const approveRequest = async (visibility,id)=>{
          setRequestId(id);
          setIsVisible(true);
    }


    return (
        <div>
            <Navbar/>
            <div className="container my-5">

                <div className="row my-2">
                    <div className="col-md-12">
                        <nav className="text-white" aria-label="breadcrumb">
                            <ol className="breadcrumb text-white fw-bold">
                                <li className="breadcrumb-item"><Link className="text-white fw-bold" to="/">Home</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link className="text-white fw-bold" to="/owner">Owner</Link>
                                </li>
                                <li className="breadcrumb-item active text-white fw-bold" aria-current="page">Rental Requests</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <h4 className={"text-white fw-bold"}> Rental Requests</h4>
                <div className={"row"}>
                    <div className="col-12">

                        <div>
                            <table className="table table-bordered table-hover bg-white">
                                <thead>
                                 <tr>
                                     <th>Request Id</th>
                                     <th>Property Id</th>
                                     <th>Tenant Id</th>
                                     <th>Request Date</th>
                                     <th>Action</th>

                                 </tr>
                                </thead>
                                <tbody>
                                {
                                    requests?.length > 0 ? requests.map(item => {
                                        return (
                                            <tr key={Math.random()}>
                                                <td>{item?.rentalRequestId}</td>
                                                <td>{item?.propertyId}</td>
                                                <td>{item?.tenantUserId}</td>
                                                <td>{item?.createdAt}</td>
                                                <td>
                                                    {
                                                        item?.requestApprovalDone ==='true'?'Approved':<button onClick={()=>approveRequest(isVisible,item?.rentalRequestId)} className="btn btn-info text-white fw-bold">Approve</button>
                                                    }

                                                </td>


                                            </tr>
                                        )
                                    }) : <tr>
                                        <td>No data found</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>

                                    </tr>
                                }
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>
            {
                isVisible && <ConfirmRentalRequestModal requestId={requestId} isVisible={isVisible} setIsVisible={setIsVisible}/>

            }

        </div>
    );
}

export default OwnerRentalRequest;
