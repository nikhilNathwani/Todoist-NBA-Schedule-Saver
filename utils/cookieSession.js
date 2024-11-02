const axios = require("axios");
const { encrypt, decrypt } = require("./encryption");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//         COOKIE-SESSION I/O                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

//Saves encrypted accessToken to cookie-session
async function saveAccessToken(req, res, code) {
	try {
		const response = await axios.post(
			"https://todoist.com/oauth/access_token",
			{
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				code: code,
				redirect_uri: REDIRECT_URI,
			}
		);
		const { access_token } = response.data;
		const encryptedToken = encrypt(access_token);
		req.session.accessTokenEncrypted = encryptedToken;
	} catch (error) {
		console.error(
			"OAuth error:",
			error.response ? error.response.data : error
		);
		handleOAuthError(error, res);
	}
}

//Decrypts accessToken from cookie-session
function getAccessToken(req) {
	const encryptedToken = req.session.accessTokenEncrypted;
	if (!encryptedToken) {
		throw new Error("Access token is not set in the session.");
	}
	return decrypt(encryptedToken);
}

function printReqSession(req) {
	console.log(
		"ACCESS TOKEN:",
		req.session.accessTokenEncrypted,
		"REQ.SESSION:",
		req.session
	);
}

module.exports = { saveAccessToken, getAccessToken, printReqSession };
