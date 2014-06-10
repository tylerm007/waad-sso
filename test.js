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
		var waad = new com.espressologic.waad.authentication.WaadAuthentication();
		var result = waad.isAuthenticated(code,tenantName,clientId,clientSecret);
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

var payload = {
    token: "AwABAAAAvPM1KaPlrEqdFSBzjqfTGMTDkSilYzBnRLYjHxT0zIQhN-2E1bRRmPWE976oe685CZbsKYDborOkKL6qJht7Jlm0nc8RTKecQIhV2dPVlVAcDEdW_JGAis9RRU9H1Usa35Fq_PJAAPqAuidCH8jTtgOYn89U49MEImcwxksBXsQTbu79qmrNPw6YRuoUtSYWhAT3IxztQkBU0HXSh6_L9y8NyQvdDmp8Oe_851Ya7IIyv7Co7wLTGdNGGuZ5LpNqrxWfDi9Lh8f_EaGCVDfEHRFZLNBmxRQd-pNhlal0v74XGw3d7HvVfgOd59K-odYRF7hCdIWtqRU1N3JnMk_SkqwBOoqTr0m_GD2Bzsw1rfZF2uO1-zeJHvO2ugHQb7z2_2FfWJz8bDvQ-nk81M9U8A5fW0ebwEraM3awAfy4Vd6g49n5NmGmAuhbwip_-obUATgu0PYqimndtk253d1uLp2kZPyYdSTF17VDcncVNyX6RIfoLfATC8STyDuTES2Kp8T8KTIjcj6i21LaFsaM8InnPsSC62RnaI569izIe6EgAA",
    refreshToken: ""
};


out.println("------------- testing authenticate with empty payload");
var result = waadSSO.authenticate(payload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");


out.println("------------- testing authenticate with emoty payload");
badPayload = {
   token : null
};

result = waadSSO.authenticate(badPayload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");

var tenant = "tylerm007gmail.onmicrosoft.com";
out.println("------------- testing getAllGroups");
//result = waadSSO.getAllGroups(tenant);
//out.println(JSON.stringify(result, null, 2));
out.println("-------------");


