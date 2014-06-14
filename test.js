// this small section is provided by the Espresso Logic server when running in the server.
// a small emulator is provided for testing locally.

out = java.lang.System.out;

var SysUtility = {
    restPost : function restPost(url, params, settings, data) {
        var restCaller = new com.kahuna.logic.lib.rest.RestCaller(this);
        var result = restCaller.post(url, params, settings, data);
        return result;
    },

    restGet : function restGet(url, params, settings) {
        var restCaller = new com.kahuna.logic.lib.rest.RestCaller(this);
        var result = restCaller.get(url, params, settings);
        return result;
    },
    getAccessToken : function getAccessToken(refreshToken, tenantName, clientId, clientSecret){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication();
		var result = waad.getAccessToken(refreshToken,tenantName,clientId,clientSecret);
		return result;
	},
	getAccessTokenFromURL : function getAccessTokenFromURL(tenantName, clientId, clientSecret,fullURL,redirectURL){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(tenantName,clientId,clientSecret);
		var result = waad.getAccessTokenFromURL(fullURL,redirectURL);
		return result;
	},
	getRedirectURL : function getRedirectUrl(tenantName, clientId, clientSecret,currentUri){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(tenantName, clientId, clientSecret);
		var result = waad.getRedirectUrl(currentUri);
		return result;
	},
	findGroupInfoForUser : function findGroupInfoForUser(tenantName, clientId, clientSecret,accessToken,userPrincipalName){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(tenantName, clientId, clientSecret);
		var result = waad.findGroupInfoForUser(accessToken,userPrincipalName);
		return result;
	}
};

// load the class
load("WAADSecurityProvider.js");

//https://login.windows.net/20ce12a7-7cac-40bb-8dd1-49d1ab21c083/oauth2/token?api-version=1.0
//https://login.windows.net/20ce12a7-7cac-40bb-8dd1-49d1ab21c083/oauth2/authorize?api-version=1.0
// configuration needed for testing
var configSetup = {
   authority :"https://login.windows.net",
   tenantName : "20ce12a7-7cac-40bb-8dd1-49d1ab21c083",
   clientId : "c620d05e-e515-40da-a3d2-ecfe89ee22cd",
   clientSecret : "IUyk421BezUUprxLy1jXmx1ohhwjAOJ4XJ68p7AH1ng=",
   apiVersion : "api-version=2013-11-08"
};

var userPrincipalName = "JoeDeveloper@tylerm007gmail.onmicrosoft.com";
// this is how the server creates the security object
var waadSSO = waadSecurityProvider();
waadSSO.configure(configSetup);

var payload = {
    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0IiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjBjZTEyYTctN2NhYy00MGJiLThkZDEtNDlkMWFiMjFjMDgzLyIsImlhdCI6MTQwMjQ0NjczNiwibmJmIjoxNDAyNDQ2NzM2LCJleHAiOjE0MDI0NTA2MzYsInZlciI6IjEuMCIsInRpZCI6IjIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4MyIsImFtciI6WyJwd2QiXSwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDM0MDAxQjFCQzc3MjMiLCJpZHAiOiJsaXZlLmNvbSIsIm9pZCI6Ijk3Y2U3MmM5LTkwNjQtNDM0OS1hNDBkLWY2YzExMjViMzczZCIsInN1YiI6IkFCcUtVbFNELVg4VndLUG5kSm1Dd2hRV0pIMXdHQmdZWGRDbERudmNnbnMiLCJlbWFpbCI6InR5bGVybTAwN0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiVHlsZXIiLCJmYW1pbHlfbmFtZSI6IkJhbmQiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3R5bGVybTAwN0BnbWFpbC5jb20iLCJhcHBpZCI6ImM2MjBkMDVlLWU1MTUtNDBkYS1hM2QyLWVjZmU4OWVlMjJjZCIsImFwcGlkYWNyIjoiMSIsInNjcCI6IkRpcmVjdG9yeS5SZWFkIHVzZXJfaW1wZXJzb25hdGlvbiBVc2VyUHJvZmlsZS5SZWFkIiwiYWNyIjoiMSJ9.NBOPmz5nZIlqo4QhLcEUyvpP7eqpYw4Whxi4uECOgRw8DD3xbfd5RnoPnB3M6a0sVfFH_PLTMg_jP2Bc97it32K9Y4KO0lL6KlLJ9S2onHQTi-WoVxVxMGkuZOicwVQRETrKH_1D1V8sr-HbYK0l2rD0dzF6j0X7JAFGJ_h47HXngyGz0Rmme68c33utNN8_CMNXAYMN7_QaQNQ3DcBs0WfV7woxdN61rmPeyElBjO-lJDmQESOtPxp8OhzR-IpthBqsDQyNI38E5XGkbxNQlXp_mUAH_SFma96DpCZ5PgyTPVoZgSocPtDJFnmuusfahy3eI4MZB0ZLEM1gs-a9Aw",
    refreshToken: "AwABAAAAvPM1KaPlrEqdFSBzjqfTGHjqb9dBTwUg5v5R37H6cQu-8o3w--L1pbrtGWnYnKvOkZ5O9u1cPad36W4jZbIgPGl1307sqkGf0RTCxsdd51IFTk0LmVy2dyVP38cJjxJhstcttSFbWP3Jem5PEXX0qMpxilRW38rW83cRIDF8qUqrjLl_9hY_kwncmQ732P7td-yxYfCBfOz86g3ECFAh4ESK5P7HhzQXLPUcL4ylZGoG6gW0cG-gusnGfsgWI5A43W9gvcfAVy_sRdP8y-97CmLU9RduyIbVECe7jBP7MPPccZCQ3HM3ltbsqo2eNowijD46rgL2Iw1ikv_NKojd35quj0zNnDO-rrFRIT_W4Rf74sg2Zeu9Yd6ON9H44pNoe0fQJcZQB15gWrJdw2UUhJh5KznGdKRa47F57t_5s8NKkHQnnP-PANl9W70XKI15q27sTf2DCP9csx7f9rRGaAGolMKKoT62k3NdH_PkS8SzjFe0XgF8S3zvAS4BhZT8Zw_exNWGZI-MGPwQzcpqIClFMyEfDOFk9MDJFctEmi0gAA"
};

var baseUrl = "http://localhost:8080/LiveBrowser/";

//these where cut and pasted from the Espresso Logic demo page after logon and redirect back
var fullURL = "http://localhost:8080/LiveBrowser/secure/aad?code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGDCDkpUUghNl5PnB2N-Fk0Y8gnvxptDj7CZKxkFth7dSehO-SjJoRch3IiSXihl6rlwjzrxTLwxCPVp_ep-NGPTvCEqV1mhmTBYf5LZR9hSskYropdmJ9OocJlVez-a9xADgG7_oFyED1LrS5dGrO_JCx0Frr6nXXrWg_Mz2nHImEpyd7Lg_ZoOkl3D9QZ_0-MGlwU1rgMBuVvU5WPxGip7nQFdJmP5APyl3SSrfw83KsEY2T-CMaNDer4KLqPSG9J-I3yLhvZXhQ97vgYBPOGHwnU3Rch8bD1dXr9FgHOmrXXdsbam82ynGkeI9ndJgpel_Jo76lwcI3PEvESjuPQq2nNSFNcFUCSgdHOyEdo39onKsFn-vZUd76dxCSbRRuaJR5HD-Ak9l634UCvtjZrRyVy8xljgel6DrPKu5F1bvD4gRskI3ijDAPYMatg9Lt2bfHf8YL_G2b6ZoJOJmMPAyooolE7Ed_zFp8kPKA8w9CqQP4zUpx1-u4kn2zfZ0RyolS5ARxRtA-Q-JJvQlRuogAA&session_state=ff78a658-ee39-46f1-8f9a-27de13a25a30";
var redirectURL = baseUrl + "secure/aad";
var redirect = true;

// !) IF We have a successful redirect - this will allow us to validate
out.println("------------- testing getRedirectURL -- --------------------------");
var redirectUrlResponse = waadSSO.getRedirectURL(redirectURL);
out.println(redirectUrlResponse);
out.println("-------------");


// 2) Test to see if the redirected URL contains an access code param
if(waadSSO.isAuthenticated(fullURL) && waadSSO.containsAuthenticationData(fullURL)){
	out.println("------------- URL isAuthenticated  and  contains Authenticatd code values -------------");
	redirect = false;
}

out.println("------------- testing getAccessTokenFromURL--------------------------");
//3) So now let us get our access token
result = waadSSO.getAccessTokenFromURL(fullURL,redirectURL);
out.println(JSON.stringify(result, null, 2));
//out.println("First field is " + result.fields[0].name);
out.println("-------------");
//use the access token to getGroup info and other webgraph API calls
if(result != null && result.hasOwnProperty('accessToken') && result.accessToken != null){
	payload = {
		'accessToken' : result.accessToken,
		'refreshToken' : null
	};
} else {
	//we did not get back a valid response so need to logon again
	//this function uses refresh token - but the Redirect URL is better
	out.println("------------- did not have a valid token so we are now testing getAccessToken ----------------");
	payload = {
			'accessToken' : null,
			'refreshToken' : null
	};
	result = waadSSO.authenticate(payload);
	out.println(JSON.stringify(result, null, 2));
	if(result != null && result.hasOwnProperty('accessToken')){
		payload = {
				'accessToken' : result.accessToken,
				'refreshToken' : result.refreshToken
		};
		out.println("getAccessToken acquired new token");
		redirect = false;
	}
	out.println("------------------------------------------------");

}

out.println("------------- testing findGroupInfoForUser --s/b group: developer----------------");
result = waadSSO.findGroupInfoForUser(payload ,userPrincipalName);
out.println(result);
out.println("------------------------------------------------");


out.println("------------- testing findGroupInfoForUser should return error");
result = waadSSO.findGroupInfoForUser(payload ,"baduser@gmail.com");
out.println(result);
out.println("------------------------------------------------");


// THIS DOES NOT WORK - but we would redirect to WAAD using the redirectUrlResponse
if(redirect){
	var settings = {};
	var parms = null;
	out.println("-------------calling redirect GET to redirect");
	result = SysUtility.restGet(redirectUrlResponse,parms,settings);
	//out.println(result);
}

out.println("------------- testing getConfigInfo ------------------");
result = waadSSO.getConfigInfo();
out.println(JSON.stringify(result, null, 2));
//out.println("First config prop is " + result.fields[0].name);
out.println("-------------");

//------------helper methods to check URL for specific values ----------------//
out.println("------------- testing authenticate with isAuthenticated (s/b/ true) ");
var result = waadSSO.isAuthenticated(fullURL);
out.println(result);
out.println("-------------");


out.println("------------- testing authenticate with isAuthenticated (s/b/ false) ");
var result = waadSSO.isAuthenticated('http://localhost:8080/secure/aad');
out.println(result);
out.println("-------------");


out.println("------------- testing authenticate with containsAuthenticationData (s/b/ true) ");
var result = waadSSO.containsAuthenticationData(fullURL);
out.println(result);
out.println("-------------");

out.println("------------- testing authenticate with containsAuthenticationData (s/b/ false) ");
var result = waadSSO.containsAuthenticationData('http://localhost:8080/secure/aad');
out.println(result);
out.println("-------------");


out.println("------------- testing authenticate with containsAuthenticationData Error (s/b/ false) ");
var result = waadSSO.containsAuthenticationData('error no valid data');
out.println(result);
out.println("-------------");

//-------------utility to ask waad for all available groups ------
// return a list of roles from WAAD using webgraph REST call - needs valid accessToken in payload
out.println("------------- testing getAllGroups ------------------------");
result = waadSSO.getAllGroups(payload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");

