set cp=target/classes
set cp=%cp%;target/lib/activation-1.1.jar
#MICROSOFT AAD Library
set cp=%cp%;target/lib/adal4j-0.0.1-SNAPSHOT.jar
set cp=%cp%;target/lib/nimbus-jose-jwt-2.22.1.jar
set cp=%cp%;target/lib/oauth2-oidc-sdk-3.0.jar

set cp=%cp%;target/lib/bcprov-jdk15on-1.49.jar
set cp=%cp%;target/lib/commons-codec-1.6.jar
set cp=%cp%;target/lib/commons-lang3-3.1.jar
set cp=%cp%;target/lib/commons-logging-1.1.1.jar
set cp=%cp%;target/lib/gson-2.2.4.jar
set cp=%cp%;target/lib/httpclient-4.2.5.jar
set cp=%cp%;target/lib/httpcore-4.2.4.jar
set cp=%cp%;target/lib/jcip-annotations-1.0.jar
set cp=%cp%;target/lib/json-20090211.jar
set cp=%cp%;target/lib/json-smart-1.1.1.jar
set cp=%cp%;target/lib/lang-tag-1.4.jar
set cp=%cp%;target/lib/log4j-1.2.17.jar
set cp=%cp%;target/lib/mail-1.4.7.jar

set cp=%cp%;target/lib/rhino-1.7R4.jar
set cp=%cp%;target/lib/slf4j-api-1.7.5.jar
set cp=%cp%;target/lib/slf4j-log4j12-1.7.5.jar
java -cp %cp% org.mozilla.javascript.tools.shell.Main test.js