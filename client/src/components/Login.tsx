const Login = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="card w-96 bg-gray-800 rounded-lg border border-gray-700">
				<div className="card-body space-y-5 p-8">
					<h2 className="card-title text-2xl font-normal text-gray-100">Welcome back</h2>

					<div className="form-control">
						<label htmlFor="email" className="label">
							<span className="label-text text-gray-400">Email address</span>
						</label>
						<input
							type="email"
							className="input bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 
                        focus:border-gray-500 focus:bg-gray-700 focus:ring-1 focus:ring-gray-500"
							placeholder="your@email.com"
						/>
					</div>

					<div className="form-control">
						<label htmlFor="password" className="label">
							<span className="label-text text-gray-400">Password</span>
						</label>
						<input
							type="password"
							className="input bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 
                        focus:border-gray-500 focus:bg-gray-700 focus:ring-1 focus:ring-gray-500"
							placeholder="••••••••"
						/>
						<div className="label">
							<a href="#" className="label-text-alt link link-hover text-gray-500 hover:text-gray-400 mt-1">
								Forgot password?
							</a>
						</div>
					</div>

					<button
						className="btn w-full bg-gray-100 text-gray-900 hover:bg-gray-200 
                          border-none rounded-md py-3 font-medium mt-2"
					>
						Sign in
					</button>

					<div className="text-center text-sm text-gray-500 pt-2">
						<span>New user? </span>
						<a href="#" className="link link-hover text-gray-400 hover:text-gray-300">
							Create account
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
