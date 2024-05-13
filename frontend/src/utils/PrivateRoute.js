import React from 'react'
import { Navigate } from "react-router-dom"
import { useContext } from 'react';
import AuthContext from '../context/Auth';

const PrivateRoute = ({ children, ...rest}) => {
	let { user } = useContext(AuthContext);
    
    return user ? children : <Navigate to="/login"/>;
}

export default PrivateRoute;