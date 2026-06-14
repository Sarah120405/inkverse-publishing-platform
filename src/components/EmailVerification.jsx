import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { FaBookOpen, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../utils/api";

function EmailVerification() {

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/login');
    }

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Verification token is missing");
        } else {
            verfiyEmail();
        }
    }, [token])

    async function verfiyEmail() {
        try {

            const response = await api.post("/auth/verify-email", { token });

            const servResp = response.data.data;

            if (servResp && servResp.success) {
                setStatus("success");
                setMessage(servResp.message);
            } else {
                setStatus("error");
                setMessage(servResp ? servResp.message : "Verification failed");
            }

        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage(error.response?.data?.message || "An error occurred during verification");
        }
    }


    return (
        <>
            {
                status === "verifying" ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="">
                            <p className="text-2xl font-bold mb-4">Verifying Email...</p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
                                    <FaBookOpen />
                                </div>
                                <p>Please wait while we confirm your email</p>
                            </div>
                        </div>
                    </div>
                ) : status === "success" ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="">
                            <p className="text-2xl font-bold mb-4">Email Verified!</p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500">
                                    <FaCheckCircle />
                                </div>
                                <p>Your account is ready. Welcome to Inkverse - your library awaits</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="bg-gold text-cream px-4 py-2 rounded-sm" onClick={handleLoginClick}>Login</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="">
                            <p className="text-2xl font-bold mb-4">Verification Failed!</p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500">
                                    <FaTimesCircle />
                                </div>
                                <p>This link has expired or is invalid. Request a new one below.</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="bg-gold text-cream px-4 py-2 rounded-sm">Resend Verification Email</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export { EmailVerification }