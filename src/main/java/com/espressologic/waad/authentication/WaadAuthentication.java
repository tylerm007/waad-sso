package com.espressologic.waad.authentication;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import javax.naming.ServiceUnavailableException;
import javax.servlet.http.HttpServletRequest;

import org.mozilla.javascript.NativeObject;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;
import com.microsoft.aad.adal4j.ClientCredential;
import com.microsoft.aad.adal4jsample.AuthHelper;
import com.nimbusds.oauth2.sdk.AuthorizationCode;

public class WaadAuthentication {

	private String clientId = "";
	private String clientSecret = "";
	private String tenant = "";
	private String authority = "https://login.windows.net/";
	private String apiVersion = "api-version=2013-11-08";

	public WaadAuthentication() {

	}

	public AuthenticationResult isAuthenticated(String refreshToken, String tenant, String clientId, String clientSecret)
			throws Throwable {
		this.tenant = tenant;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		if (refreshToken != null && refreshToken.length() > 20) {
			return getAccessTokenFromRefreshToken(refreshToken, null);
		} else {
			return this.getAccessTokenFromClientCredentials();
		}
	}

	private AuthenticationResult getAccessTokenFromClientCredentials() throws Throwable {
		AuthenticationContext context = null;
		AuthenticationResult result = null;
		ExecutorService service = null;
		try {
			service = Executors.newFixedThreadPool(1);
			context = new AuthenticationContext(authority + tenant + "/", true, service);
			Future<AuthenticationResult> future = context.acquireToken("https://graph.windows.net", new ClientCredential(clientId,
					clientSecret), null);
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

	private void createSessionPrincipal(HttpServletRequest httpRequest, AuthenticationResult result) throws Exception {
		httpRequest.getSession().setAttribute(AuthHelper.PRINCIPAL_SESSION_NAME, result);
	}

	private String getRedirectUrl(String currentUri) throws UnsupportedEncodingException {
		String redirectUrl = authority + this.tenant + "/oauth2/authorize?response_type=code&redirect_uri="
				+ URLEncoder.encode(currentUri, "UTF-8") + "&client_id=" + clientId + "&resource=https%3a%2f%2fgraph.windows.net"
				+ "&nonce=" + UUID.randomUUID() + "&site_id=500879";
		return redirectUrl;
	}

}
