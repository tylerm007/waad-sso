package com.espressologic.waad.authentication;

/**
 * Copyright 2014 - Espresso Logic
 * This package was designed to use Microsoft Azure Active Directory 
 * to authenticate and return access tokens and group roles from JavaScript calls.
 * 
 * In JavaScript - use these functions to get an access token using the redirected URL or use
 * the refreshToken to get a fresh access token.
 *  getAccessToken : function getAccessToken(refreshToken, tenantName, clientId, clientSecret){
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
 }
 * 
 * author: tband
 * date: June 2014
 */
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import javax.naming.ServiceUnavailableException;

import org.json.JSONArray;
import org.json.JSONObject;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;
import com.microsoft.aad.adal4j.ClientCredential;
import com.microsoft.aad.adal4j.UserInfo;
import com.nimbusds.oauth2.sdk.AuthorizationCode;
import com.nimbusds.openid.connect.sdk.AuthenticationResponseParser;
import com.nimbusds.openid.connect.sdk.AuthenticationSuccessResponse;

public class WaadAuthentication {

	private String clientId = "";
	private String clientSecret = "";
	private String tenant = "";
	private final String authority = "https://login.windows.net/";
	private final String resource = "https://graph.windows.net";
	private final String management = "https://management.core.windows.net/";

	public WaadAuthentication() {

	}

	public WaadAuthentication(String tenant, String clientId, String clientSecret) {
		this.tenant = tenant;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	/**
	 * This method is called after the successful logon and redirect from WAAD
	 * this will return both an accessToken and a refreshToken as well as an
	 * expire time
	 * 
	 * @param fullUrl
	 * @param currentUri
	 * @return
	 * @throws Throwable
	 */
	public String getAccessTokenFromURL(String fullUrl, String currentUri) throws Throwable {
		String result = null;
		try {
			AuthenticationSuccessResponse oidcResponse = (AuthenticationSuccessResponse) AuthenticationResponseParser
					.parse(new URI(fullUrl));
			AuthenticationResult authResult = getAccessToken(oidcResponse.getAuthorizationCode(), currentUri);
			result = convertToJson(authResult);
		} catch (Exception ex) {
			result = String.format("Request for getAccessTokenFromURL auth code failed: %s", ex.getMessage());
		}
		return result;
	}

	/**
	 * this will locate the users group links and then iterate over them to get
	 * each group
	 * 
	 * @param accessToken
	 * @param userPrincipleName
	 * @return
	 * @throws Exception
	 */
	public String findGroupInfoForUser(String accessToken, String userPrincipleName) throws Throwable {
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		String sep = "";
		JSONObject jobj, group;
		try {
			String groupLinks = findAllGroups(accessToken, "/users/" + userPrincipleName + "/$links/memberOf");
			JSONArray jarray = toJSONArray(groupLinks, "value");
			for (int i = 0; jarray != null && i < jarray.length(); i++) {
				String json = jarray.getString(i);
				jobj = toJSONObject(json, "value");
				String path = jobj.getString("url");
				String link = path.substring(path.indexOf("directory") - 1);
				String groups = findAllGroups(accessToken, link);
				group = toJSONObject(groups, "value");// get displayName
				sb.append(sep);
				appendValues("group", group.getString("displayName"), sb, true);
				sep = ",";
			}
		} catch (Exception e) {
			appendValues("error", e.getMessage(), sb, true);
		} catch (Throwable t) {
			appendValues("error", t.getMessage(), sb, true);
		}

		sb.append("\n}");
		return sb.toString();
	}

	private JSONArray toJSONArray(String jsonString, String type) {
		JSONArray jarray = null;
		try {
			jarray = new JSONObject(jsonString).getJSONArray(type);
		} catch (Exception e) {
		}
		return jarray;
	}

	private JSONObject toJSONObject(String jsonString, String type) {
		JSONObject jobj = null;
		try {
			jobj = new JSONObject(jsonString);// .getJSONObject(type);
		} catch (Exception e) {
		}
		return jobj;
	}

	public String findAllGroups(String accessToken, String path) throws Throwable {
		String apiVersion = "api-version=2013-11-08";
		BufferedReader reader = null;
		HttpURLConnection conn = null;
		StringBuffer stringBuf = new StringBuffer();

		try {
			URI uri = new URI("https", "graph.windows.net", "/" + this.tenant + path, apiVersion, null);

			URL url = uri.toURL();
			conn = (HttpURLConnection) url.openConnection();

			conn.setRequestProperty("Authorization", accessToken);
			conn.setRequestProperty("Accept", "application/json");

			reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));

			String inputLine;

			while ((inputLine = reader.readLine()) != null) {
				stringBuf.append(inputLine);
			}

		} catch (Throwable ex) {
			throw ex;
		}
		return stringBuf.toString();
	}

	/**
	 * return JSON string
	 * 
	 * @param refreshToken
	 * @param tenant
	 * @param clientId
	 * @param clientSecret
	 * @return
	 * @throws Throwable
	 */
	public String getAccessToken(String refreshToken, String tenant, String clientId, String clientSecret) throws Throwable {
		AuthenticationResult result = getAccessTokenResult(refreshToken, tenant, clientId, clientSecret);
		// convert this to a JSON array
		return convertToJson(result);
	}

	/**
	 * return AuthenticationResult object - will use refresh token if present,
	 * else the client credentials are used
	 * 
	 * @param refreshToken
	 * @param tenant
	 * @param clientId
	 * @param clientSecret
	 * @return
	 * @throws Throwable
	 */
	public AuthenticationResult getAccessTokenResult(String refreshToken, String tenant, String clientId, String clientSecret)
			throws Throwable {
		this.tenant = tenant;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		if (refreshToken != null && refreshToken.length() > 1) {
			return getAccessTokenFromRefreshToken(refreshToken, null);
		} else {
			return this.getAccessTokenFromClientCredentials();
		}
	}

	/**
	 * using the clientId and clientSecret plus tenant information - retrieve
	 * the access token
	 * 
	 * @return
	 * @throws Throwable
	 */
	private AuthenticationResult getAccessTokenFromClientCredentials() throws Throwable {
		AuthenticationContext context = null;
		AuthenticationResult result = null;
		ExecutorService service = null;

		try {
			service = Executors.newFixedThreadPool(1);
			context = new AuthenticationContext(authority + tenant + "/", true, service);
			Future<AuthenticationResult> future = context.acquireToken(management, new ClientCredential(clientId, clientSecret),
					null);
			result = future.get();
		} catch (ExecutionException e) {
			throw e.getCause();
		} finally {
			service.shutdown();
		}

		if (result == null) {
			throw new ServiceUnavailableException("authentication result was null");
		}
		return result;
	}

	/**
	 * Use the refresh token and credentials to get the access token
	 * 
	 * @param refreshToken
	 * @param currentUri
	 * @return
	 * @throws Throwable
	 */
	private AuthenticationResult getAccessTokenFromRefreshToken(String refreshToken, String currentUri) throws Throwable {
		AuthenticationContext context = null;
		AuthenticationResult result = null;
		ExecutorService service = null;
		try {
			service = Executors.newFixedThreadPool(1);
			context = new AuthenticationContext(authority + tenant + "/", true, service);
			Future<AuthenticationResult> future = context.acquireTokenByRefreshToken(refreshToken, new ClientCredential(clientId,
					clientSecret), null, null);
			result = future.get();
		} catch (ExecutionException e) {
			throw e.getCause();
		} finally {
			service.shutdown();
		}

		if (result == null) {
			throw new ServiceUnavailableException("authentication result was null");
		}
		return result;

	}

	/**
	 * internal helper method
	 * 
	 * @param authorizationCode
	 * @param currentUri
	 * @return
	 * @throws Throwable
	 */
	private AuthenticationResult getAccessToken(AuthorizationCode authorizationCode, String currentUri) throws Throwable {
		String authCode = authorizationCode.getValue();
		ClientCredential credential = new ClientCredential(clientId, clientSecret);
		AuthenticationContext context = null;
		AuthenticationResult result = null;
		ExecutorService service = null;
		try {
			service = Executors.newFixedThreadPool(1);
			context = new AuthenticationContext(authority + tenant + "/", true, service);
			Future<AuthenticationResult> future = context.acquireTokenByAuthorizationCode(authCode, new URI(currentUri),
					credential, null);
			result = future.get();
		} catch (ExecutionException e) {
			throw e.getCause();
		} finally {
			service.shutdown();
		}

		if (result == null) {
			throw new ServiceUnavailableException("authentication result was null");
		}
		return result;
	}

	/**
	 * return the URL to redirect to after authorized
	 * 
	 * @param currentUri
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	public String getRedirectUrl(String currentUri) throws UnsupportedEncodingException {
		String redirectUrl = authority + this.tenant + "/oauth2/authorize?response_type=code&redirect_uri="
				+ URLEncoder.encode(currentUri, "UTF-8") + "&client_id=" + this.clientId
				+ "&resource=https%3a%2f%2fgraph.windows.net" + "&nonce=" + UUID.randomUUID() + "&site_id=500879";
		return redirectUrl;
	}

	private String convertToJson(AuthenticationResult result) {
		StringBuffer sb = new StringBuffer();
		if (result != null) {
			sb.append("{\n");
			appendValues("refreshToken", result.getRefreshToken(), sb, true);
			sb.append(",");
			sb.append("\n");
			appendValues("accessToken", result.getAccessToken(), sb, true);
			sb.append(",");
			sb.append("\n");
			appendValues("isMultipleResourceRefreshToken", String.valueOf(result.isMultipleResourceRefreshToken()), sb, false);
			sb.append(",");
			sb.append("\n");
			appendValues("expiresOn", result.getExpiresOn(), sb, false);
			sb.append(",");
			sb.append("\n");
			sb.append("\"userInfo\" : ");
			convertToJson(result.getUserInfo(), sb);
			sb.append("\n}\n");
		} else {
			sb.append("{ ERROR : \"" + result + "\"}");

		}
		return sb.toString();
	}

	private void convertToJson(UserInfo result, StringBuffer sb) {
		if (result != null) {
			sb.append("{\n");
			appendValues("userId", String.valueOf(result.getUserId()), sb, true);
			sb.append(",");
			sb.append("\n");

			appendValues("givenName", result.getGivenName(), sb, true);
			sb.append(",");
			sb.append("\n");

			appendValues("familyName", result.getFamilyName(), sb, true);
			sb.append(",");
			sb.append("\n");

			appendValues("identityProvider", result.getIdentityProvider(), sb, true);
			sb.append("\n");
			sb.append("\n}\n");
		} else {
			sb.append("{}");
		}
	}

	private void appendValues(String fn, Object value, StringBuffer sb, boolean addQuote) {
		sb.append("\n");
		sb.append("  ");
		sb.append("\"");
		sb.append(fn);
		sb.append("\"");
		sb.append(":");
		if (addQuote)
			sb.append("\"");
		sb.append(value);
		if (addQuote)
			sb.append("\"");

	}

}
