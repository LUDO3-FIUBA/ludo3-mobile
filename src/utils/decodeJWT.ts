import { decode } from "base-64";
global.atob = decode;

export function decodeJWT(jwt: string): any {
	try {
		const base64Url = jwt.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.log("Error decoding JWT", error);
		return null;
	}
}
