import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// To-do
// 1.Hash Passwords
export const hashPassword = (password) => {
	return bcrypt.hash(password, 5);
};
// 2.Compare Passwords
export const comparePassword = (password, hash) => {
	return bcrypt.compare(password, hash);
};
// 3. Create JWT
export const createJwt = (user) => {
	const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
	return token;
};
// 4. Middleware to protect routes
export const protect = (req, res, next) => {
	const bearer = req.headers.auhorization;
	if (!bearer) {
		res.status(401);
		res.send({ message: "Not authorized" });
		return;
	}
	const [, token] = bearer.split(" ");
	if (!token) {
		res.status(401);
		res.send({ message: "Invalid token" });
		return;
	}

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		req.user = user;
		next();
	} catch (err) {
		console.error(err);
		res.status;
	}
};
