waad-sso
========

Microsoft Azure Active Directory Single Signon JavaScript solution using AADL

1) need to build aht azure-activedirectory-library JAR locally 
https://github.com/tylerm007/azure-activedirectory-library-for-java

2) build this project
>mvn clean install

3) Modify the file test.js to contain your test values (clientID, clientSecret, tenantName, etc)

4) use the run.cmd to create the classpath and execute the local rhino script


to see how this works - you can run Java the main() program in WaadAuthentication
