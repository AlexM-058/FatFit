import { toast } from "react-toastify";
import { httpRequest } from "../utils/http";
import { getUser, removeToken, setToken } from "../utils/jwt";
import { useAuthStore } from "../stores/authStore";

export default class AuthService {
	// URL API
	url;

	constructor() {
		this.url = import.meta.env.VITE_API_URL;
		if (!this.url.endsWith('/')) {
			this.url += '/';
		}
	}

	// Login user
	async login(userId, password) {
		try {
			console.log("Login payload:", { username: userId, password });
			const response = await httpRequest(this.url + "login", {
				method: "POST",
				body: JSON.stringify({ username: userId, password }),
			});

			const json = await response.json();
			console.log("Backend login response:", json);

			if (!response.ok) {
				throw new Error(json.error || json.message || "An error occurred. Please try again later.");
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
