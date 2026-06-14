import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { FaBookOpen, FaTimes } from "react-icons/fa";
import api from "../utils/api";
import { Modal } from '../CommonComponents/Modal';
import { Welcome } from "./Welcome";
import { Logo } from "../CommonComponents/logo";


function ResetPassword() {

    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [status, setStatus] = useState('form');
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [isOpen, setIsOpen] = useState(true);
    console.log("Token is : ", token);
    function handleChange(e) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await api.post('/auth/reset-password', {
                token: token,
                newPwd: formData.password,
                confirmPassword: formData.confirmPassword
            });
            const servResp = response.data.data;
            if (servResp.success) {
                console.log("Password reset successful");
                alert(servResp.message);
                setStatus('success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setStatus('error');
                alert(servResp ? servResp.message : "Failed to reset password");
            }
        }
        catch (error) {
            console.log(error);
            setStatus('error');
            alert("Failed to reset password");
        }

    }
    function closeModal() {
        setIsOpen(false);
        navigate('/');
    }
    return (
        <>
            <Welcome />
            <Modal open={isOpen} close={closeModal}>
                <div className="min-h-[calc(100vh-73px)] flex items-center justify-center z-50">
                    {token ? (
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
                                <div>
                                    <h2 className="font-playfair text-cream text-2xl m-0">Reset Password</h2>
                                </div>

                                <div>
                                    <div className="flex flex-col">
                                        <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">New Password</label>
                                        <input type="password" placeholder="Enter new password" name="password"
                                            value={formData.password} onChange={handleChange}
                                            className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">Confirm Password</label>
                                        <input type="password" placeholder="Confirm new password" name="confirmPassword"
                                            value={formData.confirmPassword} onChange={handleChange}
                                            className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                                    </div>
                                </div>
                                <button type="submit"
                                    className="bg-gold text-white px-8 py-3 border-none text-base transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)]">
                                    Reset Password
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

                        </div>) :
                        (
                            <div className="w-full max-w-[480px] bg-bg-primary">
                                <h2 className="font-playfair text-cream text-2xl m-0">Token Expired or Invalid</h2>
                            </div>
                        )}
                </div>
            </Modal>
        </>
    )
}

export { ResetPassword };