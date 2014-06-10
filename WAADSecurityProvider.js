//Upload this JavaScript to EspressoLogic WAAD SSO Authentication Provider
function waadSecurityProvider() {

    var result = {};
    var accessToken;
	var refreshToken;
    var WAAD_GRAPHAPI_BASE_URL = "https://graph.windows.net";
    var configSetup = {
        keyLifetimeMinutes : 60,
        authority :"https://login.windows.net",
		tenantName : "",
		clientId : "",
		clientSecret : "",
   		apiVersion : "api-version=2013-11-08"
    };

    //FUNCTION this call must be made first to pass in the required WAAD Webgraph API configuration values
    result.configure = function configure(myConfig) {
        configSetup.keyLifetimeMinutes = myConfig.keyLifetimeMinutes || 60;
		configSetup.authority = myConfig.authority || "https://login.windows.net",
		configSetup.tenantName = myConfig.tenantName || "",
		configSetup.clientId = myConfig.clientId ||  "",
		configSetup.clientSecret = myConfig.clientSecret || "",
   		configSetup.apiVersion = myConfig.apiVersion || "api-version=2013-11-08"
    };


    // the btoa function is not available in Rhino - this is a helper function.
    var encodeBase64 =  function encodeBase64(input) {
        var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var output = "", a, b, c, d, e, f, g, i = 0;

        while (i < input.length) {
            a = input.charCodeAt(i++);
            b = input.charCodeAt(i++);
            c = input.charCodeAt(i++);
            d = a >> 2;
            e = ((a & 3) << 4) | (b >> 4);
            f = ((b & 15) << 2) | (c >> 6);
            g = c & 63;

            if (isNaN(b)) f = g = 64;
            else if (isNaN(c)) g = 64;

            output += map.charAt(d) + map.charAt(e) + map.charAt(f) + map.charAt(g);
        }

         return output;
    };

    // internal helper function to encode header values
    var createSettings = function (accesToken) {
        //var auth = 'Basic ' + encodeBase64(configSetup.clientId + ':' + configSetup.clientSecret);
        var params = null;
        var settings = {
             headers: { 'bearer' : accesToken }
        };
        return settings;
    };

    //NOTE: the function configure must be called first - this will validate the stormpath user account
    //FUNCTION AUTHENTICATE REQUIRES PAYLOAD {username : '', password : ''}
    result.authenticate = function authenticate(payload) {
        var RESERVED_FIELDS_HREF =  [ 'href', 'createdAt', 'modifiedAt'];

        //helper function to return an named value pairs of customData (exlude reserved fields)
        var parseCustomData =  function parseCustomData(result, stringHREF) {
            for (var id in stringHREF) {
                if (!stringHREF.hasOwnProperty(id)) {
                    continue;
                }
                if (RESERVED_FIELDS_HREF.indexOf(id) != -1) {
                    continue;
                }
                if (stringHREF.hasOwnProperty('customData')) {
                    var customdata = stringHREF[id];
                    for (var key in customdata) {
                        result[key] = customdata[key];
                    }
                }
            }
        };

        var roles = [];
        var errorMsg = null;
        var resetPasswordURL = null;
        var forgotPasswordURL = null;
        var customDataHREF = {};
        var params = null;


        var graphURL = WAAD_GRAPHAPI_BASE_URL + '/' + configSetup.tenant + '/';
		var upn = "";
        try {
			out.println(payload);
            //POST this JSON request to determine if username and password account is valid
            var accessToken = SysUtility.isAuthenticated(payload.token,configSetup.tenantName,configSetup.clientId,configSetup.clientSecret);

            var accessTokenJSON = JSON.parse(accessToken);
            out.println(accessTokenJSON);
            /* this is the object values returned if authenticated*/
             if (accessTokenJSON.hasOwnProperty('accessToken')) {
             		var accessTokenType = accessTokenJSON.accessTokenType;
			        accessToken =accessTokenJSON.accessToken;
			        refreshToken = accessTokenJSON.refreshToken;
			        var expiresOn = accessTokenJSON.expiresOn;
			        var userInfo = accessTokenJSON.userInfo;
        			var isMultipleResourceRefreshToken = accessTokenJSON.isMultipleResourceRefreshToken;

        			var userId = userInfo.userId;
					var givenName = userInfo.givenName;
					var familyName = userInfo.familyName;
					var identityProvider = userInfo.identityProvider;
        			var isDisplayable = userInfo.isUserIdDisplayable;
        			upn = identityProvider;
		} else {

            if (accessTokenJSON.hasOwnProperty('responseCode')) {
                 errorMsg = "message: " + accessTokenJSON.responseMessage;
            }
		}
            var token = '';
            var userPrincipalName = "";
            var groupsURL = WAAD_GRAPHAPI_BASE_URL + '/' + configSetup.tenantName + '/users/'+upn+'/memberOf?'+configSetup.apiVersion;
       		var settings = createSettings(accessToken);
		   	var groupsResponse = SysUtility.restGet(groupsURL, params, settings);
		   	var groups = JSON.parse(groupsResponse);

		   	for (var i = 0; i < groups.items.length; i++) {
				roles.push(groups.items[i].name);
		   	}

        }catch (e) {
            errorMsg = e.message;
        }

        var autResponse = {
            errorMessage: errorMsg,
            roleNames: roles,
            userIdentifier: upn,
            keyExpiration: new Date(+new Date() + (+configSetup.keyLifetimeMinutes) * 60 * 1000),
            resetPasswordURL: resetPasswordURL,
            forgotPasswordURL: forgotPasswordURL,
            userData: customDataHREF,
            lastLogin : {
                datetime: null,
                ipAddress : null
            }
        };
        return autResponse;
    };

    //FUNCTION getAllGroups is used to map all available groups for existing application - DO NOT CHANGE
    result.getAllGroups = function getAllGroups(userPrincipal) {
        var roles = [];
        var errorMsg = null;
        var groupsURL = WAAD_GRAPHAPI_BASE_URL + '/' + configSetup.tenantName + '/groups/'+userPrincipal+'/memberOf?'+configSetup.apiVersion;
        var params = null;
        var settings = createSettings(accessToken);

        try {
            var groupsResponse = SysUtility.restGet(groupsURL, params, settings);
            var groups = JSON.parse(groupsResponse);

            for (var i = 0; i < groups.items.length; i++) {
                if ('ENABLED' === groups.items[i].status) {
                    roles.push(groups.items[i].name);
                }
            }
        }
        catch(e) {
            errorMsg = e.message;
        }

        var autResponse = {
            errorMessage: errorMsg,
            roleNames: roles
        };

        return autResponse;
    };
    //FUNCTION getLoginInfo is used to create the logon dialog - DO NOT CHANGE
    result.getLoginInfo = function getLoginInfo(url) {
		var accessToken = "";//extract code= from user and remove the trailing stuff
		var redirectURL = null;
		var autoLogin = false;
		if(url != null && url.length > 1){
			var urlArray = url.split("?");
			var codePart = urlArray[1].split("&");
			//if(url contains accessToken then redirectURL will be extracted and returned){
			var accessToken = codePart[0];//extract code= from user and remove the trailing stuff
			var redirectURL = urlArray[0];
			autoLogin = true;
		}

        return {
			redirectURL : redirectURL,
			autoLogin : autoLogin,
            fields: [
                {
                    name: "accessToken",
                    display: "accessToken",
                    description: "Enter your accessToken",
                    type: "text",
                    defaultValue: accessToken,
                    length: 80,
                    helpURL: "https://login.microsoftonline.com/login.srf"
                },
                {
                    name: "redirectURL",
                    display: "redirectURL",
                    description: "Enter your redirectURL",
                    type: "text",
                    length: 80,
                    helpURL: "https://login.microsoftonline.com/login.srf"
                }
            ],
            links : [
                {
                    display: "Forgot password?",
                    href: "https://login.microsoftonline.com/login.srf"
                },
                {
                    display: "Forgot Tenant?",
                    href: "https://login.microsoftonline.com/login.srf"
                }
            ]
        };
    };

    result.sendMessage = function sendMessage(url,params,settings){
        var response = SysUtility.restGet(url, params, settings);
       return JSON.parse(response);
    };
    result.getConfigInfo = function getConfigInfo() {
        return {
            current : {
				"authority" : configSetup.authority,
                "tenantName" : configSetup.tenantName,
                "clientId" : configSetup.clientId,
                "clientSecret" : configSetup.clientSecret,
                "apiVersion" : configSetup.apiVersion,
                "keyLifetimeMinutes" : configSetup.keyLifetimeMinutes
            },
            fields : [
                {
                    name: "authority",
                    display: "Authority",
                    type: "text",
                    defaultValue: "https://login.windows.net/",
                    length: 40,
                    helpURL: "http://azure.microsoft.com/en-us/documentation/articles/fundamentals-identity/"
                },
                {
                    name: "tenantName",
                    display: "Tenant Name",
                    type: "text",
                    defaultValue: "useremail.onmicrosoft.com",
                    length: 40,
                    helpURL: "http://azure.microsoft.com/en-us/documentation/articles/fundamentals-identity/"
                },
                {
                    name: "clientId",
                    display: "Client ID",
                    type: "text",
                    defaultValue: "MY_APPLICATION_CLIENT_ID",
                    length: 40,
                    helpURL: "http://azure.microsoft.com/en-us/documentation/articles/fundamentals-identity/"
                },
                 {
					name: "clientSecret",
					display: "Client Secret Key",
					type: "password",
					defaultValue : "MY_CLIENT_APP_GENERATED_KEY",
					length: 40,
					helpURL: "http://azure.microsoft.com/en-us/documentation/articles/fundamentals-identity/"
                },
                 {
					name: "apiVersion",
					display: "API Version",
					defaultValue: "api-version=2013-11-08",
					type: "text",
					length: 40,
					helpURL: "http://azure.microsoft.com/en-us/documentation/articles/fundamentals-identity/"
                },
                {
                    name: "keyLifetimeMinutes",
                    display: "API Key Lifetime (Minutes)",
                    type: "number",
                    defaultValue: 60,
                    length: 8,
                    helpURL: "http://www.espressologic.com"
                }
            ],
            links: []
        };
    };

    return result;
}
