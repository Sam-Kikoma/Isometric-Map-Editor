import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
	const isAuthenticated = localStorage.getItem("token") !== null;

	return (
		<div className="hero min-h-screen bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-md">
					<h1 className="text-5xl font-bold">IsoEdit</h1>
					<p className="py-6">
						Create, edit, and share beautiful isometric maps with this easy-to-use editor. Get started by logging in or
						creating an account.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/community" className="btn btn-secondary">
							Community
						</Link>
						{isAuthenticated ? (
							<>
								<Link to="/editor" className="btn btn-primary">
									Launch Editor
								</Link>
								<button
									className="btn btn-outline"
									onClick={() => {
										localStorage.removeItem("token");
										window.location.reload();
									}}
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="btn btn-primary">
									Login
								</Link>
								<Link to="/signup" className="btn btn-outline">
									Sign Up
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Landing;
