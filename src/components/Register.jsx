import { FaBookOpen, FaPen, FaStore } from 'react-icons/fa';
import { useState } from 'react'
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();

    const roles = [
        { label: 'Reader', icon: <FaBookOpen /> },
        { label: 'Author', icon: <FaPen /> },
        { label: 'Vendor', icon: <FaStore /> }
    ]

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: ''
    });

    function handleChange(e) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const payload = {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }
        try {
            const res = await api.post('/auth/register-user', payload);
            alert(`Registration successful!\n Please check your inbox and verify your email address before logging in.\n${res.data.message}`);
            navigate('/login');
        }
        catch (err) {
            alert(err.response.data.message)
        }
    }

    return (
        <div className="grid grid-cols-2 min-h-[calc(100vh-73px)]">

            {/* Left Panel */}
            <div className="flex flex-col justify-center p-16">
                <h2 className="font-playfair font-semibold text-cream text-3xl mb-4">
                    Join the Publishing <em className="text-gold italic">Revolution</em>
                </h2>
                <p className="text-brown text-lg max-w-[90%] mb-6">
                    Create an account and start publishing, reading, or printing
                    books on India's most complete literary platform
                </p>
                <ul className="list-none p-0 space-y-2">
                    <li className="text-lg leading-6 before:content-['•'] before:text-gold before:mr-2">
                        <em className="text-gold">12K+</em> books published
                    </li>
                    <li className="text-lg leading-6 before:content-['•'] before:text-gold before:mr-2">
                        <em className="text-gold">5K+</em> active authors
                    </li>
                    <li className="text-lg leading-6 before:content-['•'] before:text-gold before:mr-2">
                        <em className="text-gold">198K+</em> happy readers
                    </li>
                    <li className="text-lg leading-6 before:content-['•'] before:text-gold before:mr-2">
                        <em className="text-gold">38+</em> print vendors
                    </li>
                </ul>
            </div>

            {/* Right Panel - Form */}
            <form className="bg-bg-secondary flex flex-col gap-4 p-16" onSubmit={handleSubmit}>
                <h2 className="font-playfair text-cream text-2xl m-0">Create your account</h2>
                <p className="text-brown text-base mt-0">Fill in your details to get started</p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">First Name</label>
                        <input type="text" placeholder="First Name" name="firstName"
                            value={formData.firstName} onChange={handleChange}
                            className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">Last Name</label>
                        <input type="text" placeholder="Last Name" name="lastName"
                            value={formData.lastName} onChange={handleChange}
                            className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">Email Address</label>
                    <input type="email" placeholder="Email" name="email"
                        value={formData.email} onChange={handleChange}
                        className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                </div>

                <div className="flex flex-col">
                    <label className="uppercase text-xs tracking-[0.1em] font-semibold mb-2">Create Password</label>
                    <input type="password" placeholder="Password" name="password"
                        value={formData.password} onChange={handleChange}
                        className="p-4 border border-brown bg-white/5 text-gold rounded-sm placeholder:text-gray-500" />
                </div>

                <hr className="border-gold/20 w-full" />

                <div className="flex flex-col gap-2">
                    <label className="uppercase text-xs tracking-[0.1em] font-semibold">I want to join as</label>
                    <div className="flex gap-4 mt-2">
                        {roles.map(role => (
                            <button type="button" key={role.label}
                                onClick={() => setFormData(prev => ({ ...prev, role: role.label }))}
                                className={`p-8 w-1/3 flex flex-col items-center justify-center gap-2 border transition-all
                                    ${formData.role === role.label
                                        ? 'bg-gold text-white border-gold'
                                        : 'bg-white/5 border-gold/20 text-cream'}`}>
                                {role.icon}
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit"
                    className="bg-gold text-white px-8 py-3 border-none text-base transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)]">
                    Create account
                </button>
            </form>

        </div>
    );
}

export { Register };
