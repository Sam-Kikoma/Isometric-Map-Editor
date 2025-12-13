import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("http://localhost:3001/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Login failed");
			}

			// Store the token in localStorage for future authenticated requests
			localStorage.setItem("token", data.token);

			// Use React Router navigation
			navigate("/editor");
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
					<h2 className="card-title text-2xl font-bold text-center">Login</h2>

					{error && <div className="alert alert-error">{error}</div>}

					<form onSubmit={handleSubmit}>
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
								{loading ? "Logging in..." : "Login"}
							</button>
						</div>
					</form>

					<div className="text-center mt-4">
						<p>
							Don't have an account?{" "}
							<Link to="/signup" className="link link-primary">
								Sign up
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

export default Login;
