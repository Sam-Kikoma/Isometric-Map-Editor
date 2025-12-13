import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ThreeScene from "./components/ThreeScene";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Community from "./components/Community";

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const isAuthenticated = localStorage.getItem("token") !== null;

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

// Router configuration
const router = createBrowserRouter([
	{
		path: "/",
		element: <Landing />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/signup",
		element: <Signup />,
	},
	{
		path: "/editor",
		element: (
			<ProtectedRoute>
				<ThreeScene />
			</ProtectedRoute>
		),
	},
	{
		path: "/community",
		element: <Community />,
	},
]);

const App = () => {
	return (
		<div className="bg-neutral-800 w-full min-h-screen">
			<RouterProvider router={router} />
		</div>
	);
};

export default App;
