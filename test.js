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
    getAccessToken : function getAccessToken(code, tenantName, clientId, clientSecret){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication();
		var result = waad.getAccessToken(code,tenantName,clientId,clientSecret);
		return result;
	},
	getAccessTokenFromURL : function getAccessTokenFromURL(tenantName, clientId, clientSecret,fullURL,redirectURL){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(tenantName,clientId,clientSecret);
		var result = waad.getAccessTokenFromURL(fullURL,redirectURL);
		return result;
	},
	getRedirectURL : function getRedirectUrl(currentUri){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication();
		var result = waad.getRedirectUrl(currentUri);
		return result;
	}
};

// load the class
load("WAADSecurityProvider.js");


// configuration needed for testing
var configSetup = {
   authority :"https://login.windows.net",
   tenantName : "tylerm007gmail.onmicrosoft.com",
   clientId : "c620d05e-e515-40da-a3d2-ecfe89ee22cd",
   clientSecret : "IUyk421BezUUprxLy1jXmx1ohhwjAOJ4XJ68p7AH1ng=",
   apiVersion : "api-version=2013-11-08"
};


// this is how the server creates the security object
var waadSSO = waadSecurityProvider();
waadSSO.configure(configSetup);



var payload = {
    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0IiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjBjZTEyYTctN2NhYy00MGJiLThkZDEtNDlkMWFiMjFjMDgzLyIsImlhdCI6MTQwMjQ0NjczNiwibmJmIjoxNDAyNDQ2NzM2LCJleHAiOjE0MDI0NTA2MzYsInZlciI6IjEuMCIsInRpZCI6IjIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4MyIsImFtciI6WyJwd2QiXSwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDM0MDAxQjFCQzc3MjMiLCJpZHAiOiJsaXZlLmNvbSIsIm9pZCI6Ijk3Y2U3MmM5LTkwNjQtNDM0OS1hNDBkLWY2YzExMjViMzczZCIsInN1YiI6IkFCcUtVbFNELVg4VndLUG5kSm1Dd2hRV0pIMXdHQmdZWGRDbERudmNnbnMiLCJlbWFpbCI6InR5bGVybTAwN0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiVHlsZXIiLCJmYW1pbHlfbmFtZSI6IkJhbmQiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3R5bGVybTAwN0BnbWFpbC5jb20iLCJhcHBpZCI6ImM2MjBkMDVlLWU1MTUtNDBkYS1hM2QyLWVjZmU4OWVlMjJjZCIsImFwcGlkYWNyIjoiMSIsInNjcCI6IkRpcmVjdG9yeS5SZWFkIHVzZXJfaW1wZXJzb25hdGlvbiBVc2VyUHJvZmlsZS5SZWFkIiwiYWNyIjoiMSJ9.NBOPmz5nZIlqo4QhLcEUyvpP7eqpYw4Whxi4uECOgRw8DD3xbfd5RnoPnB3M6a0sVfFH_PLTMg_jP2Bc97it32K9Y4KO0lL6KlLJ9S2onHQTi-WoVxVxMGkuZOicwVQRETrKH_1D1V8sr-HbYK0l2rD0dzF6j0X7JAFGJ_h47HXngyGz0Rmme68c33utNN8_CMNXAYMN7_QaQNQ3DcBs0WfV7woxdN61rmPeyElBjO-lJDmQESOtPxp8OhzR-IpthBqsDQyNI38E5XGkbxNQlXp_mUAH_SFma96DpCZ5PgyTPVoZgSocPtDJFnmuusfahy3eI4MZB0ZLEM1gs-a9Aw",
    refreshToken: "AwABAAAAvPM1KaPlrEqdFSBzjqfTGHjqb9dBTwUg5v5R37H6cQu-8o3w--L1pbrtGWnYnKvOkZ5O9u1cPad36W4jZbIgPGl1307sqkGf0RTCxsdd51IFTk0LmVy2dyVP38cJjxJhstcttSFbWP3Jem5PEXX0qMpxilRW38rW83cRIDF8qUqrjLl_9hY_kwncmQ732P7td-yxYfCBfOz86g3ECFAh4ESK5P7HhzQXLPUcL4ylZGoG6gW0cG-gusnGfsgWI5A43W9gvcfAVy_sRdP8y-97CmLU9RduyIbVECe7jBP7MPPccZCQ3HM3ltbsqo2eNowijD46rgL2Iw1ikv_NKojd35quj0zNnDO-rrFRIT_W4Rf74sg2Zeu9Yd6ON9H44pNoe0fQJcZQB15gWrJdw2UUhJh5KznGdKRa47F57t_5s8NKkHQnnP-PANl9W70XKI15q27sTf2DCP9csx7f9rRGaAGolMKKoT62k3NdH_PkS8SzjFe0XgF8S3zvAS4BhZT8Zw_exNWGZI-MGPwQzcpqIClFMyEfDOFk9MDJFctEmi0gAA"
};


var url = "http://localhost:8080/LiveBrowser/secure/aad";
//this function uses refresh token - but the Redirect URL is better
//out.println("------------- testing getAccessToken");
//result = waadSSO.getAccessToken(payload);
//out.println(JSON.stringify(result, null, 2));
//out.println("-------------");


out.println("------------- testing getRedirectURL");
result = waadSSO.getRedirectURL(url);
out.println(result);
out.println("-------------");
payload.accessToken = result.accessToken;

var fullURL = "http://localhost:8080/LiveBrowser/secure/aad?code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGDPvkj4yz6UiB8EGe6bgV6xt6VdX5ViCaXLXQOxkAmQz3vfVSqPg17_Ly0ADiKOW265Z-TXPWBSMEwbGO9KRXeBL7ijpx2MA2bb0nOytfIczlO_4iMiF38R7xZI9j3CzergeQZ3c-1Zstp88uxOKZsqD1KD9CqYDF90wdvwkuOeKaZJGtFSwRbfiuJvrzLqsnKUavagRFGBBw-SJpyF3WDhorozTZqxvQoi3oFw8aDOuZIULVrBZjBp3BUZPGyIwMBG_nKwvuy-9iAhHkdANulT_4kUZhwXwFJL_APsml1hAdlsU_71u0Tmgl1b7RQDAIRspGYbHDcdhw9JNGgRPnbCaql-P7dlERCQedpaJKRNFgsEphZreYlm2me34XkQC-B2CPguzeLoBnNaabosBBhXf8F2sT3KqkW0GbnaMCz32ET_eUi6ghfJYz-8A7ufQtlLFrQu2EdMkTPmaF3BFdHOSm9LgfD4BHHGKIkzjqaKhzPKKoKvTDaYdZl4kfdbffEQdhEeBoaDEHajHlQu4bDUgAA&session_state=0cb13c93-3790-41c1-a464-d7fb3df8d0fc";
var redirectURL = "http://localhost:8080/LiveBrowser/secure/aad";



out.println("------------- testing getAccessTokenFromURL");
result = waadSSO.getAccessTokenFromURL(fullURL,redirectURL);
out.println(JSON.stringify(result, null, 2));
//out.println("First field is " + result.fields[0].name);
out.println("-------------");


out.println("------------- testing getConfigInfo");
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

//-------------utility to ask waad for all available groups ------

out.println("------------- testing getAllGroups");
result = waadSSO.getAllGroups(payload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");

