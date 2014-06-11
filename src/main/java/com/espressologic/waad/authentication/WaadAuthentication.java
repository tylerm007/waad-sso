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

import org.mozilla.javascript.*;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;
import com.microsoft.aad.adal4j.ClientCredential;
import com.nimbusds.oauth2.sdk.AuthorizationCode;

public class WaadAuthentication {

	private Scriptable start;
	private String clientId = "";
	private String clientSecret = "";
	private String tenant = "";
	private String authority = "https://login.windows.net/";
	
	public WaadAuthentication(Scriptable start) {
        this.start = start;
    }

	public WaadAuthentication(Scriptable start,String tenant, String clientId, String clientSecret) {
		this( start);
        this.tenant = tenant;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
    }
	public String isAuthenticated(String refreshToken, String tenant, String clientId, String clientSecret) throws Throwable {
		AuthenticationResult result = authenticated(refreshToken, tenant, clientId, clientSecret);
		//convert this to a JSON array
		return result.getAccessToken();
	}
	private AuthenticationResult authenticated(String refreshToken, String tenant, String clientId, String clientSecret)
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

	public AuthenticationResult getAccessToken(String authCode, String currentUri) throws Throwable {
		//String authCode = authorizationCode.getValue();
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

	

	public String getRedirectUrl(String currentUri) throws UnsupportedEncodingException {
		String redirectUrl = authority + this.tenant + "/oauth2/authorize?response_type=code&redirect_uri="
				+ URLEncoder.encode(currentUri, "UTF-8") + "&client_id=" + clientId + "&resource=https%3a%2f%2fgraph.windows.net"
				+ "&nonce=" + UUID.randomUUID() + "&site_id=500879";
		return redirectUrl;
	}
	 private String convertToJson(NativeObject obj) {
	        StringBuffer sb = new StringBuffer();
	        convertToJson(obj, sb);
	        return sb.toString();
	    }

	    private void convertObjectToJson(NativeObject obj, StringBuffer sb) {
	        sb.append("{");
	        Object[] allIds = obj.getAllIds();
	        int numAtts = 0;
	        for (Object key : allIds) {
	            String name = key.toString();
	            if (numAtts > 0)
	                sb.append(",");
	            sb.append("\"" + name + "\":");
	            Object value = obj.get(name, (Scriptable) start);
	            convertToJson(value, sb);
	            numAtts++;
	        }
	        sb.append("}");
	    }

	    private void convertToJson(Object obj, StringBuffer sb) {
	        if (obj == null) {
	            sb.append("null");
	            return;
	        }
	        if (obj instanceof NativeArray) {
	            sb.append("[");
	            NativeArray a = (NativeArray) obj;
	            long l = a.getLength();
	            for (int i = 0; i < l; i++) {
	                if (i > 0)
	                    sb.append(",");
	                Object o = a.get(i, start);
	                convertToJson(o, sb);
	            }
	            sb.append("]");
	        } else if (obj instanceof NativeObject) {
	            convertObjectToJson((NativeObject) obj, sb);
	        } else {
	            String valStr = objectToString(obj);
	            sb.append(valStr);
	        }
	    }

	    private static String objectToString(Object o) {
	        if (o == null)
	            return "null";

	        if (o instanceof NativeJavaObject)
	            o = ((NativeJavaObject) o).unwrap();

	        if (o instanceof ConsString) {
	            o = o.toString();
	        }

	        if (o instanceof String) {
	            String s = (String) o;
	            s = s.replace("\\", "\\\\");
	            s = s.replace("\"", "\\\"");
	            s = s.replace("\n", "\\n");
	            s = s.replace("\t", "\\t");
	            s = s.replace("\r", "\\n");

	            return "\"" + s + "\"";
	        }

	        if (o instanceof Boolean) {
	            Boolean b = (Boolean) o;
	            return b.toString();
	        }

	        if (o instanceof Number) {
	            Number n = (Number) o;
	            return n.toString();
	        }

	        if (o instanceof Undefined)
	            return "null";

	        throw new RuntimeException("Object from JavaScript has unknown type: " + o.getClass());
	    }

	public static void main(String[] ars){
		String tenantName = "tylerm007gmail.onmicrosoft.com";
		String clientId = "c620d05e-e515-40da-a3d2-ecfe89ee22cd";
		String clientSecret = "IUyk421BezUUprxLy1jXmx1ohhwjAOJ4XJ68p7AH1ng=";
		 String code = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtyaU1QZG1Cdng2OHNrVDgtbVBBQjNCc2VlQSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0IiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjBjZTEyYTctN2NhYy00MGJiLThkZDEtNDlkMWFiMjFjMDgzLyIsImlhdCI6MTQwMjQ0NjczNiwibmJmIjoxNDAyNDQ2NzM2LCJleHAiOjE0MDI0NTA2MzYsInZlciI6IjEuMCIsInRpZCI6IjIwY2UxMmE3LTdjYWMtNDBiYi04ZGQxLTQ5ZDFhYjIxYzA4MyIsImFtciI6WyJwd2QiXSwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDM0MDAxQjFCQzc3MjMiLCJpZHAiOiJsaXZlLmNvbSIsIm9pZCI6Ijk3Y2U3MmM5LTkwNjQtNDM0OS1hNDBkLWY2YzExMjViMzczZCIsInN1YiI6IkFCcUtVbFNELVg4VndLUG5kSm1Dd2hRV0pIMXdHQmdZWGRDbERudmNnbnMiLCJlbWFpbCI6InR5bGVybTAwN0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiVHlsZXIiLCJmYW1pbHlfbmFtZSI6IkJhbmQiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3R5bGVybTAwN0BnbWFpbC5jb20iLCJhcHBpZCI6ImM2MjBkMDVlLWU1MTUtNDBkYS1hM2QyLWVjZmU4OWVlMjJjZCIsImFwcGlkYWNyIjoiMSIsInNjcCI6IkRpcmVjdG9yeS5SZWFkIHVzZXJfaW1wZXJzb25hdGlvbiBVc2VyUHJvZmlsZS5SZWFkIiwiYWNyIjoiMSJ9.NBOPmz5nZIlqo4QhLcEUyvpP7eqpYw4Whxi4uECOgRw8DD3xbfd5RnoPnB3M6a0sVfFH_PLTMg_jP2Bc97it32K9Y4KO0lL6KlLJ9S2onHQTi-WoVxVxMGkuZOicwVQRETrKH_1D1V8sr-HbYK0l2rD0dzF6j0X7JAFGJ_h47HXngyGz0Rmme68c33utNN8_CMNXAYMN7_QaQNQ3DcBs0WfV7woxdN61rmPeyElBjO-lJDmQESOtPxp8OhzR-IpthBqsDQyNI38E5XGkbxNQlXp_mUAH_SFma96DpCZ5PgyTPVoZgSocPtDJFnmuusfahy3eI4MZB0ZLEM1gs-a9Aw";
		 String refreshToken = null;//"AwABAAAAvPM1KaPlrEqdFSBzjqfTGBoqWwWbbMfVuHnIblQhM82Jy7ShjBJNyt2PjlmB-00AH9i_N8qesTqzGT8DsmHVbbbwAW9ZfRuVYbz9EOaU8K4qXoklv5AMrbsEjsLb4TESsk_WB_xMfOhQSZuKqhiB9xpwpzxBbfj1wfPjtqUEdy1Tyq8Wt6gFGPZQaAn03lIx2A0705Jx3JchM63dYCBequvdUlTEMuZ7sVaqAi-DMcgiz79dvkyiVgowPpRlfIrh_1zyLh4ThhtqvO7XahuJuSQIQ34jC-jcLcWJFnRMvwgcV4StnaZmrjmfhVhqXe3yRHQDhKCrWo-8Ls3p8ptipDPvqTfQnhhalgSOpJsItwKrBXlIQ8oIJQOQt1WPj5mt9wAQLvKyqM8gAvB0k8x1hhVUo5jw6Ix5tL02Lbu-CrT0sg3OgULc3C4m41lXYmI-I1rBQj8mIJ5C5ztWj8e62iAA";
		 WaadAuthentication waad = new WaadAuthentication(null);
		 String result = null;
		 AuthorizationCode authorizationCode = new AuthorizationCode(code);
		 try {
			result = waad.isAuthenticated(refreshToken, tenantName, clientId, clientSecret);
			System.out.println(result);
			//result = waad.getAccessToken(authorizationCode, "http://locahost:8080/LiveBrowser");
			System.out.println(waad.getRedirectUrl("http://localhost:8080/LiveBrowser/secure/aad"));
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		 System.out.println("done");
	}
}
