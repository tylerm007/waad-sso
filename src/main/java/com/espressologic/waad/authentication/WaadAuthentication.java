package com.espressologic.waad.authentication;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
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
import com.nimbusds.openid.connect.sdk.AuthenticationErrorResponse;
import com.nimbusds.openid.connect.sdk.AuthenticationResponseParser;
import com.nimbusds.openid.connect.sdk.AuthenticationSuccessResponse;

public class WaadAuthentication {

	private String clientId = "";
	private String clientSecret = "";
	private String tenant = "";
	private String authority = "https://login.windows.net/";

	public WaadAuthentication() {

	}

	public WaadAuthentication(String tenant, String clientId, String clientSecret) {
		this.tenant = tenant;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	public String getAccessTokenFromURL(String fullUrl, String currentUri) throws Throwable {
		String result = null;
		try {
			AuthenticationSuccessResponse oidcResponse = (AuthenticationSuccessResponse) AuthenticationResponseParser
					.parse(new URI(fullUrl));
			AuthenticationResult authResult = getAccessToken(oidcResponse.getAuthorizationCode(), currentUri);
			String accessToken = authResult.getAccessToken();
			String groups = findAllGroups(accessToken,"/groups/");
			String aGroupForUser = findAllGroups(accessToken,"/users/97ce72c9-9064-4349-a40d-f6c1125b373d");//+authResult.getUserInfo().getUserId());
			result = convertToJson(authResult);
		} catch (Exception ex) {
			result = String.format("Request for getAccessTokenFromURL auth code failed: %s",ex.getMessage());
		}
		return result;
	}

	public String findAllGroups(String accessToken, String path) {
		String apiVersion = "api-version=2013-11-08";
		BufferedReader reader = null;
		HttpURLConnection conn = null;
		StringBuffer stringBuf = new StringBuffer();
		
	try{
			URI uri = new URI("https", 
					"graph.windows.net", "/" + this.tenant + path , apiVersion, null);
	
			URL url = uri.toURL();
			conn = (HttpURLConnection) url.openConnection();
	
			conn.setRequestProperty("Authorization", accessToken);
			conn.setRequestProperty("Accept", "application/json");
			
			reader = new BufferedReader(new InputStreamReader(
					conn.getInputStream()));
				
		String inputLine;
		
		while ((inputLine = reader.readLine()) != null) {
			stringBuf.append(inputLine);
		}			
		System.out.println( stringBuf.toString());
		try{
			JSONArray jarray = new JSONObject(stringBuf.toString()).getJSONArray("value");
			System.out.println(jarray.length());
			System.out.println(jarray);
		} catch(Exception e){}
		}catch(Exception ex){
			ex.printStackTrace();
		}
		return stringBuf.toString();
	}

	public String getAccessToken(String refreshToken, String tenant, String clientId, String clientSecret) throws Throwable {
		AuthenticationResult result = getAccessTokenResult(refreshToken, tenant, clientId, clientSecret);
		// convert this to a JSON array
		return convertToJson(result);
	}

	public AuthenticationResult getAccessTokenResult(String refreshToken, String tenant, String clientId, String clientSecret)
			throws Throwable {
		this.tenant = tenant;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		// if (refreshToken != null && refreshToken.length() > 20) {
		// return getAccessTokenFromRefreshToken(refreshToken, null);
		// } else {
		return this.getAccessTokenFromClientCredentials();
		// }
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

	public AuthenticationResult getAccessToken(AuthorizationCode authorizationCode, String currentUri) throws Throwable {
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
				+ URLEncoder.encode(currentUri, "UTF-8") + "&client_id=" + this.clientId + "&resource=https%3a%2f%2fgraph.windows.net"
				+ "&nonce=" + UUID.randomUUID() + "&site_id=500879";
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

	public static void main(String[] ars) {
		String tenantName = "tylerm007gmail.onmicrosoft.com";
		String clientId = "c620d05e-e515-40da-a3d2-ecfe89ee22cd";
		String clientSecret = "IUyk421BezUUprxLy1jXmx1ohhwjAOJ4XJ68p7AH1ng=";
		// String code =
		// "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0IiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjBjZTEyYTctN2NhYy00MGJiLThkZDEtNDlkMWFiMjFjMDgzLyIsImlhdCI6MTQwMjQ5Mjk3NSwibmJmIjoxNDAyNDkyOTc1LCJleHAiOjE0MDI0OTY4NzUsInZlciI6IjEuMCIsInRpZCI6IjIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4MyIsIm9pZCI6IjdiOThiYmVmLWI0OWQtNGUzYi1hNmFhLTNkNjYwMzU3NzM2MyIsInN1YiI6IjdiOThiYmVmLWI0OWQtNGUzYi1hNmFhLTNkNjYwMzU3NzM2MyIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4My8iLCJhcHBpZCI6ImM2MjBkMDVlLWU1MTUtNDBkYS1hM2QyLWVjZmU4OWVlMjJjZCIsImFwcGlkYWNyIjoiMSJ9.diIzgxWVfWEY-CDczLr7wbTjy180azl8b84f0rGh52Q3639eVhsxLsZyplXBEctNgXgwgkQbYVBsSPIPwaKPvGt82npla2Sfl65MRx6FdsowkIipi5K8mkbiRv6TacXP5ntHIjf1VWS_Qi6-C5oKh-m7a2OZox6LTQUm9xyVVouPLx2iA916GRiQhQBX3CAIEEDN8GE6WDHIRUlb2jTfBMH2mQOTQHKxGukvGXT6nWvVJzKp2NGuOVrMiR59zbEdO7ODJQFhWH-nHKkmMTuPY5nLmmANvRxZmVKBNeSoOGGuD92F2qybs_c7C2j05Vrj-K-2l2XEn4CF2jG9StYX7Q";
		String refreshToken = null;// "AwABAAAAvPM1KaPlrEqdFSBzjqfTGFHL5YXlCIO_-Tti1hedJW2qIGogjfBlLdZ_CPlD8fJf7xO6iu3i4rJ3aQOTduEYX_ycGRCWyZvn1mOq6lkZPEOTI5zkxKdcGESctDZIb47VGdTsJPrh0EXGqmhngbAaHP8lIfPTiuM1ia7IRmzAD5HAyuizKVW_8S2UdJw9UprlUAGzl79ylnpabgeqLJ8AUhb03F1zU0TNup58Wpz6QywM9qtWKntDJ-RnU0NHgwF1_CMMX6b3zxTP8WUVV19GxDS7YvVITS0qTtLk5uC5nvHgoMN8VPj9ILVkLHppebEZFY467yUqvJ6FL4YrbwP3MR0QMW28OUBD2tunSyqlMx-PjYpuAjZFrb2zCK4E1zG3ykVpBi3JDbLChEzGu0fYeXsdeg7A8F58-5-UQkVcWn9zSEOid2imf9lofSlOsZEmbx85z86dQQqWmkvY8FjYBG4tHTD8HI_ccMqO-kQvBPKu74DfRhQlwakUA068L6Aljmuz5clPH6KjCtGahKd89AHllrKXCNKNAt-KKjsEgT4gAA";
		WaadAuthentication waad = new WaadAuthentication(tenantName, clientId, clientSecret);
		String fullURL = "http://localhost:8080/LiveBrowser/secure/aad?code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGI_Xrf2whCoquKgU5KDo_Od33N7JHder_Q5ifKTFIUZ9HZF0nS8vfZrZc8l2sqO5hPe-LQ4_CWwGYa9RF6lHlKnsDX2PJJuh7TUxRvEraM2mLz6NlB99YShNPMGGH5fWBtdakfALnug8tTKlfFfD9y_FEBOU89oKfwXvPqAEgdCc89eLwqtsZ7iQvBkWiIkVq8ubXHx3HO54wLnuDQZD3Q_OIv8KlA7Z_N4FF9TCFIwldYfqN10y-pf59tM_pm2HeouzmXyCMM4nM1EhnVsersOEL7c7kEo8rajKm6mejJkE2eSvnrwtvdQzwz3xGRqtHq5H4Gnx6KnAOHzBq_AF-Ddx2zSqd26eFVQlIvrHHIfxp78osiqKNxZMhbcAJOUsokAB4LgO8MGbHJ4ZbbQ2fCG4T97GyErHIomsqTAXZfjUzoko3scQ0HMmnOk8pW2GdxVF1z72BnqPYECvk9snvvOOYyhttr4sWQjdYI2j1S8jAhiXH16oytKHNL_9wM3OZ9bx_D5nx_AF1y8-6Jz-SC0gAA&session_state=d678d1cf-ceb5-478d-a375-d55fa791fbea";
		String redirectURL = "http://localhost:8080/LiveBrowser/secure/aad";

		String result = null;

		try {
			result = waad.getAccessTokenFromURL(fullURL, redirectURL);
			System.out.println("getAccessTokenFromURL: " + result);
			result = waad.getAccessToken(refreshToken, tenantName, clientId, clientSecret);
			System.out.println("getAccessToken: " + result);

			// result = waad.getAccessToken(authorizationCode,
			// "http://locahost:8080/LiveBrowser");
			System.out.println(waad.getRedirectUrl("http://localhost:8080/LiveBrowser/secure/aad"));
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("done");
	}
}
