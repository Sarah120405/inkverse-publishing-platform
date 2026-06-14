import { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext();

function AuthProvider({children}){

    const [authData, setauthData] = useState({
        user: null,
        token: null
    });

    useEffect(()=> {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if(user && token){
            setauthData({user, token});
        }
    },[])
    function handleLogin(user, token){
        setauthData({user, token});
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    }

    function verifyOTP(user, token){
        setauthData({user, token});
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    }
    function handleLogout(){
        setauthData({user: null, token: null});
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
    return (
        <AuthContext.Provider value={{authData, handleLogin, verifyOTP, handleLogout}}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth (){
    return useContext(AuthContext);
}

export {AuthProvider, useAuth};