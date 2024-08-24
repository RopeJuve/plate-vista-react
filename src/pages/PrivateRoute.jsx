import { useNavigate } from "react-router-dom";


const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
    const auth = false;// need to implement auth
    const role = 'admin';// need to implement role
    const navigate = useNavigate();
    //if we have token in the context fetch the GETauth/user API (useEffect) and get the role of the user
    if(!auth && !allowedRoles.includes(role)) {
        navigate('/login');
    }


    return <Component {...rest} />;
};

export default PrivateRoute;