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
// pass in the configuration settings
waadSSO.configure(configSetup);

var payload = {
    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0IiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjBjZTEyYTctN2NhYy00MGJiLThkZDEtNDlkMWFiMjFjMDgzLyIsImlhdCI6MTQwMjQ0NjczNiwibmJmIjoxNDAyNDQ2NzM2LCJleHAiOjE0MDI0NTA2MzYsInZlciI6IjEuMCIsInRpZCI6IjIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4MyIsImFtciI6WyJwd2QiXSwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDM0MDAxQjFCQzc3MjMiLCJpZHAiOiJsaXZlLmNvbSIsIm9pZCI6Ijk3Y2U3MmM5LTkwNjQtNDM0OS1hNDBkLWY2YzExMjViMzczZCIsInN1YiI6IkFCcUtVbFNELVg4VndLUG5kSm1Dd2hRV0pIMXdHQmdZWGRDbERudmNnbnMiLCJlbWFpbCI6InR5bGVybTAwN0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiVHlsZXIiLCJmYW1pbHlfbmFtZSI6IkJhbmQiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3R5bGVybTAwN0BnbWFpbC5jb20iLCJhcHBpZCI6ImM2MjBkMDVlLWU1MTUtNDBkYS1hM2QyLWVjZmU4OWVlMjJjZCIsImFwcGlkYWNyIjoiMSIsInNjcCI6IkRpcmVjdG9yeS5SZWFkIHVzZXJfaW1wZXJzb25hdGlvbiBVc2VyUHJvZmlsZS5SZWFkIiwiYWNyIjoiMSJ9.NBOPmz5nZIlqo4QhLcEUyvpP7eqpYw4Whxi4uECOgRw8DD3xbfd5RnoPnB3M6a0sVfFH_PLTMg_jP2Bc97it32K9Y4KO0lL6KlLJ9S2onHQTi-WoVxVxMGkuZOicwVQRETrKH_1D1V8sr-HbYK0l2rD0dzF6j0X7JAFGJ_h47HXngyGz0Rmme68c33utNN8_CMNXAYMN7_QaQNQ3DcBs0WfV7woxdN61rmPeyElBjO-lJDmQESOtPxp8OhzR-IpthBqsDQyNI38E5XGkbxNQlXp_mUAH_SFma96DpCZ5PgyTPVoZgSocPtDJFnmuusfahy3eI4MZB0ZLEM1gs-a9Aw",
    refreshToken: "AwABAAAAvPM1KaPlrEqdFSBzjqfTGHjqb9dBTwUg5v5R37H6cQu-8o3w--L1pbrtGWnYnKvOkZ5O9u1cPad36W4jZbIgPGl1307sqkGf0RTCxsdd51IFTk0LmVy2dyVP38cJjxJhstcttSFbWP3Jem5PEXX0qMpxilRW38rW83cRIDF8qUqrjLl_9hY_kwncmQ732P7td-yxYfCBfOz86g3ECFAh4ESK5P7HhzQXLPUcL4ylZGoG6gW0cG-gusnGfsgWI5A43W9gvcfAVy_sRdP8y-97CmLU9RduyIbVECe7jBP7MPPccZCQ3HM3ltbsqo2eNowijD46rgL2Iw1ikv_NKojd35quj0zNnDO-rrFRIT_W4Rf74sg2Zeu9Yd6ON9H44pNoe0fQJcZQB15gWrJdw2UUhJh5KznGdKRa47F57t_5s8NKkHQnnP-PANl9W70XKI15q27sTf2DCP9csx7f9rRGaAGolMKKoT62k3NdH_PkS8SzjFe0XgF8S3zvAS4BhZT8Zw_exNWGZI-MGPwQzcpqIClFMyEfDOFk9MDJFctEmi0gAA"
};

var baseUrl = "http://localhost:8080/LiveBrowser/";
//this contains an expired code - so even though it looks good - it should force a redirect and relogon
var fullURL = "http://localhost:8080/LiveBrowser/secure/aad?code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGFbYKnjtfR_9GFJ7XRd1s2KaAm5_vXDBon-vSqtd9jBGmcMjIutBQwjW8CzLWc5s17iYWHaMKSr8EPn1c7NN2PiEeJqEj32zx4-bKP8wXVb1Id1Xx0MZsqk2v6h5tNWJgdgXlsICejjavwfLpVrUsiLX0jwkhQlVqBRDplZQArj7IW07G41ycQsUfT4Y2yzEhxLzrt9FEVIybX_l-uU2QkfcLb6Ariuaz0cOYeUa8uwGuETNBDyO3d2lBO9vxA0PU6Ll_SbqmdUjmPNbH3ZObxzSJEwPw5CZYp9a9UnO0W0XJNa80rU4br4hKmiFwblcU198lOiOOiVZ2ad1kP87oHdSnIEkAPa1pvv44b3HeWk_VYISuQzosP6rbJH06BNnFFeQauzDd2b7_9N9nU19YKz1jjsSs7xQ-kuk1hsv7MfZ8NUg4tTnaBSi0LtSC0NL_Ron3Vs2Q9GBGj3zmFSlfddrcZtzebLdFW-ZIKN6b-d7SLH81k6mtE7cRXoKO6Jo_sbQGYu4QaMVlqmg1VW-rekgAA&session_state=f6a819e7-c67a-40a9-8b00-6a0f2d23e4da";
var redirectURL = baseUrl + "secure/aad";

out.println("------------- testing getLoginInfo(fullURL) should return autoLogon=true and a redirectURL{...} ");
//3) So now let us get our access token
result = waadSSO.getLoginInfo(fullURL);
out.println(JSON.stringify(result, null, 2));
out.println("autoLogin field is " + result.autoLogin);
out.println("Field field is " + result.fields[0].defaultValue);
out.println("-------------");


var payload = {
    accessToken:  result.fields[0].defaultValue,
    refreshToken:  result.fields[1].defaultValue
};

out.println(JSON.stringify(payload,null,2));

var emptyURL = null;
out.println("------------- testing getLoginInfo(null) should return autoLogon=false and a redirectURL{} ");
//3) So now let us get our access token
result = waadSSO.getLoginInfo(emptyURL);
//out.println(String(result));
out.println(JSON.stringify(result, null, 2));
out.println("autoLogin field is " + result.autoLogin);
out.println("-------------");



out.println("------------- testing getRedirectURL(baseURL) should return redirectURL{redirectURL} ");
//3) So now let us get our access token
result = waadSSO.getRedirectURL(redirectURL);
out.println(result);
out.println("-------------");


out.println("------------- testing getLoginInfo(redirectURL) should return autoLogon=false and a redirectURL{redirectURL} ");
//3) So now let us get our access token
result = waadSSO.getLoginInfo(redirectURL);
//out.println(stringify(result));
//out.println(JSON.stringify(result, null, 2));
out.println("autoLogin field is " + result.autoLogin);
out.println("Redirect field is " + JSON.stringify(result.redirectURL, null, 2));
out.println("-------------");

out.println("------------- testing authenticate ");
//3) So now let us get our access token
result = waadSSO.authenticate(payload);
//out.println(stringify(result));
out.println(JSON.stringify(result, null, 2));
//out.println("autoLogin field is " + result.);
out.println("-------------");
