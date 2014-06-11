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

    isAuthenticated : function isAuthenticated(code, tenantName, clientId, clientSecret){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(this);
		var result = waad.isAuthenticated(code,tenantName,clientId,clientSecret);
		return result;
	},
	getRedirectURL : function getRedirectUrl(currentUri){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(this);
		var result = waad.getRedirectUrl(currentUri);
		return result;
	},
	getAccessToken : function getAccessToken(code, tenantName, clientId, clientSecret, uri){
		var waad = new com.espressologic.waad.authentication.WaadAuthentication(this,tenantName,clientId,clientSecret);
		var result = waad.getAccessToken(code,uri);
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
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0IiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjBjZTEyYTctN2NhYy00MGJiLThkZDEtNDlkMWFiMjFjMDgzLyIsImlhdCI6MTQwMjQ0NjczNiwibmJmIjoxNDAyNDQ2NzM2LCJleHAiOjE0MDI0NTA2MzYsInZlciI6IjEuMCIsInRpZCI6IjIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4MyIsImFtciI6WyJwd2QiXSwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDM0MDAxQjFCQzc3MjMiLCJpZHAiOiJsaXZlLmNvbSIsIm9pZCI6Ijk3Y2U3MmM5LTkwNjQtNDM0OS1hNDBkLWY2YzExMjViMzczZCIsInN1YiI6IkFCcUtVbFNELVg4VndLUG5kSm1Dd2hRV0pIMXdHQmdZWGRDbERudmNnbnMiLCJlbWFpbCI6InR5bGVybTAwN0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiVHlsZXIiLCJmYW1pbHlfbmFtZSI6IkJhbmQiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3R5bGVybTAwN0BnbWFpbC5jb20iLCJhcHBpZCI6ImM2MjBkMDVlLWU1MTUtNDBkYS1hM2QyLWVjZmU4OWVlMjJjZCIsImFwcGlkYWNyIjoiMSIsInNjcCI6IkRpcmVjdG9yeS5SZWFkIHVzZXJfaW1wZXJzb25hdGlvbiBVc2VyUHJvZmlsZS5SZWFkIiwiYWNyIjoiMSJ9.NBOPmz5nZIlqo4QhLcEUyvpP7eqpYw4Whxi4uECOgRw8DD3xbfd5RnoPnB3M6a0sVfFH_PLTMg_jP2Bc97it32K9Y4KO0lL6KlLJ9S2onHQTi-WoVxVxMGkuZOicwVQRETrKH_1D1V8sr-HbYK0l2rD0dzF6j0X7JAFGJ_h47HXngyGz0Rmme68c33utNN8_CMNXAYMN7_QaQNQ3DcBs0WfV7woxdN61rmPeyElBjO-lJDmQESOtPxp8OhzR-IpthBqsDQyNI38E5XGkbxNQlXp_mUAH_SFma96DpCZ5PgyTPVoZgSocPtDJFnmuusfahy3eI4MZB0ZLEM1gs-a9Aw",
    refreshToken: "AwABAAAAvPM1KaPlrEqdFSBzjqfTGBoqWwWbbMfVuHnIblQhM82Jy7ShjBJNyt2PjlmB-00AH9i_N8qesTqzGT8DsmHVbbbwAW9ZfRuVYbz9EOaU8K4qXoklv5AMrbsEjsLb4TESsk_WB_xMfOhQSZuKqhiB9xpwpzxBbfj1wfPjtqUEdy1Tyq8Wt6gFGPZQaAn03lIx2A0705Jx3JchM63dYCBequvdUlTEMuZ7sVaqAi-DMcgiz79dvkyiVgowPpRlfIrh_1zyLh4ThhtqvO7XahuJuSQIQ34jC-jcLcWJFnRMvwgcV4StnaZmrjmfhVhqXe3yRHQDhKCrWo-8Ls3p8ptipDPvqTfQnhhalgSOpJsItwKrBXlIQ8oIJQOQt1WPj5mt9wAQLvKyqM8gAvB0k8x1hhVUo5jw6Ix5tL02Lbu-CrT0sg3OgULc3C4m41lXYmI-I1rBQj8mIJ5C5ztWj8e62iAA"
};


var url = "http://localhost:8080/LiveBrowser/secure/aad";
//out.println("------------- testing getAccessToken");
//result = waadSSO.getAccessToken(payload.refreshToken,url);
//out.println(result);
//out.println("-------------");

var url = "http://localhost:8080/LiveBrowser/secure/aad";
out.println("------------- testing getRedirectURL");
result = waadSSO.getRedirectURL(url);
out.println(result);
out.println("-------------");

var url = "http://localhost:8080/LiveBrowser/secure/aad?code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGMTDkSilYzBnRLYjHxT0zIQhN-2E1bRRmPWE976oe685CZbsKYDborOkKL6qJht7Jlm0nc8RTKecQIhV2dPVlVAcDEdW_JGAis9RRU9H1Usa35Fq_PJAAPqAuidCH8jTtgOYn89U49MEImcwxksBXsQTbu79qmrNPw6YRuoUtSYWhAT3IxztQkBU0HXSh6_L9y8NyQvdDmp8Oe_851Ya7IIyv7Co7wLTGdNGGuZ5LpNqrxWfDi9Lh8f_EaGCVDfEHRFZLNBmxRQd-pNhlal0v74XGw3d7HvVfgOd59K-odYRF7hCdIWtqRU1N3JnMk_SkqwBOoqTr0m_GD2Bzsw1rfZF2uO1-zeJHvO2ugHQb7z2_2FfWJz8bDvQ-nk81M9U8A5fW0ebwEraM3awAfy4Vd6g49n5NmGmAuhbwip_-obUATgu0PYqimndtk253d1uLp2kZPyYdSTF17VDcncVNyX6RIfoLfATC8STyDuTES2Kp8T8KTIjcj6i21LaFsaM8InnPsSC62RnaI569izIe6EgAA&session_state=336e332c-4ded-456d-96a5-d294b6c58fbc";
out.println("------------- testing getLoginInfo");
result = waadSSO.getLoginInfo(url);
out.println(JSON.stringify(result, null, 2));
//out.println("First field is " + result.fields[0].name);
out.println("-------------");

out.println("------------- testing getConfigInfo");
result = waadSSO.getConfigInfo();
out.println(JSON.stringify(result, null, 2));
//out.println("First config prop is " + result.fields[0].name);
out.println("-------------");


out.println("------------- testing authenticate with refreshToken in payload");
var result = waadSSO.authenticate(payload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");


out.println("------------- testing authenticate with empty payload");
badPayload = {
   token : null,
   refreshToken : null
};

result = waadSSO.authenticate(badPayload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");

var tenant = "tylerm007gmail.onmicrosoft.com";
out.println("------------- testing getAllGroups");
//result = waadSSO.getAllGroups(tenant);
//out.println(JSON.stringify(result, null, 2));
out.println("-------------");


