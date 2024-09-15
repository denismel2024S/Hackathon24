import React, { useState, useEffect } from "react";

const LoginCard = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission

        try {
            const response = await fetch('http://localhost:5432/login', {
                method: 'POST', // Assuming you are using POST method for login
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
                // Handle successful login (e.g., redirect to another page, save token)
            } else {
                console.error('Login failed:', response.statusText);
                // Handle login error (e.g., show error message)
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <main id="main" className="main">
            <section className="section profile">
                <div className="row">
                    <div className="card">
                        <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                            <img src="" alt="Profile" className="rounded-circle" />
                            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
                            <form onSubmit={handleSubmit}>
                                <div className="form-floating">
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="name@example.com"
                                    />
                                    <label htmlFor="floatingInput">Email address</label>
                                </div>
                                <div className="form-floating">
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                    />
                                    <label htmlFor="floatingPassword">Organization Password</label>
                                </div>
                                <div className="form-check text-start my-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value="remember-me"
                                        id="flexCheckDefault"
                                    />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Remember me
                                    </label>
                                </div>
                                <div className="sign-in-button-container">
                                    <button
                                        className="btn btn-primary w-100 py-2"
                                        type="submit"
                                    >
                                        Sign in
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default LoginCard;
