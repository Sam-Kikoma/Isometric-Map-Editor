import prisma from "../db";
import { comparePassword, createJwt, hashPassword } from "../modules/auth";

export const createUser = async (req, res, next) => {
	try {
		const user = await prisma.user.create({
			data: {
				username: req.body.username,
				email: req.body.email,
				password: await hashPassword(req.body.password),
			},
		});
		const token = createJwt(user);
		res.json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error creating user" });
	}
};

export const signIn = async (req, res, next) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				email: req.body.email,
			},
		});

		if (!user) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		const isValid = await comparePassword(req.body.password, user.password);
		if (!isValid) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		const token = createJwt(user);
		res.json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error during sign in" });
	}
};
