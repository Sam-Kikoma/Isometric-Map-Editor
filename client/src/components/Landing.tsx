import { Link } from "react-router-dom";
import { GradFlow } from "gradflow";

const Landing = () => {
	const isAuthenticated = localStorage.getItem("token") !== null;

	return (
		<div className="min-h-screen relative">
			{/* GradFlow Background */}
			<div className="absolute inset-0 z-0">
				<GradFlow
					config={{
						color1: { r: 101, g: 166, b: 174 },
						color2: { r: 0, g: 0, b: 0 },
						color3: { r: 107, g: 36, b: 127 },
						speed: 0.9,
						scale: 2,
						type: "silk",
						noise: 0.18,
					}}
				/>
			</div>

			{/* Navbar */}
			<nav className="relative z-10 flex items-center justify-between px-8 py-5 text-white">
				<span className="text-xl font-semibold">IsoEdit</span>
				<div className="flex items-center gap-6">
					<Link to="/community" className="text-sm hover:opacity-70">
						Community
					</Link>
					{isAuthenticated ? (
						<>
							<button
								className="text-sm hover:opacity-70"
								onClick={() => {
									localStorage.removeItem("token");
									window.location.reload();
								}}
							>
								Logout
							</button>
							<Link to="/editor" className="btn btn-primary btn-sm">
								Open Editor
							</Link>
						</>
					) : (
						<>
							<Link to="/login" className="text-sm hover:opacity-70">
								Login
							</Link>
							<Link to="/signup" className="btn btn-primary btn-sm">
								Sign Up
							</Link>
						</>
					)}
				</div>
			</nav>

			{/* Hero */}
			<div className="relative z-10 hero min-h-[calc(100vh-80px)]">
				<div className="hero-content text-center text-white">
					<div className="max-w-md">
						<h1 className="text-5xl font-bold">IsoEdit</h1>
						<p className="py-6 text-white/80">
							Create, edit, and share beautiful isometric maps with this easy-to-use editor.
						</p>
						<div className="flex gap-4 justify-center">
							{isAuthenticated ? (
								<Link to="/editor" className="btn btn-primary">
									Launch Editor
								</Link>
							) : (
								<>
									<Link to="/signup" className="btn btn-primary">
										Get Started
									</Link>
									<Link to="/login" className="btn btn-outline">
										Login
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Landing;
