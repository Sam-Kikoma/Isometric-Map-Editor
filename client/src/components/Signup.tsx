import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

const Signup = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		try {
			const response = await fetch(`${API_URL}/user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Signup failed");
			}

			// Store the token in localStorage
			localStorage.setItem("token", data.token);

			setSuccess(true);

			// Redirect after a brief delay to show success message
			setTimeout(() => {
				navigate("/editor");
			}, 1500);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-200">
			<div className="card w-full max-w-sm shadow-2xl bg-base-100">
				<div className="card-body">
					<h2 className="card-title text-2xl font-bold text-center">Create Account</h2>

					{error && <div className="alert alert-error">{error}</div>}
					{success && <div className="alert alert-success">Account created successfully!</div>}

					<form onSubmit={handleSubmit}>
						<div className="form-control">
							<label className="label">
								<span className="label-text">Username</span>
							</label>
							<input
								type="text"
								placeholder="Username"
								className="input input-bordered"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						<div className="form-control">
							<label className="label">
								<span className="label-text">Email</span>
							</label>
							<input
								type="email"
								placeholder="Email"
								className="input input-bordered"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="form-control">
							<label className="label">
								<span className="label-text">Password</span>
							</label>
							<input
								type="password"
								placeholder="Password"
								className="input input-bordered"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div className="form-control mt-6">
							<button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`} disabled={loading}>
								{loading ? "Creating Account..." : "Sign Up"}
							</button>
						</div>
					</form>

					<div className="text-center mt-4">
						<p>
							Already have an account?{" "}
							<Link to="/login" className="link link-primary">
								Login
							</Link>
						</p>
					</div>

					<div className="text-center mt-2">
						<Link to="/" className="link link-hover text-sm">
							Back to home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
