#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h> 
#include "variables.h"

// sensor pin
int flowPin = D2;

// globals for measuring
float mLMeasured;    
float totalmL = 0;
volatile int pulses = 0;
unsigned int totalPulses = 0;
unsigned long lastMillis = 0;

// http client
HTTPClient http; 

void setup() {
  Serial.begin(9600);

  //connect to wifi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  if( WiFi.status() == WL_CONNECTED ) {
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, LOW);
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  http.setReuse(true);
  
  pinMode(D2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(D2), Flow, FALLING);  
}

void loop() {

  /*
   * running more frequently was leading to 
   * inaccurate readings
   * because http request
   * is blocking and slowing down the interrupts
   * we're still going to get some inaccuracy 
   * here because the http request still blocks,
   * but it will have less impact on the overall
   * reading. we could wait until no readings (pulses)
   * are read for X seconds before saving, but
   * that doesn't guarantee no readings will start
   * while it's saving and there is no guarantee 
   * that there will ever be an extended period of
   * X seconds with no readings in order to save.
   * the only solution would be to use an async http
   * lib such as https://github.com/boblemaire/asyncHTTPrequest
   */
  if( millis() - lastMillis >= 5000 ) {
    detachInterrupt(digitalPinToInterrupt(D2));
    lastMillis = millis();
    /*
     * flow rate is 330 pulses per liter
     * convert to ml per pulse (1000/330) = 3.03
     * multiply pulses by ml per pulse to get usage
     */
    mLMeasured = (pulses * 3.03);
    totalmL += mLMeasured;
    totalPulses += pulses;
    
    if( mLMeasured > 0 ) {
      Serial.print("Pulses: ");
      Serial.println(pulses);
      Serial.print("mL: ");
      Serial.println(mLMeasured);
      Serial.print("Liters: ");
      Serial.println(mLMeasured / 1000);
      Serial.print("Total: ");
      Serial.println(totalmL);
      Serial.print("TP: ");
      Serial.println(totalPulses);
      saveReading(mLMeasured);
    }
    else {
      Serial.println("Nothing to save...");
    }
    pulses = 0;
    attachInterrupt(digitalPinToInterrupt(D2), Flow, FALLING); 
  }
 
  
}

void saveReading(float reading) {
  if( WiFi.status() == WL_CONNECTED ) {
    String address = saveEndpoint + String(reading, DEC); 
    http.begin(address); 
    Serial.print("Address: ");
    Serial.println(address);
    int httpCode = http.POST(""); 
    Serial.print("Status Code: ");
    Serial.println(httpCode); 
    
    String payload = http.getString(); 
    Serial.println(payload); 
    http.end();
    Serial.println("closing connection");
  }
}

ICACHE_RAM_ATTR void Flow(){
    pulses++; //Every time this function is called, increment "pulses" by 1
}
