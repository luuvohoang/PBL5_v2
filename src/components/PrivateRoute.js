import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return element;
};

export default PrivateRoute;
