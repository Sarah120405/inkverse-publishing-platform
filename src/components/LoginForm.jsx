import { useState } from 'react';
import { FaTimes, FaBookOpen, FaArrowLeft } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../CommonComponents/logo';

function LoginForm({ closeModal }) {

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });
    const [is2FaStep, setIs2FaStep] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const { handleLogin } = useAuth();
    const navigate = useNavigate();
    const [otpCode, setOtpCode] = useState("");
    const [isForgotStep, setIsForgotStep] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {

            if (isForgotStep && !is2FaStep) {
                const response = await api.post("/auth/forgot-password", loginData);
                const servResp = response.data.data;
                if (servResp && servResp.success) {
                    console.log("Forgot Password Success");
                    alert(servResp.message);
                    setIsForgotStep(false);
                } else {
                    alert(servResp ? servResp.message : "Failed to send reset link");
                }
                return;
            }

            if (is2FaStep) {
                console.log("Submitting 2FA with payload:", { tempToken, otpCode });
                const response = await api.post("/twoFactorAuth/verify-login-otp", { tempToken, token: otpCode });
                const servResp = response.data.data;
                const loggedUser = servResp.data.user;

                if (servResp && servResp.success) {
                    handleLogin(servResp.data.user, servResp.data.token);
                    console.log("Login Succesfull");
                    if (loggedUser.role === 'Author') {
                        navigate('/dashboard/author');
                    } else if (loggedUser.role === 'Vendor') {
                        navigate('/dashboard/vendor');
                    } else if (loggedUser.role === 'Reader') {
                        navigate('/dashboard/reader');
                    } else if (loggedUser.role === 'Admin') {
                        navigate('/dashboard/admin');
                    }
                } else {
                    alert(servResp ? servResp.message : "Verification failed");
                }
                return;
            }
            else {
                const response = await api.post("/auth/login", loginData);
                const servResp = response.data.data;
                const loggedUser = servResp.data.user;


                if (servResp && servResp.success) {
                    if (servResp.message === "2FA required") {
                        setIs2FaStep(true);
                        setTempToken(servResp.data.tempToken.token);
                    }
                    else {
                        handleLogin(servResp.data.user, servResp.data.token);
                        if (loggedUser.role === 'Author') {
                            navigate('/dashboard/author');
                        } else if (loggedUser.role === 'Vendor') {
                            navigate('/dashboard/vendor');
                        } else if (loggedUser.role === 'Reader') {
                            navigate('/dashboard/reader');
                        } else if (loggedUser.role === 'Admin') {
                            navigate('/dashboard/admin');
                        }
                    }
                } else {
                    alert(servResp ? servResp.message : "Login failed");
                }
            }

        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed");
        }
    }

    function handleChange(e) {
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    return (
        <div className="min-h-[calc(100vh-73px)] flex items-center justify-center z-50">
            <div className="w-full max-w-[480px]">

                {/* Header */}
                <header className="flex justify-between items-center p-4 bg-bg-primary rounded-t-md">
                    <div className="flex items-center">
                        <Logo />
                    </div>
                    <button type="button" onClick={closeModal}
                        className="bg-transparent text-gold border-none text-lg hover:bg-transparent">
                        <FaTimes />
                    </button>

                </header>

                {/* Form */}
                <form className="bg-bg-secondary flex flex-col gap-4 p-8" onSubmit={handleSubmit}>
                    {!isForgotStep && !is2FaStep && (
                        <div>
                            <h2 className="font-playfair text-cream text-2xl m-0">Welcome back</h2>
                            <p className="text-brown text-base mt-1">Sign in to continue to your library</p>
                        </div>
                    )}


                    {isForgotStep ?
                        (<div>
                            <div>
                                <h2 className="font-playfair text-cream text-2xl m-0">Forgot Password</h2>
                                <p className="text-brown text-base mt-1">Enter your email address and we'll send you a link to reset your password</p>
                            </div>
                            <div className="flex flex-col">
                                <label className="uppercase text-xs tracking-[0.1em] font-semibold my-2">Email Address</label>
                                <input type="email" placeholder="Email" name="email"
                                    value={loginData.email} onChange={handleChange}
                                    className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                            </div>

                        </div>) :
                        !is2FaStep ?
                            <div>
                                <div className="flex flex-col">
                                    <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">Email Address</label>
                                    <input type="email" placeholder="Email" name="email"
                                        value={loginData.email} onChange={handleChange}
                                        className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="uppercase text-xs tracking-[0.1em] font-semibold my-2">Password</label>
                                    <input type="password" placeholder="Your password" name="password"
                                        value={loginData.password} onChange={handleChange}
                                        className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                                    <p className="text-xs text-right mt-1 text-brown cursor-pointer hover:text-gold"
                                        onClick={() => setIsForgotStep(true)}
                                    >Forgot Password?</p>
                                </div>
                            </div> :

                            (
                                <div className="flex flex-col">
                                    <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">OTP Code</label>
                                    <input type="text" placeholder="000 000" name="otpCode"
                                        value={otpCode}
                                        maxLength={6}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                                </div>
                            )}

                    <button type="submit"
                        className="bg-gold text-white px-8 py-3 border-none text-base transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)]">
                        {isForgotStep ? "Send Reset Link" : is2FaStep ? "Verify OTP" : "Log in"}
                    </button>

                    <hr className="border-gold/20 w-full" />
                </form>

                {/* Footer */}
                <footer className="p-2 bg-bg-primary border-t border-gold/20 rounded-b-md">
                    <p className="m-0 ml-1 text-xs flex items-center gap-2 text-brown">
                        <FaBookOpen />
                        Not all those who wander are lost. — J.R.R. Tolkien
                    </p>
                </footer>

            </div>
        </div>
    );
}

export { LoginForm };
