import { toast } from "react-toastify";
import { httpRequest } from "../utils/http";
import { getUser, removeToken, setToken } from "../utils/jwt";
import { useAuthStore } from "../stores/authStore";

export default class AuthService {
	// URL API
	url;

	constructor() {
		this.url = import.meta.env.VITE_API_URL;
	}

	// Login user
	async login(userId, password) {
		try {
			const response = await httpRequest(this.url + "users/login", {
				method: "POST",
				body: JSON.stringify({ userId, password }),
			});

			const json = await response.json();

			if (!response.ok) {
				throw new Error(json.error || "An error occurred. Please try again later.");
			}

			setToken(json.token);

			toast.success("Login successful");

			const user = getUser();

			useAuthStore.getState().setUser(user);

			return true;
		} catch (error) {
			toast.error(error && error.message ? error.message : "An error occurred. Please try again later.");
			return false;
		}
	}

	// Logout user
	logout() {
		removeToken();
		useAuthStore.getState().logout();
	}
}
