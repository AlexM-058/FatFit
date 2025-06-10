import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const jwtFields = [
	["exp", "number"],
	["iat", "number"],
	["iss", "string"],
	["username", "string"],
	["id", "number"],
	["rights", "number"],
];

/**
 * Get the token from the cookies
 * @returns token (string)
 */
export const getToken = () => {
	return Cookies.get("token") || "";
};

/**
 * Set the token in the cookies
 * @param token (string)
 */
export const setToken = (token) => {
	Cookies.set("token", token, {
		expires: 1,
		secure: false, // set to true if your website is served over HTTPS
		sameSite: "strict",
	});
};

/**
 * Remove the token from the cookies
 */
export const removeToken = () => {
	Cookies.remove("token");
	window.location.reload();
};

/**
 * Check if the token is valid
 * @returns isTokenValid (boolean)
 */
export const isTokenValid = () => {
	try {
		const decoded = jwtDecode(getToken());

		for (const [field, type] of jwtFields) {
			if (typeof decoded[field] !== type) {
				return false;
			}
		}

		if (decoded.exp * 1000 < Date.now()) {
			removeToken();
			return false;
		}

		return true;
	} catch (err) {
        console.error(new Error(err && err.message ? err.message : "An error occurred while validating the token."));
        removeToken();
		return false;
	}
};

/**
 * Get the user from the token
 * @returns user (object|null)
 */
export const getUser = () => {
	try {
		const token = getToken();
		if (token === "") {
			removeToken();
			return null;
		}
		const decodedToken = jwtDecode(token);
		// If you have a UserToken class, adapt this line accordingly
		return {
			id: decodedToken.id,
			username: decodedToken.username,
			rights: decodedToken.rights
		};
	} catch (error) {
		console.error(new Error(error && error.message ? error.message : "An error occurred while getting the user."));
		return null;
	}
};