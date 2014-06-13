import java.io.UnsupportedEncodingException;

import com.espressologic.waad.authentication.WaadAuthentication;
import com.microsoft.aad.adal4j.AuthenticationResult;

public class TestWaadAuthentication {

	private static String tenantName = "20ce12a7-7cac-40bb-8dd1-49d1ab21c083";// "tylerm007gmail.onmicrosoft.com";
	private static String clientId = "c620d05e-e515-40da-a3d2-ecfe89ee22cd";
	private static String clientSecret = "IUyk421BezUUprxLy1jXmx1ohhwjAOJ4XJ68p7AH1ng=";
	private static String refreshToken = null;// "AwABAAAAvPM1KaPlrEqdFSBzjqfTGFHL5YXlCIO_-Tti1hedJW2qIGogjfBlLdZ_CPlD8fJf7xO6iu3i4rJ3aQOTduEYX_ycGRCWyZvn1mOq6lkZPEOTI5zkxKdcGESctDZIb47VGdTsJPrh0EXGqmhngbAaHP8lIfPTiuM1ia7IRmzAD5HAyuizKVW_8S2UdJw9UprlUAGzl79ylnpabgeqLJ8AUhb03F1zU0TNup58Wpz6QywM9qtWKntDJ-RnU0NHgwF1_CMMX6b3zxTP8WUVV19GxDS7YvVITS0qTtLk5uC5nvHgoMN8VPj9ILVkLHppebEZFY467yUqvJ6FL4YrbwP3MR0QMW28OUBD2tunSyqlMx-PjYpuAjZFrb2zCK4E1zG3ykVpBi3JDbLChEzGu0fYeXsdeg7A8F58-5-UQkVcWn9zSEOid2imf9lofSlOsZEmbx85z86dQQqWmkvY8FjYBG4tHTD8HI_ccMqO-kQvBPKu74DfRhQlwakUA068L6Aljmuz5clPH6KjCtGahKd89AHllrKXCNKNAt-KKjsEgT4gAA";
	private static WaadAuthentication waad;
	private static String fullURL = "http://localhost:8080/LiveBrowser/secure/aad?code=AwABAAAAvPM1KaPlrEqdFSBzjqfTGI_Xrf2whCoquKgU5KDo_Od33N7JHder_Q5ifKTFIUZ9HZF0nS8vfZrZc8l2sqO5hPe-LQ4_CWwGYa9RF6lHlKnsDX2PJJuh7TUxRvEraM2mLz6NlB99YShNPMGGH5fWBtdakfALnug8tTKlfFfD9y_FEBOU89oKfwXvPqAEgdCc89eLwqtsZ7iQvBkWiIkVq8ubXHx3HO54wLnuDQZD3Q_OIv8KlA7Z_N4FF9TCFIwldYfqN10y-pf59tM_pm2HeouzmXyCMM4nM1EhnVsersOEL7c7kEo8rajKm6mejJkE2eSvnrwtvdQzwz3xGRqtHq5H4Gnx6KnAOHzBq_AF-Ddx2zSqd26eFVQlIvrHHIfxp78osiqKNxZMhbcAJOUsokAB4LgO8MGbHJ4ZbbQ2fCG4T97GyErHIomsqTAXZfjUzoko3scQ0HMmnOk8pW2GdxVF1z72BnqPYECvk9snvvOOYyhttr4sWQjdYI2j1S8jAhiXH16oytKHNL_9wM3OZ9bx_D5nx_AF1y8-6Jz-SC0gAA&session_state=d678d1cf-ceb5-478d-a375-d55fa791fbea";
	private static String redirectURL = "http://localhost:8080/LiveBrowser/secure/aad";
	private static String accessToken = null;

	public static void main(String[] args) {
		TestWaadAuthentication test = new TestWaadAuthentication();
		waad = new WaadAuthentication(tenantName, clientId, clientSecret);
		try {
			accessToken = test.testAccessToken();

			test.testRedirectURL();
			test.getAccessUsingURL();
			test.testGroups();
			test.testGroupInfo();
		} catch (Exception ex) {
			ex.printStackTrace();
		} catch (Throwable t) {
			t.printStackTrace();
		}

	}

	public String testAccessToken() throws Throwable {

		String result = null;

		String uri = "https://login.windows.net/20ce12a7-7cac-40bb-8dd1-49d1ab21c083";
		AuthenticationResult authRes = waad.getAccessTokenResult(refreshToken, tenantName, clientId, clientSecret);
		result = authRes.getAccessToken();

		return result;
	}

	private void getAccessUsingURL() throws Throwable {

		// expired URL token - should return error
		String result = null;
		result = waad.getAccessTokenFromURL(fullURL, redirectURL);
		System.out.println("getAccessTokenFromURL: " + result);
		// if refresh is null - this will return accessToken using credentials

	}

	private void testRedirectURL() throws Throwable {
		// calculate the redirect URL

		System.out.println(waad.getRedirectUrl("http://localhost:8080/LiveBrowser/secure/aad"));

	}

	private void testGroups() throws Throwable {

		System.out.println("getAccessToken: " + accessToken);
		String userPrincipleName = "JoeDeveloper@tylerm007gmail.onmicrosoft.com";
		String myGroups = waad.findGroupInfoForUser(accessToken, userPrincipleName);
		System.out.println(myGroups);

		myGroups = waad.findGroupInfoForUser(accessToken, "tylerm007_yahoo.com#EXT#@tylerm007gmail.onmicrosoft.com");
		System.out.println(myGroups);

		myGroups = waad.findGroupInfoForUser(accessToken, "baduse");
		System.out.println(myGroups);
		// how do we get user group info?
		// testGroupInfo(waad);
	}

	private void testGroupInfo() throws Throwable {

		String groups = waad.findAllGroups(accessToken, "/groups/");
		System.out.println(groups);
		String aUserByObjectId = waad.findAllGroups(accessToken, "/users/97ce72c9-9064-4349-a40d-f6c1125b373d");
		System.out.println(aUserByObjectId);
		String upn = "JoeDeveloper@tylerm007gmail.onmicrosoft.com";//
		// upn = "7398718d-7b7b-4e6a-8c15-bd03f713045f";
		// waad.tenant = "tylerm007_gmail.com@tylerm007gmail.onmicrosoft.com";
		// get the links first
		String groupForUser = waad.findAllGroups(accessToken, "/users/" + upn + "/$links/memberOf");
		System.out.println(groupForUser);
		// for each link we can get the group for this user.
		String myGroup = waad.findAllGroups(accessToken,
				"/directoryObjects/d6d364c6-b8a8-44ea-b967-fd5bb25b4a5d/Microsoft.WindowsAzure.ActiveDirectory.Group");
		System.out.println(myGroup);

	}
}
