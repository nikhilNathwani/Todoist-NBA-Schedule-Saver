const { encrypt, decrypt } = require("./encryption");
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//         COOKIE-SESSION I/O                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

//Saves encrypted accessToken to cookie-session
function saveAccessToken(req, accessToken) {
	const encryptedToken = encrypt(accessToken);
	req.session.accessTokenEncrypted = encryptedToken;
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
