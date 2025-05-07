const SignUp = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="card w-96 bg-gray-800 rounded-lg border border-gray-700">
				<div className="card-body space-y-4 p-8">
					<h2 className="card-title text-2xl font-normal text-gray-100">Create account</h2>

					<div className="form-control">
						<label htmlFor="name" className="label">
							<span className="label-text text-gray-400">Full name</span>
						</label>
						<input
							type="text"
							className="input bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 
                        focus:border-gray-500 focus:bg-gray-700 focus:ring-1 focus:ring-gray-500"
							placeholder="Alex Johnson"
						/>
					</div>

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
					</div>

					<div className="form-control">
						<label htmlFor="confirm-password" className="label">
							<span className="label-text text-gray-400">Confirm password</span>
						</label>
						<input
							type="password"
							className="input bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 
                        focus:border-gray-500 focus:bg-gray-700 focus:ring-1 focus:ring-gray-500"
							placeholder="••••••••"
						/>
					</div>

					<div className="flex items-start mt-1">
						<input
							type="checkbox"
							id="terms"
							className="checkbox checkbox-sm mt-1 bg-gray-700 border-gray-600 
                        checked:border-gray-100 [--chkfg:theme(colors.gray.800)]"
						/>
						<label htmlFor="terms" className="label-text text-gray-400 ml-2 text-sm">
							I agree to the{" "}
							<a href="#" className="link link-hover text-gray-300">
								Terms
							</a>{" "}
							and{" "}
							<a href="#" className="link link-hover text-gray-300">
								Privacy Policy
							</a>
						</label>
					</div>

					<button
						className="btn w-full bg-gray-100 text-gray-900 hover:bg-gray-200 
                          border-none rounded-md py-3 font-medium mt-2"
					>
						Create account
					</button>

					<div className="text-center text-sm text-gray-500 pt-2">
						<span>Already have an account? </span>
						<a href="/login" className="link link-hover text-gray-400 hover:text-gray-300">
							Sign in
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
