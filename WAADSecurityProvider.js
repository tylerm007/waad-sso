//Upload this JavaScript to EspressoLogic WAAD SSO Authentication Provider
function waadSecurityProvider() {

    var result = {};
    var redirectURL = {};
	out = java.lang.System.out;
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

	result.isAuthenticated = function isAuthenticated(url){
		var result = false;
		if( url != null && (url.indexOf("code") > -1 || url.indexOf("id_token") > -1)){
			result = true;
		}
		return result;
	};

	result.containsAuthenticationData = function containsAuthenticationData(url){
		var result = false;
		if( url != null && url.indexOf("error") <= -1 && (url.indexOf("code") > -1 || url.indexOf("id_token") > -1)){
			result = true;
		}
		return result;
	};
    // internal helper function to encode header values
    var createSettings = function (accesToken) {
        var params = null;
        var settings = {
             headers: { 'Authorization' : accesToken }
        };
        return settings;
    };

    //NOTE: the function configure must be called first - this will validate the stormpath user account
    //FUNCTION AUTHENTICATE REQUIRES PAYLOAD {accessToken : '', refershToken : ''}
    result.authenticate = function authenticate(payload) {

        var roles = [];
        var errorMsg = null;
        var resetPasswordURL = null;
        var forgotPasswordURL = null;
        var customDataHREF = {};
        var params = null;
		var accessToken = null;
		var refreshToken = null;
		var userId = null;
		var identityProvider;
        try {

            //POST this JSON request to determine if username and password account is valid
            var accessTokenResult = SysUtility.getAccessToken(payload.refreshToken,configSetup.tenantName,configSetup.clientId,configSetup.clientSecret);

            var accessTokenJSON = JSON.parse(accessTokenResult);
            //out.println(JSON.stringify(accessTokenJSON, null, 2));
            /* this is the object values returned if authenticated not used except access token - */
             if (accessTokenJSON.hasOwnProperty('accessToken')) {
			        accessToken =accessTokenJSON.accessToken;
			        refreshToken = accessTokenJSON.refreshToken;
			        var expiresOn = accessTokenJSON.expiresOn;
			        var userInfo = accessTokenJSON.userInfo;
        			userId = userInfo.userId;
					identityProvider = userInfo.identityProvider;
					if(userId != null){
						payload.accessToken = accessToken;
						roles = findGroupInfoForUser(payload,userId);
					}
			} else {
				if (accessTokenJSON.hasOwnProperty('error_description')) {
					 errorMsg = "message: " + accessTokenJSON.error_description;
				}
			}

        }catch (e) {
			errorMsg = e.message;
        }

        var autResponse = {
            errorMessage: errorMsg,
            roleNames: roles,
            userIdentifier: userId,
            keyExpiration: new Date(+new Date() + (+configSetup.keyLifetimeMinutes) * 60 * 1000),
            resetPasswordURL: resetPasswordURL,
            forgotPasswordURL: forgotPasswordURL,
            userData: customDataHREF,
            accessToken : accessToken,
            refreshToken : refreshToken,
            lastLogin : {
                datetime: null,
                ipAddress : null
            }
        };
        return autResponse;
    };

    //FUNCTION getAccessTokenFromURL - use the URL returned from WAAD to get the access token we need to find group info
    result.getAccessTokenFromURL = function getAccessTokenFromURL(fullURL,redirectURL){
	var roles = [];
	var errorMsg = null;
	var resetPasswordURL = null;
	var forgotPasswordURL = null;
	var customDataHREF = {};
	var identityProvider;
	var userId;
	var params = null;
	var accessToken = null;
	var refreshToken = null;
	try {
		var result = SysUtility.getAccessTokenFromURL(configSetup.tenantName,configSetup.clientId,configSetup.clientSecret,fullURL,redirectURL);
		var accessTokenJSON = JSON.parse(result);
        if (accessTokenJSON.hasOwnProperty('accessToken')) {
			accessToken =accessTokenJSON.accessToken;
			refreshToken = accessTokenJSON.refreshToken;
			var expiresOn = accessTokenJSON.expiresOn;
			var userInfo = accessTokenJSON.userInfo;
			userId = userInfo.userId;
			identityProvider = userInfo.identityProvider;

		} else {
			if (accessTokenJSON.hasOwnProperty('error_description')) {
				 errorMsg = "message: " + accessTokenJSON.error_description;
			}
		}
	 }catch (e) {
		errorMsg = e.message;
	 }
        var autResponse = {
			errorMessage: errorMsg,
			userIdentifier: userId,
			accessToken : accessToken,
            refreshToken : refreshToken
		};
        return autResponse;
	};

 	//FUNCTION getRedirectURL to get the rediret URL from the currentUri
    result.getRedirectURL = function getRedirectURL(currentUri){
		return redirectURL = SysUtility.getRedirectURL(configSetup.tenantName,configSetup.clientId,configSetup.clientSecret,currentUri);
	};

	//FUNCTION getGroupForUser - make a REST call
	result.getGroupForUser = function getGroupForUser(identityProvider){
		var roles = [];
		var token = '';
		var userPrincipalName = "";
		var groupsURL = WAAD_GRAPHAPI_BASE_URL + '/' + configSetup.tenantName + '/users/'+identityProvider+'/memberOf?'+configSetup.apiVersion;
		out.println(groupsURL);
		var settings = {
			headers: { 'Authorization' : payload.accessToken }
        };
		var groupsResponse = SysUtility.restGet(groupsURL, params, settings);
		var groups = JSON.parse(groupsResponse);
		out.println(groups);
		if(groups != null && groups.hasOwnProperty('value')){
			for (var i = 0; i < groups.value.length; i++) {
				roles.push(groups.value[i].displayName);
			}
		}
		return roles;

	};
	// FUNCTION findGroupInfoForUser using the current accessToken and userPrincipalName
	result.findGroupInfoForUser = function findGroupInfoForUser(payload ,userPrincipalName){
		var result = SysUtility.findGroupInfoForUser(configSetup.tenantName,configSetup.clientId,configSetup.clientSecret,payload.accessToken ,userPrincipalName);
		return result;
	};
    //FUNCTION getAllGroups is used to map all available groups for existing application - DO NOT CHANGE
    result.getAllGroups = function getAllGroups(payload) {
        var roles = [];
        var errorMsg = null;
        var groupsURL = WAAD_GRAPHAPI_BASE_URL + '/' + configSetup.tenantName + '/groups?'+configSetup.apiVersion;
        var params = null;
		var accessToken = null;
		if(payload.hasOwnProperty('accessToken')){
			accessToken =  payload.accessToken;
		}
        try {
			var settings = {
				headers: { 'Authorization' : accessToken }
			};
			//out.println(JSON.stringify(payload,null,2));
            var groupsResponse = SysUtility.restGet(groupsURL, params, settings);
            var groups = JSON.parse(groupsResponse);

			if(groups != null && groups.hasOwnProperty('value') ){
				for (var i = 0; i < groups.value.length; i++) {
					roles.push(groups.value[i].displayName);
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
    //we pass in our app url - if it contains authentication code we use it to populate our dialog
    result.getLoginInfo = function getLoginInfo(url) {
		var accessToken = null;
		var refreshToken = null;
		var error = null;
		var redirectURL = {};
		var autoLogin = false;
		var name = "Microsoft Azure Active Directory";
		var currentUri = url;
		var userId = null;
		var myRedirectURL = null;

		try{
			if(url != null && url.length > 10 && url.indexOf("?") > -1 && url.indexOf("code") > -1){

				var urlArray = url.split("?");
				currentUri = urlArray[0];
				//var codePart = urlArray[1].split("&");
				//if(url contains accessToken then redirectURL will be extracted and returned){
				//var fullCode = codePart[0];//extract code= from user and remove the trailing stuff
				//var accessToken = (fullCode.split("="))[1]
				var result = SysUtility.getAccessTokenFromURL(configSetup.tenantName,configSetup.clientId,configSetup.clientSecret,url,currentUri);
				var  accessTokenJSON = JSON.parse(result);
				if (accessTokenJSON != null && accessTokenJSON.hasOwnProperty('accessToken')) {
					accessToken =accessTokenJSON.accessToken;
					refreshToken = accessTokenJSON.refreshToken;
					var expiresOn = accessTokenJSON.expiresOn;
					var userInfo = accessTokenJSON.userInfo;
					userId = userInfo.userId;
					currentUri = null;
					autoLogin = true;
				} else {
					if (accessTokenJSON.hasOwnProperty('error_description')) {
						 error = "message: " + accessTokenJSON.error_description;
					}
				}

			}

			if(currentUri != null){
				var result = SysUtility.getRedirectURL(configSetup.tenantName,configSetup.clientId,configSetup.clientSecret,currentUri);
				myRedirectURL = ""+result;
			}
			redirectURL = { "name" : name, "redirectURL" : myRedirectURL };
			java.lang.System.out.println(redirectURL);
		} catch(e){
			error = e.message;
		}

	  return {
			redirectURL : redirectURL,
			autoLogin : autoLogin,
			errorMessage: error,
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
					name: "refreshToken",
					display: "refreshToken",
					description: "Enter your refreshToken",
					type: "text",
					defaultValue: refreshToken,
					length: 80,
					helpURL: "https://login.microsoftonline.com/login.srf"
                },
                {
					name: "userIdentity",
					display: "user identity",
					description: "Enter your user identity",
					type: "text",
					defaultValue: userId,
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
