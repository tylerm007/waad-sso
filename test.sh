#!/bin/sh
#set classpath = target/classes;target/lib;target/lib/commons-logging-1.1.1.jar;target/lib/httpclient-4.2.5.jar;target/lib/httpcore-4.2.4.jar;target/lib/rhino-1.7R4.jar
java -cp target/classes;target/lib;target/lib/commons-logging-1.1.1.jar;target/lib/httpclient-4.2.5.jar;target/lib/httpcore-4.2.4.jar;target/lib/adal4j-0.0.1-SNAPSHOT.jar;target/lib/nimbus-jose-jwt-2.22.1.jar;target/lib/rhino-1.7R4.jar org.mozilla.javascript.tools.shell.Main test.js
