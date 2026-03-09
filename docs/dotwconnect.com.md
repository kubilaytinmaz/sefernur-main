Documentation Version 4
Introduction:
DCML (DOTWconnect Markup Language) is an XML based interface providing the access to information and ability manage reservations for the global product range of Destinations of the world. DCML is able to access Destinations of the World’s proprietary reservation system DOTWconnect with over 25,000 negotiated rate properties and standard rates at over 10,000 properties. DCML standardizes the requests and responses to the different sources in order to provide a coherent product with a single communication interface.


Connection properties:
The communication with the DCML system is performed through https connection. For the production system and for the development system SSL is not supported in order to increase the speed. The following table enlists the properties of the request that must be employed:

Request Header/Property	Value	Description
Host (production)	us.dotwconnect.com	All connections can be made via https protocol.
Host (development)	xmldev.dotwconnect.com	All connections can be made via https protocol.
Request URL	/gatewayV4.dotw	The requested URL.
Request Method	POST	The requested method.
Content-Type	text/xml	The content type.
Connection	close	This value specifies that the connection is not to be a keep-alive connection.
Compression	Gzip	Gzip compression must be enabled for communicating with DOTW servers.
 

General guidelines:
Travel Agent reservation database:
Any Travel Agent using the DCML system is required to maintain a database of reservation details, both booked and cancelled. It is also recommended that an email should be sent to the user upon booking or cancellation with the appropriate information. The data maintained in the database for bookings must at least include the information necessary for cancelling that booking. It is highly recommended, however, that the stored data include all information of interest or value to the customer regarding their booking (rate change information, cancel policy, etc.).

Request/Response DOTWconnect:
It is recommended that at least all booking and cancellation transactions sent through the DCML system should be logged and maintained by the travel agent for at least 6 months.

Go-Live Process:
In order to start testing, please notify our sales department who will help you to obtain the test credentials. Please note that all transactions through the DCML Test system are simply test transactions. No reservations or charges will result from a transaction made through our test environment. Please be advised that not all our properties are available in the test environment and also the rates and/or products may be not updated. Unfortunately, we have no way of determining which properties will be available in the test environment, thus attempts may need to be made at many properties until an available property is discovered. The system functionality between the Test and Live system is exactly the same except for the fact that Bookings processed in the Test environment are not sent to the Suppliers. When you have completed your development, please contact our Sales Department for the activation of the access to the Live server.

Development Phase
Once you receive your user id, password and company code you can start the development of your application/framework. The whole process of communication consists of simple xml messages exchange (request - answer/response) between your application/framework and DOTWconnect system. Each request needs to be posted (through POST method) using  https protocol to xmldev.dotwconnect.com/request.dotw and it receives a response irrespectively the request is successfully processed or not informing about the success of the operation. For details regarding requests and answers formats and details please consult the dedicated area of each request.

For further assistance in development process do not hesitate to contact our support team

Changes in Version 4
We kindly invite you to review the V4 key features presented below.

Version 4 of our XML Booking Engine is a simplified version of the current V3, built by removing from the searchhotels response optional elements and attributes, in order to obtain a reduced and simplified response.

Key benefits provided by Version 4 of our Booking Engine:

Considerably reduced response size which will have a positive impact on the processing time on customer's side.
In Version 4 we will provide in the searchhotels response all the available rooms, with the cheapest price per each rateBasis/meal plan. This will improve the searchhotels API, which will quickly return all the availavble properties along with the available roomTypes for the given search criteria
Major changes on Version 4.

One of the major changes on Version 4 is that in the searchhotels response we don't provide information about cancellation policy, or the allocationDetails tokem, which has to be used in the next steps of the booking flow. Due to this, it is mandatory for all our customers to implement the simple getRooms method, in order to obtain all the available rates for each roomType along with the cancellation policies and allocationDetais token. The allocationDetails string needs to be used in the confirmation step, in order to succcesfully finalize the reservation.
In Version 4, the rate/s blocking step is mandatory as there are prices and cancellation policies validations with some of our suppliers only in this stage. By implementing this booking step our customers will also be able to block the selected rate/s for a certain period of time. DOTW will block the selected rate/s for 3 minutes before releasing the allocation.
 

In the current version 4 of DOTW webserivces, same as on previous Version, our system supports two possible booking flows:

searchotels -> getRooms (without blocking) ->  getRooms (with blocking) --> confirmbooking
searchhotels -> getRooms (without blocking) -> getRooms (with blocking) --> savebooking -> bookItinerary
Using the second booking flow, the DOTW customers have the possibilty to save an itinerary (using savebooking API), which can be confirmed at a later stage (using bookItinerary API).

 

DCML Request Structure
Introduction:
This document details the XML structure of each of the supported request types. Please note that the DOTWconnect XML booking engine (dubbed DCML) is the gateway to the DOTW reservation sources. One of these sources is our proprietary inventory system, and more systems may be added in the future. The DCML system was designed to be a standard interface to each of these sources and each attempt was made in order to bring coherency to these disparate sources.
Request Format:
The basic format of each request is detailed below. The XML document root element for all the requests passed to DOTWconnect Web Services server is the customer element. For all the requests you make please remember that you need to pass the authentication data you received when signing up with DOTWconnect. For security reasons you need to pass your password encrypted with MD5 algorithm. Please note that throughout this document when we refer to password it implies that the password is encrypted using MD5 algorithm. In addition to the authentication data you will also need to pass an element, source which will always have the value 1 and an element, product with a specific value identifying the product the request is made for. The specific details for the request will be passed inside the request element. This element must have an attribute named command and its value will state exactly which command you are trying to run on DOTWconnect server. More information about these specific details will be presented for each request in separate sections. Please note, each element and attribute in the DCML system is case dependent. For requests, they must appear exactly as they are detailed below. For responses, the elements and attributes will appear precisely as you see them in the Response Format area. Improperly cased element and attribute names and in some cases, the attribute values will not be recognized.
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <product>product</product>  
    <request command="command">request details</request>  
</customer>  
Item	Type	Parent	Description	Required
customer	Element	None	Root element of all requests.	Yes.
username	Element	customer	Customer username	Yes.
password	Element	customer	Customer password encrypted using md5 algorithm.	Yes.
id	Element	customer	Customer company code.	Yes.
source	Element	customer	The value should be 1.	Yes.
product	Element	customer	Indicates what product the request is made for:
hotel
Yes.
request	Element	customer	Contains specific data for each request.	Yes.
@command	Attribute	request	Value detailing the type of request being passed.	Yes.
 

Response Format:
For each request your application makes to the DOTWconnect server you will get a response in XML format with a root element result. The most important element you will find in the response is the successful element with two possible values: TRUE or FALSE. These values indicate whether your request was successfully processed by the DOTWconnect server or not. The following general response is for an unsuccessful process. For a successful process, DOTWconnect will return TRUE for the successful element and the corresponding elements for that specific request. In the coming sections you will see the Successful general response for each request.
<result command=" " date="" ip="">  
    <request>  
        <error>  
            <class></class>  
            <code>error code</code>  
            <details></details>  
            <extraDetails></extraDetails>  
            <postXml></postXml>  
        </error>  
        <successful>FALSE</successful>  
    </request>  
</result>  
Item	Type	Parent	Description
result	Element	None	Root element of all requests.
@command	Attribute	result	The request command which returned this result.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@ip	Attribute	result	The IPv4 address the request was made from.
request	Element	result	Encapsulates the result information.
error	Element	request	Provides details regarding the error.
class	Element	error	Processing class that generated the error.
code	Element	error	Internal code for the error. For more details regarding these error codes please refer to General Error Codes.
details	Element	error	Error message.
extraDetails	Element	error	Additional details associated with the error message.
postXml	Element	error	Contains the xml data and structure which was sent as the request.
successful	Element	request	Indicates whether the request was successful or not.
 

Hotels Communication Structure:
This section provides you with details of all methods for communication with DOTWconnect server to process your Hotel Reservations. The section has the following methods and each method is explained in detail with their corresponding request and response formats.

DOTWconnect server has the following XML requests commands for hotels:

searchhotels
getrooms
savebooking
confirmbooking
getbookingdetails
cancelbooking
bookitinerary
deleteitinerary
searchbookings
General Request
Based on the search criteria provided in the XML request, this method returns the hotel details which include: starting price per Hotel and availability based on date range, city and passenger room occupancy. In addition to the Authentication data the elements required to be passed for this method are defined in the following table. This method also allows the possibility to filter the response data based on specific criteria. The request is composed of two separate sections which are bookingDetails and return. The bookingDetails element data contains the travel dates, detailed room occupancy and the preferred internal DOTW currency code which will determine in what currency the prices will be returned. The return parameter contains details about filtering and room information that the DOTWconnect system returns for each hotel in the response list (if the element getRooms is set to value true).

Please be aware that in V4 the response will return only the cheapest rate per meal type for each hotel and it will contain less details about the rates. All the details per rate are still available in the getrooms response.

FYI Currently we provide Serviced Apartments and hotels using the same method: searchHotels. You can identify the Serviced Apartments in our XML responses by checking the rating, which in case of apartments will have the value 48055. If you want to filter the results and retrieve only serviced apartments in the response, you can filter the rates using the filter:
 rating - filters the hotels based on the classification (star rating) (fieldTest: equals, in).

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company_code</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="searchhotels">  
        <bookingDetails>  
            <fromDate>dotw date format</fromDate>  
            <toDate>dotw date format</toDate>  
            <currency>currency internal code</currency>  
            <rooms no="">  
                <room runno="">  
                    <adultsCode>adults</adultsCode>  
                    <children no="">  
                        <child runno="">child age</child>  
                    </children>  
                    <rateBasis>room rate basis</rateBasis>  
                    <passengerNationality></passengerNationality>  
                    <passengerCountryOfResidence></passengerCountryOfResidence>  
                </room>  
            </rooms>  
        </bookingDetails>  
        <return>  
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
                <city></city>  
                <c:condition>  
                    <a:condition>  
                        <fieldName>fieldName</fieldName>  
                        <fieldTest>fieldTest</fieldTest>  
                        <fieldValues>  
                            <fieldValue>fieldValue</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                    <operator>operator</operator>  
                    <a:condition>  
                        <fieldName>fieldName</fieldName>  
                        <fieldTest>fieldTest</fieldTest>  
                        <fieldValues>  
                            <fieldValue>fieldValue</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                </c:condition>  
            </filters>  
        </return>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
bookingDetails	Element	request	Contains travel dates, detailed room occupancy and the currency code in which the prices are returned.	Yes.
fromDate	Element	bookingDetails	Arrival date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
toDate	Element	bookingDetails	Departure date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
currency	Element	bookingDetails	Internal code of the currency in which the customer will see the prices.	Yes.
rooms	Element	bookingDetails	Contains a room element for each room the customer wishes to book.	Yes.
@no	Attribute	rooms	Specifies the total number of rooms.	Yes.
room	Element	rooms	Encapsulates details about one room.	Yes.
@runno	Attribute	room	Specifies for which room number out of total passed rooms the search specifications are applicable. Please note that the running serial number starts from 0.	Yes.
adultsCode	Element	room	Number of adults in the room; The possible codes are:
1
2
3
4
5
6
7
8
9
10
Yes.
children	Element	room	Specifies the details about the accompanying children in the room.	Yes.
@no	Attribute	children	Specifies the total number of children in the room. If the search does not include any children then the value should be 0.	Yes.
child	Element	children	Specifies the child age.	Yes, if children@no > 0.
@runno	Attribute	child	Specifies for which child the age is applicable.	Yes, if parent present.
rateBasis	Element	room	Specifies the internal code for the rate basis you would like for this room (eg. Room Only, Half Board). Please note that rate basis - All Rates (1) can be used only if a hotel category or hotel name is specified.	Yes.
passengerNationality	Element	room	Specifies passenger nationality and it is mandatory to be sent in the request. This is DOTW country internal code that can be obtained using the getallcountries request.	Yes.
passengerCountryOfResidence	Element	room	Specifies passenger country of residence and it is mandatory to be sent in the request.. This is DOTW country internal code that can be obtained using the getallcountries request.	Yes.
return	Element	request	Contains details about filtering and hotel information that needs to be returned for each hotel in the response list.	Yes.
filters	Element	return	Groups filtering criteria.	Yes.
city	Element	filters	For filtering by city you have to specify the city internal code. You can receive city internal codes using getservingcities request. This filter is available only when you do not apply a country filter.	No.
country	Element	filters	For filtering by country you have to specify the country internal code. You can receive country internal codes using getservingcountries request. This filter is available only when you do not apply a city filter.	No.
c:condition	Element	return	This element encapsulates advanced filtering techniques. It can contain as many c:condition (complex condition) elements and a:condition (atomic condition) elements as it may be necessary along with the operators you want to be applied for those conditions.	No.
a:condition	Element	c:condition	Groups details for a specific elementary condition. Each filter is made up by 3 elements	Yes, if parent present.
fieldName	Element	a:condition	The field you want to evaluate. Possible values are:
hotelId - filters the hotels by their internal codes(fieldTest: equals, in, notin)
price - filters the hotels by price (fieldTest: equals, in, between)
preferred - filters the hotels by the preferred status (fieldTest: equals, in)
onRequest - filters the hotels based on the availability of rooms (fieldTest: equals, in)
rating - filters the hotels based on the classification (star rating) (fieldTest: equals, in)
luxury - filters the hotels based on the luxury classification (fieldTest: equals, in)
location - filters the hotels based on the location (fieldTest: regex)
locationId - filters the hotels based on the location internal codes (fieldTest: equals, in)
amenitie - filters the hotels based on the amenities (fieldTest: equals, in)
leisure - filters the hotels based on the leisure amenities (fieldTest: equals, in)
business - filters the hotels based on the business amenities (fieldTest: equals, in)
hotelPreference - filters the hotels based on the hotel preferences (fieldTest: equals, in)
chain - filters the hotels based on the hotel chain (fieldTest: equals, in)
attraction - filters the hotels based on the hotel nearby attractions (fieldTest: regex)
hotelName - filters the hotels based on the hotel name (fieldTest: regex)
builtYear - filters the hotels based on the hotel built year (fieldTest: equals, in, between)
renovationYear - filters the hotels based on the hotel built year (fieldTest: equals, in, between)
floors - filters the hotels based on the hotel number of floors (fieldTest: equals, in, between)
noOfRooms - filters the hotels based on the hotel number of rooms (fieldTest: equals, in, between)
fireSafety - filters the hotels based on the hotel fire safety compliance (fieldTest: equals, in)
lastUpdated - filters the hotels based on the last update of their profile (fieldTest: between

You can also use the following to filter the rooms that will be returned for each hotel:
roomOnRequest - filters rooms based on availabilty (fieldTest: equals, in)
roomPrice - filters rooms based on room price (fieldTest: equals, between)
suite - filters rooms based on the suite status of the room (fieldTest: equals)
roomAmentie - filters rooms based on the roomAmenties (fieldTest: equals, in)
roomId - filters rooms based on the room internal code (fieldTest: equals, in)
roomName - filters rooms based on the room name (fieldTest: regex, equals)
Yes, if parent present.
fieldTest	Element	a:condition	The test you want to make on the field. Possible values:
equals - if you want the field to be evaluated to be equal to all the test values;
in - if you want the test field to be evaluated to be equal to at least one of the test values.
notin - if you want the test field to be evaluated to be different than all of the test values.
between - if you want the test field to be evaluated to be compared to the two test values (one would be the inferior limit, one - the superior limit). If you want the field to be evaluated to be greater than a certain value that just pass that value. If you want yout test field to be lower than a certain value that you have to pass to values (one should be 0 - the inferior limit and the other the actual value you want to compare to).
regex - if you want the test field to be evaluated to match a PERL Regular Expression provided as a test value.
like - if you want the results to contain the text in the test field.
Yes, if parent present.
fieldValues	Element	a:condition	Groups the test value(s) you want the test field to be evaluated against.	Yes, if parent present.
fieldValue	Element	testValues	The test value you want the test field to be evaluated against. Use the following testing values for the fields:
price - any float value
preferred - 1(true) or 0(false)
onRequest - 1(true) or 0(false)
rating - Hotel classification codes from DOTWconnect system should be passed here. You can receive the rating codes using gethotelclassificationids request.
luxury - 1(true) or 0(false)
location - PERL Regular Expression
locationId - Location internal code from DOTWConnect system should be passed here. You can receive the location codes using getlocationids request.
amenitie - Amenitie codes from DOTWConnect system should be passed here. You can receive the amenitie codes using getamenitiesids request.
leisure - Leisure codes from DOTWconnect system should be passed here. You can receive the leisure codes using getleisureids request.
business - Business amenitie codes from DOTWconnect system should be passed here. You can receive the business amenities codes using getbusinessids request.
hotelPreference - Hotel preferences codes from DOTWconnect system should be passed here. You can receive the hotel preferences codes using getpreferencesids request.
chain - Hotel chain codes from DOTWconnect system should be passed here. You can receive the hotel chain codes using getchainids request.
attraction - PERL Regular Expression
hotelName - PERL Regular Expression
builtYear - integer > 1800
renovationYear - integer > 1800
floors - integer < 200
noOfRooms - integer < 6000
fireSafety - 1(true) or 0(false)
lastUpdated - date in YYYY-MM-DD HH:MM:SS format.
You can also use the following to filter the rooms that will be returned for each hotel:
roomOnRequest - 1(true) or 0(false)
roomPrice - any float value
suite - 1(true) or 0(false)
roomAmenitie - Amenitie codes from DOTWconnect system should be passed here. You can receive the amenitie codes using getamenitiesids request
roomId - internal code
roomName - PERL Regular Expression
Yes, if parent present.
operator	Element	c:condition	Specifies the logical operator that will be applied for the conditions. Possible values:
AND
OR
Yes.
 

searchhotels.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition" schemaLocation="atomicCondition.xsd"></xs:import>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/complexCondition" schemaLocation="complexCondition.xsd"></xs:import>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="xs:string"  fixed="hotel"></xs:element>  
                <xs:element name="language"  type="xs:string" minOccurs="0"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="bookingDetails"  type="bookingDetailsType"></xs:element>  
            <xs:element name="return"  type="returnType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="searchhotels"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer" use="optional"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
        <xs:attribute name="nocache"  type="xs:integer" use="optional"></xs:attribute>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="filters"  type="filtersType"></xs:element>  
            <xs:group ref="resultsPerPageGroup" minOccurs="0"></xs:group>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:complexType name="filtersType">  
        <xs:sequence>  
            <xs:group ref="cityOrCountryFilter" minOccurs="0"></xs:group>  
            <xs:element name="noPrice"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="rateTypes"  type="rateTypesType" minOccurs="0"></xs:element>  
            <xs:element ref="c:condition" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:group name="groupOfCity">  
        <xs:sequence>  
            <xs:element name="city"  type="xs:positiveInteger"></xs:element>  
            <xs:element name="nearbyCities"  type="TrueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ############################################################  -->  
    <xs:group name="cityOrCountryFilter">  
        <xs:choice>  
            <xs:group ref="groupOfCity"></xs:group>  
            <xs:element name="country"  type="xs:integer"></xs:element>  
        </xs:choice>  
    </xs:group>  
    <!--  ############################################################  -->  
    <xs:group name="resultsPerPageGroup">  
        <xs:sequence>  
            <xs:element name="resultsPerPage"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="page"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ############################################################  -->  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
complexCondition.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://us.dotwconnect.com/xsd/complexCondition" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" targetNamespace="http://us.dotwconnect.com/xsd/complexCondition">  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition" schemaLocation="atomicCondition.xsd"></xs:import>  
    <xs:element name="condition">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:choice>  
                    <xs:group ref="complexis"></xs:group>  
                    <xs:group ref="a:atomics"></xs:group>  
                </xs:choice>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <xs:group name="complexis">  
        <xs:sequence>  
            <xs:element ref="condition"></xs:element>  
            <xs:sequence minOccurs="0"  maxOccurs="unbounded">  
                <xs:element name="operator"  type="operatorType"></xs:element>  
                <xs:element ref="condition"></xs:element>  
            </xs:sequence>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="operatorType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="AND|OR"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
atomicCondition.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://us.dotwconnect.com/xsd/atomicCondition" targetNamespace="http://us.dotwconnect.com/xsd/atomicCondition">  
    <xs:element name="condition">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:element name="fieldName"  type="fieldNameType"></xs:element>  
                <xs:element name="fieldTest"  type="fieldTestType"></xs:element>  
                <xs:element name="fieldValues"  type="fieldValuesType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:simpleType name="fieldNameType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="hotelId"></xs:enumeration>  
            <xs:enumeration value="price"></xs:enumeration>  
            <xs:enumeration value="preferred"></xs:enumeration>  
            <xs:enumeration value="onRequest"></xs:enumeration>  
            <xs:enumeration value="rating"></xs:enumeration>  
            <xs:enumeration value="luxury"></xs:enumeration>  
            <xs:enumeration value="topDeals"></xs:enumeration>  
            <xs:enumeration value="specialDeals"></xs:enumeration>  
            <xs:enumeration value="location"></xs:enumeration>  
            <xs:enumeration value="locationId"></xs:enumeration>  
            <xs:enumeration value="amenitie"></xs:enumeration>  
            <xs:enumeration value="leisure"></xs:enumeration>  
            <xs:enumeration value="business"></xs:enumeration>  
            <xs:enumeration value="hotelPreference"></xs:enumeration>  
            <xs:enumeration value="chain"></xs:enumeration>  
            <xs:enumeration value="attraction"></xs:enumeration>  
            <xs:enumeration value="hotelName"></xs:enumeration>  
            <xs:enumeration value="builtYear"></xs:enumeration>  
            <xs:enumeration value="renovationYear"></xs:enumeration>  
            <xs:enumeration value="floors"></xs:enumeration>  
            <xs:enumeration value="noOfRooms"></xs:enumeration>  
            <xs:enumeration value="fireSafety"></xs:enumeration>  
            <xs:enumeration value="roomOnRequest"></xs:enumeration>  
            <xs:enumeration value="lastUpdated"></xs:enumeration>  
            <xs:enumeration value="roomPrice"></xs:enumeration>  
            <xs:enumeration value="suite"></xs:enumeration>  
            <xs:enumeration value="roomAmentie"></xs:enumeration>  
            <xs:enumeration value="roomId"></xs:enumeration>  
            <xs:enumeration value="roomRateBasis"></xs:enumeration>  
            <xs:enumeration value="roomName"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="fieldTestType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="equals"></xs:enumeration>  
            <xs:enumeration value="in"></xs:enumeration>  
            <xs:enumeration value="notin"></xs:enumeration>  
            <xs:enumeration value="between"></xs:enumeration>  
            <xs:enumeration value="regex"></xs:enumeration>  
            <xs:enumeration value="like"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="fieldValuesType">  
        <xs:sequence>  
            <xs:element name="fieldValue"  type="xs:string"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="fieldValueType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{1,5}|true|false"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:group name="atomics">  
        <xs:sequence>  
            <xs:element ref="condition"></xs:element>  
            <xs:sequence minOccurs="0"  maxOccurs="unbounded">  
                <xs:element name="operator"  type="xs:string"></xs:element>  
                <xs:element ref="condition"></xs:element>  
            </xs:sequence>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="roomFieldNameType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="roomPrice"></xs:enumeration>  
            <xs:enumeration value="roomId"></xs:enumeration>  
            <xs:enumeration value="roomRateBasis"></xs:enumeration>  
            <xs:enumeration value="roomName"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
loginDetails.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
bookingDetails.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition_rooms" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition_rooms">  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition_rooms" schemaLocation="atomicCondition_rooms.xsd"></xs:import>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/complexCondition_rooms" schemaLocation="complexCondition_rooms.xsd"></xs:import>  
    <xs:complexType name="searchHotelsBookingDetailsType">  
        <xs:sequence>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="rooms"  type="roomsType"></xs:element>  
            <xs:element name="productCodeRequested"  type="xs:integer" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsBookingDetailsType">  
        <xs:sequence>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="rooms"  type="getRoomsRoomsType"></xs:element>  
            <xs:element name="productId"  type="xs:integer"></xs:element>  
            <xs:element name="roomModified"  type="xs:integer" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="confirmBookingBookingDetailsType">  
        <xs:sequence>  
            <xs:element name="parent"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="bookingCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:group ref="addToBookedItnGroup" minOccurs="0"></xs:group>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="productId"  type="xs:integer"></xs:element>  
            <xs:element name="sendCommunicationTo"  type="validEmailType" minOccurs="0"></xs:element>  
            <xs:element name="customerReference"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="rooms"  type="confirmBookingRoomsType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getExtraMealsBookingDetailsType">  
        <xs:sequence>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="productId"  type="xs:integer"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="addToBookedItnGroup">  
        <xs:sequence>  
            <xs:element name="addToBookedItn"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="bookedItnParent"  type="xs:nonNegativeInteger"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ###############################################  -->  
    <xs:group name="bookingDetailsDefaultGroup">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType"></xs:element>  
            <xs:element name="currency"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="commission"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ###############################################  -->  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10,11}|2[0-9]{3,3}-(0[1-9]|[1][0-2])-(0[1-9]|[1-2][0-9]|3[0-1])"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="roomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="roomType"  maxOccurs="5"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsRoomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="getRoomsRoomType"  maxOccurs="5"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsReturnType">  
        <xs:sequence>  
            <xs:element name="filters" minOccurs="0">  
                <xs:complexType>  
                    <xs:sequence>  
                        <xs:element name="rateTypes"  type="rateTypesType" minOccurs="0"></xs:element>  
                        <xs:element ref="c:condition" minOccurs="0"></xs:element>  
                    </xs:sequence>  
                </xs:complexType>  
            </xs:element>  
            <xs:element name="fields" minOccurs="0">  
                <xs:complexType>  
                    <xs:choice minOccurs="1"  maxOccurs="unbounded">  
                        <xs:element name="field"  type="oldRoomFieldValue"></xs:element>  
                        <xs:element name="roomField"  type="roomFieldValue"></xs:element>  
                    </xs:choice>  
                </xs:complexType>  
                <xs:unique name="differentRoomFieldValue">  
                    <xs:selector xpath="roomField"></xs:selector>  
                    <xs:field xpath="field"></xs:field>  
                </xs:unique>  
            </xs:element>  
            <xs:element name="showEmpty"  type="TrueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="confirmBookingRoomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="confirmBookingRoomType"  maxOccurs="5"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="roomOccupancy">  
        <xs:sequence>  
            <xs:element name="adultsCode"  type="adultsCodeType"></xs:element>  
            <xs:element name="children"  type="childrenType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="confirmRoomOccupancy">  
        <xs:sequence>  
            <xs:element name="adultsCode"  type="adultsCodeType"></xs:element>  
            <xs:element name="actualAdults"  type="adultsCodeType"></xs:element>  
            <xs:element name="children"  type="childrenType"></xs:element>  
            <xs:element name="actualChildren"  type="actualChildrenType"></xs:element>  
            <xs:element name="extraBed"  type="extraBedType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="updateRoomOccupancy">  
        <xs:sequence>  
            <xs:element name="adultsCode"  type="adultsCodeType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="actualAdults"  type="adultsCodeType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="children"  type="childrenType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="actualChildren"  type="actualChildrenType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="extraBed"  type="extraBedType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:complexType name="roomType">  
        <xs:sequence>  
            <xs:group ref="roomOccupancy"></xs:group>  
            <xs:element name="rateBasis"  type="xs:integer"></xs:element>  
            <xs:element name="passengerNationality"  type="xs:integer" minOccurs="0"></xs:element>  
            <xs:element name="passengerCountryOfResidence"  type="xs:integer" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:attribute name="no">  
        <xs:simpleType>  
            <xs:restriction base="xs:integer">  
                <xs:minInclusive value="0"></xs:minInclusive>  
                <xs:maxInclusive value="4"></xs:maxInclusive>  
            </xs:restriction>  
        </xs:simpleType>  
    </xs:attribute>  
    <!--  ################################################  -->  
    <xs:complexType name="actualChildrenType">  
        <xs:sequence>  
            <xs:element minOccurs="0"  maxOccurs="4" name="actualChild"  type="actualChildType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="actualChildType">  
        <xs:simpleContent>  
            <xs:extension base="childAge">  
                <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="childrenType">  
        <xs:sequence>  
            <xs:element minOccurs="0"  maxOccurs="4" name="child"  type="childType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="childType">  
        <xs:simpleContent>  
            <xs:extension base="childAge">  
                <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="childAge">  
        <xs:restriction base="xs:integer">  
            <xs:minInclusive value="1"></xs:minInclusive>  
            <xs:maxInclusive value="21"></xs:maxInclusive>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="extraBedType">  
        <xs:restriction base="xs:integer">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsRoomType">  
        <xs:complexContent>  
            <xs:extension base="roomType">  
                <xs:sequence>  
                    <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
                    <xs:element name="roomTypeSelected"  type="roomTypeSelectedType" minOccurs="0"></xs:element>  
                </xs:sequence>  
            </xs:extension>  
        </xs:complexContent>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="confirmBookingRoomType">  
        <xs:sequence>  
            <xs:element name="roomTypeCode"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="selectedRateBasis"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string"></xs:element>  
            <xs:group ref="confirmRoomOccupancy"></xs:group>  
            <xs:element name="passengerNationality"  type="xs:integer" minOccurs="0"></xs:element>  
            <xs:element name="passengerCountryOfResidence"  type="xs:integer" minOccurs="0"></xs:element>  
            <xs:element name="customerReference"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
            <xs:element name="additionalServicesRelatedInformation"  type="additionalServicesRelatedInformationType" minOccurs="0"></xs:element>  
            <xs:element name="passengersDetails"  type="passengersDetailsType" minOccurs="0"></xs:element>  
            <xs:element name="specialRequests"  type="specialRequestsType" minOccurs="0"></xs:element>  
            <xs:element name="beddingPreference"  type="beddingPreferenceType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="updateBookingBookingDetails">  
        <xs:sequence>  
            <xs:group ref="bookingTypeAndCode"></xs:group>  
            <xs:element name="rateBasis"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:group ref="confirmForUpdateGroup"></xs:group>  
            <xs:element name="fromDate"  type="dotwDateType"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType"></xs:element>  
            <xs:group ref="updateRoomOccupancy"></xs:group>  
            <xs:element name="customerReference"  type="xs:string"></xs:element>  
            <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
            <xs:element name="additionalServicesRelatedInformation"  type="additionalServicesRelatedInformationType" minOccurs="0"></xs:element>  
            <xs:element name="passengersDetails"  type="passengersDetailsType"></xs:element>  
            <xs:element name="specialRequests"  type="specialRequestsType" minOccurs="0"></xs:element>  
            <xs:element name="beddingPreference"  type="beddingPreferenceType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="roomTypeSelectedType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:positiveInteger"></xs:element>  
            <xs:element name="selectedRateBasis"  type="selectedRateBasisType"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="selectedRateBasisType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1331"></xs:enumeration>  
            <xs:enumeration value="1332"></xs:enumeration>  
            <xs:enumeration value="1333"></xs:enumeration>  
            <xs:enumeration value="1334"></xs:enumeration>  
            <xs:enumeration value="1335"></xs:enumeration>  
            <xs:enumeration value="1336"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="beddingPreferenceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ###############################################  -->  
    <!--  ###############################################  -->  
    <xs:complexType name="passengersDetailsType">  
        <xs:sequence>  
            <xs:element name="passenger"  type="passengerType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="passengerType">  
        <xs:sequence>  
            <xs:element name="salutation"  type="xs:integer"></xs:element>  
            <xs:element name="firstName"  type="xs:string"></xs:element>  
            <xs:element name="lastName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="leading"  type="leadingType" use="optional"></xs:attribute>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:simpleType name="leadingType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="no"></xs:enumeration>  
            <xs:enumeration value="yes"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ###############################################  -->  
    <xs:complexType name="specialRequestsType">  
        <xs:sequence>  
            <xs:element name="req"  maxOccurs="unbounded" minOccurs="0">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:nonNegativeInteger">  
                            <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="selectedExtraMealsType">  
        <xs:sequence>  
            <xs:element name="mealPlanDate"  type="mealPlanDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="mealPlanDateType">  
        <xs:sequence>  
            <xs:element name="mealPlan"  type="mealPlanType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealplandatetime"  type="dotwDateType"></xs:attribute>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="mealPlanType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
        <xs:attribute name="mealscount"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableForType" use="required"></xs:attribute>  
        <xs:attribute name="childage"  type="childAge"></xs:attribute>  
        <xs:attribute name="ispassenger"  type="xs:nonNegativeInteger"  fixed="1" use="required"></xs:attribute>  
        <xs:attribute name="passengernumber"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="mealType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="mealTypeCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="units"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="mealPrice"  type="xs:decimal" minOccurs="0"></xs:element>  
            <xs:element name="bookedMealCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:simpleType name="applicableForType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="adult"></xs:enumeration>  
            <xs:enumeration value="child"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ###############################################  -->  
    <xs:complexType name="additionalServicesRelatedInformationType">  
        <xs:sequence>  
            <xs:element name="additionalServiceRelatedInformation"  type="additionalServiceRelatedInformationType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="additionalServiceRelatedInformationType">  
        <xs:sequence>  
            <xs:element name="information"  type="informationType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="serviceid"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="informationType">  
        <xs:sequence>  
            <xs:element name="answer"  type="xs:string"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:group name="confirmForUpdateGroup">  
        <xs:sequence>  
            <xs:element name="confirm"  type="confirmType"></xs:element>  
            <xs:element name=""  type="testPricesAndAllocationType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardPaymentDetails"  type="creditCardPaymentDetailsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:complexType name="creditCardPaymentDetailsType">  
        <xs:sequence>  
            <xs:element name="paymentMethod"  type="paymentMethodType"></xs:element>  
            <xs:element name="usedCredit"  type="positiveDecimal"></xs:element>  
            <xs:element name="creditCardCharge"  type="positiveDecimal"></xs:element>  
            <xs:element name="creditCardDetails"  type="creditCardDetailsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="positiveDecimal">  
        <xs:restriction base="xs:decimal">  
            <xs:minInclusive value="0"></xs:minInclusive>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="paymentMethodType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="CC_PAYMENT_COMMISSIONABLE|CC_PAYMENT_NET"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="creditCardDetailsType">  
        <xs:sequence>  
            <xs:element name="creditCardType"  type="creditCardTypeType"></xs:element>  
            <xs:element name="creditCardNumber"  type="creditCardNumberType"></xs:element>  
            <xs:element name="creditCardHolderName"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="creditCardExpMonth"  type="creditCardExpMonthType"></xs:element>  
            <xs:element name="creditCardExpYear"  type="creditCardExpYearType"></xs:element>  
            <xs:element name="creditCardCVC"  type="creditCardCVCType"></xs:element>  
            <xs:element name="avsDetails"  type="avsDetailsType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="creditCardTypeType">  
        <xs:restriction base="xs:unsignedInt">  
            <xs:pattern value="100|101|102"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardNumberType">  
        <xs:restriction base="xs:long">  
            <xs:pattern value="[0-9]{15,16}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="requiredTextFieldType">  
        <xs:restriction base="xs:string">  
            <xs:minLength value="1"></xs:minLength>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardExpMonthType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="0[1-9]|1[0-2]"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardExpYearType">  
        <xs:restriction base="xs:unsignedInt">  
            <xs:pattern value="2[0-9]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardCVCType">  
        <xs:restriction base="xs:unsignedInt">  
            <xs:pattern value="[0-9]{3,4}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="avsDetailsType">  
        <xs:sequence>  
            <xs:element name="avsFirstName"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsLastName"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsAddress"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsZip"  type="xs:string"></xs:element>  
            <xs:element name="avsCountry"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsCity"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsEmail"  type="validEmailType"></xs:element>  
            <xs:element name="avsPhone"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="testPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="serviceType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="bookTestPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="serviceType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="serviceType">  
        <xs:sequence>  
            <xs:element name="testPrice"  type="xs:decimal"></xs:element>  
            <xs:element name="penaltyApplied"  type="xs:decimal" minOccurs="0"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string"></xs:element>  
            <xs:element name="paymentBalance"  type="xs:decimal" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="referencenumber"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="cancelTestPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="cancelServiceType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="deleteTestPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="cancelServiceType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="cancelServiceType">  
        <xs:sequence>  
            <xs:element name="penaltyApplied"  type="xs:decimal"></xs:element>  
            <xs:element name="paymentBalance"  type="xs:decimal" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="referencenumber"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:simpleType name="validEmailType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="oldRoomFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="leftToSell"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="roomFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="name"></xs:enumeration>  
            <xs:enumeration value="roomInfo"></xs:enumeration>  
            <xs:enumeration value="specials"></xs:enumeration>  
            <xs:enumeration value="minStay"></xs:enumeration>  
            <xs:enumeration value="dateApplyMinStay"></xs:enumeration>  
            <xs:enumeration value="cancellation"></xs:enumeration>  
            <xs:enumeration value="tariffNotes"></xs:enumeration>  
            <xs:enumeration value="freeStay"></xs:enumeration>  
            <xs:enumeration value="dayOnRequest"></xs:enumeration>  
            <xs:enumeration value="lookedForText"></xs:enumeration>  
            <xs:enumeration value="leftToSell"></xs:enumeration>  
            <xs:enumeration value="dailyMinStay"></xs:enumeration>  
            <xs:enumeration value="including"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="rateFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="status"></xs:enumeration>  
            <xs:enumeration value="rateType"></xs:enumeration>  
            <xs:enumeration value="allowsExtraMeals"></xs:enumeration>  
            <xs:enumeration value="allowsSpecialRequests"></xs:enumeration>  
            <xs:enumeration value="passengerNamesRequiredForBooking"></xs:enumeration>  
            <xs:enumeration value="allocationDetails"></xs:enumeration>  
            <xs:enumeration value="cancellationRules"></xs:enumeration>  
            <xs:enumeration value="withinCancellationDeadline"></xs:enumeration>  
            <xs:enumeration value="isBookable"></xs:enumeration>  
            <xs:enumeration value="onRequest"></xs:enumeration>  
            <xs:enumeration value="total"></xs:enumeration>  
            <xs:enumeration value="dates"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:complexType name="rateTypesType">  
        <xs:sequence>  
            <xs:element name="rateType" minOccurs="1"  maxOccurs="3">  
                <xs:simpleType>  
                    <xs:restriction base="xs:integer">  
                        <xs:enumeration value="1"></xs:enumeration>  
                        <xs:enumeration value="2"></xs:enumeration>  
                        <xs:enumeration value="3"></xs:enumeration>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ############################################################  -->  
</xs:schema>  
general.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="productType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment|transfer"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  

General Response
After you initiate the searchhotels command, our system will process the request and it will look for availability in accordance with the provided search criteria. It will calculate the cheapest price per each meal type, if not otherwise requested (in case of static data download, when you restrict the return of this element by including the noprice element with value true) and it will return a list of hotels along with all their room types that match your search criteria with a minimum of details.

The general format of the response is shown below:

General Response
After you initiate the searchhotels command, our system will process the request and it will look for availability in accordance with the provided search criteria. It will calculate the cheapest price per each meal type, if not otherwise requested (in case of static data download, when you restrict the return of this element by including the noprice element with value true) and it will return a list of hotels along with all their room types that match your search criteria with a minimum of details.

The general format of the response is shown below:

<result command="searchhotels" tID="" ip="" date="" version="" elapsedTime="">  
    <hotels>  
        <hotel hotelid="">  
            <rooms>  
                <room adults="" children="" childrenages="" extrabeds="">  
                    <roomType roomtypecode="">  
                        <name></name>  
                        <rateBases>  
                            <rateBasis id="">  
                                <rateType currencyid="" nonrefundable="" notes=""></rateType>  
                                <cancellationRules>  
                                    <rule>  
                                        <fromDate></fromDate>  
                                        <toDate></toDate>  
                                        <amendRestricted></amendRestricted>  
                                        <cancelRestricted></cancelRestricted>  
                                        <noShowPolicy></noShowPolicy>  
                                        <amendCharge></amendCharge>  
                                        <amendChargeCommission></amendChargeCommission>  
                                        <cancelCharge></cancelCharge>  
                                        <cancelChargeCommission></cancelChargeCommission>  
                                        <charge>Cancellation Charge</charge>  
                                    </rule>  
                                </cancellationRules>  
                                <total>Total Price in Rate Currency</total>  
                                <totalTaxes>Total Taxes Amount included in Total Price in Rate Currency</totalTaxes>  
                                <totalFee>Total Fee Amount included in total Price in Rate Currency</totalFee>  
                                <propertyFees count="">  
                                    <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">Fee amount in Rate Currency</propertyFee>  
                                </propertyFees>  
                                <totalCommission></totalCommission>  
                                <totalNetPrice></totalNetPrice>  
                                <totalMinimumSelling>MSP in Rate Currency</totalMinimumSelling>  
                                <totalInRequestedCurrency>Total in requested currency</totalInRequestedCurrency>  
                                <totalMinimumSellingInRequestedCurrency>MSP in requested currency</totalMinimumSellingInRequestedCurrency>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                </room>  
            </rooms>  
        </hotel>  
    </hotels>  
    <successful>TRUE</successful>  
</result>  
<result command="searchhotels" tID="" ip="" date="" version="" elapsedTime="">  
    <hotels>  
        <hotel hotelid="">  
            <rooms>  
                <room adults="" children="" childrenages="" extrabeds="">  
                    <roomType roomtypecode="">  
                        <name></name>  
                        <rateBases>  
                            <rateBasis id="">  
                                <rateType currencyid="" nonrefundable="" notes=""></rateType>  
                                <cancellationRules>  
                                    <rule>  
                                        <fromDate></fromDate>  
                                        <toDate></toDate>  
                                        <amendRestricted></amendRestricted>  
                                        <cancelRestricted></cancelRestricted>  
                                        <noShowPolicy></noShowPolicy>  
                                        <amendCharge></amendCharge>  
                                        <amendChargeCommission></amendChargeCommission>  
                                        <cancelCharge></cancelCharge>  
                                        <cancelChargeCommission></cancelChargeCommission>  
                                        <charge>Cancellation Charge</charge>  
                                    </rule>  
                                </cancellationRules>  
                                <total>Total Price in Rate Currency</total>  
                                <totalTaxes>Total Taxes Amount included in Total Price in Rate Currency</totalTaxes>  
                                <totalFee>Total Fee Amount included in total Price in Rate Currency</totalFee>  
                                <propertyFees count="">  
                                    <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">Fee amount in Rate Currency</propertyFee>  
                                </propertyFees>  
                                <totalCommission></totalCommission>  
                                <totalNetPrice></totalNetPrice>  
                                <totalMinimumSelling>MSP in Rate Currency</totalMinimumSelling>  
                                <totalInRequestedCurrency>Total in requested currency</totalInRequestedCurrency>  
                                <totalMinimumSellingInRequestedCurrency>MSP in requested currency</totalMinimumSellingInRequestedCurrency>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                </room>  
            </rooms>  
        </hotel>  
    </hotels>  
    <successful>TRUE</successful>  
</result>  
 

Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@command	Attribute	result	The request command which returned this result.
@ip	Attribute	result	The Ipv4 address the request was made from.
@elapsedTime	Attribute	result	The time required to process the request and return the response
@tID	Attribute	result	The unique transaction Id that has been attributed to the response
hotels	Element	return	The hotel response list. Contains a hotel element for each hotel returned by DOTWconnect system.
hotel	Element	hotels	Contains information about one hotel.
@hotelid	Attribute	hotel	Contains the hotel internal code.
rooms	Element	hotel	Contains a room element for each room a customer wishes to book.
room	Element	rooms	Encapsulates details about room types for the specified room occupancy.
@adults	Attribute	room	Number of adults from the request or 2t for a twin room.
@children	Attribute	room	Number of children from the request.
@childrenages	Attribute	room	Child ages separated by comma. Added only if children.
@extrabeds	Attribute	room	Number of extra beds.
roomType	Element	room	Encapsulates information about a room type.
@roomtypecode	Attribute	roomType	Internal code for the room type.
name	Element	roomType	The room type name.
rateBases	Element	roomType	Groups details about room type by rate basis.
rateBasis	Attribute	rateBases	Details about room type with this rate basis.
@id	Attribute	rateBasis	Internal code for rate basis.
rateType	Element	rateBasis	Specifies the rate type. Possible values:
1 - DOTW rate type
2 - DYNAMIC DIRECT rate type
3 - DYNAMIC 3rd PARTY rate type
Please note that the blocking process guarantees the allotment (holds inventory) only for DOTW rate types. For the DYNAMIC rates, only the price is checked and guaranteed. Sending the blocking request is however mandatory for both rate types.
@currencyid	Attribute	rateType	Internal code of the currency in which the prices for this rate are provided.
ONLY For Non Refundable Advance Purchase Rates, this can be a different currency than the one requested. To see the prices in the requested currency you should look for the price elements which clearly specify InRequestedCurrency (totalInRequestedCurrency, totalMinimumSellingInRequestedCurrency, priceInRequestedCurrency, priceMinimumSellingInRequestedCurrency)
@nonrefundable	Attribute	rateType	If present, indicates that the rate is Non Refundable Advance Purchase.
Possible values:
yes
To be able to book this rate it is mandatory for your application to use the savebooking and bookitinerary booking flow.
@notes	Attribute	rateType	If present, contains a free flow text with additional notes about the rate, mainly
total	Element	rateBasis	This element contains the total price (net or commissionable) for the rate basis. The price will be for the whole stay for this room type in the currency specified in the request.
totalTaxes	Element	rateBasis	If present, this element contains the total taxes that are included in total rate price in rate currency.
totalFee	Element	rateBasis	If present, this element contains the total fee that is included in total rate price in rate currency.
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the rate currency.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the rate currency.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
totalCommission	Element	rateBasis	This element returns the amount representing the commission (valid only for commissionable accounts)
totalMinimumSelling	Element	rateBasis	This element returns the minimum selling price the customer should adhere to while distributing the product (B2C platform). XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
totalInRequestedCurrency	Element	rateBasis	This element is present only for Non Refundable Advance Rates and when the rateType/@currencyid is different from the requested currency. This element contains the total price for the room type and rate basis in two formats one without any formatting and the other one properly formatted. The price will be for the whole stay for this room type in the currency specified in the request.
totalMinimumSellingInRequestedCurrency	Element	rateBasis	This element is presented only for Non Refundable Advance Purchase rates and when the rateType/@currencyid is different from the requested currency. This element returns the minimum selling price the customer should adhere to while distributing the product (B2C platform). XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
 

 

Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@command	Attribute	result	The request command which returned this result.
@ip	Attribute	result	The Ipv4 address the request was made from.
@elapsedTime	Attribute	result	The time required to process the request and return the response
@tID	Attribute	result	The unique transaction Id that has been attributed to the response
hotels	Element	return	The hotel response list. Contains a hotel element for each hotel returned by DOTWconnect system.
hotel	Element	hotels	Contains information about one hotel.
@hotelid	Attribute	hotel	Contains the hotel internal code.
rooms	Element	hotel	Contains a room element for each room a customer wishes to book.
room	Element	rooms	Encapsulates details about room types for the specified room occupancy.
@adults	Attribute	room	Number of adults from the request or 2t for a twin room.
@children	Attribute	room	Number of children from the request.
@childrenages	Attribute	room	Child ages separated by comma. Added only if children.
@extrabeds	Attribute	room	Number of extra beds.
roomType	Element	room	Encapsulates information about a room type.
@roomtypecode	Attribute	roomType	Internal code for the room type.
name	Element	roomType	The room type name.
rateBases	Element	roomType	Groups details about room type by rate basis.
rateBasis	Attribute	rateBases	Details about room type with this rate basis.
@id	Attribute	rateBasis	Internal code for rate basis.
rateType	Element	rateBasis	Specifies the rate type. Possible values:
1 - DOTW rate type
2 - DYNAMIC DIRECT rate type
3 - DYNAMIC 3rd PARTY rate type
Please note that the blocking process guarantees the allotment (holds inventory) only for DOTW rate types. For the DYNAMIC rates, only the price is checked and guaranteed. Sending the blocking request is however mandatory for both rate types.
@currencyid	Attribute	rateType	Internal code of the currency in which the prices for this rate are provided.
ONLY For Non Refundable Advance Purchase Rates, this can be a different currency than the one requested. To see the prices in the requested currency you should look for the price elements which clearly specify InRequestedCurrency (totalInRequestedCurrency, totalMinimumSellingInRequestedCurrency, priceInRequestedCurrency, priceMinimumSellingInRequestedCurrency)
@nonrefundable	Attribute	rateType	If present, indicates that the rate is Non Refundable Advance Purchase.
Possible values:
yes
To be able to book this rate it is mandatory for your application to use the savebooking and bookitinerary booking flow.
@notes	Attribute	rateType	If present, contains a free flow text with additional notes about the rate, mainly
cancellationRules	Element	rateBasis	Encapsulates details about the cancellation policy applicable for this room type and rate basis.
rule	Element	cancellationRules	Contains details about a specific cancellation policy.
fromDate	Element	rule	Starting date of the rule. From this day forward until toDate (if present), the specified charge will be applied for any cancellations or amendments. If this element is not present then the charge will be applied from the current date until toDate. Date format is: YYYY-MM-DD HH:MM:SS
toDate	Element	rule	Ending date of the rule. The specified charge will be applied for any cancellations or amendments until this date. If this element is not present then the charge from fromDate onwards. Date format is: YYYY-MM-DD HH:MM:SS
amendRestricted	Element	rule	If present, this element indicates that a future amendment (using the updatebooking method) done in the time period defined by this rule, will not be possible. Fixed value:

TRUE
cancelRestricted	Element	rule	If present, this element indicates that a future cancel (using the cancelbooking or deleteitinerary methods) done in the time period defined by this rule, will not be possible. Fixed value:

TRUE
noShowPolicy	Element	rule	If present, this element indicates that the presented charge is a no show charge. In this case the elements fromDate, toDate, amendingPossible will be absent. Fixed value:

TRUE
amendCharge	Element	rule	Amendment charge that will be applied if booking is amended in the period defined by this rule.
amendChargeCommission	Element	rule	The amount representing the commission from the amend charge (returned for commissionable accounts)
cancelCharge	Element	rule	Cancellation charge that will be applied if booking is canceled in the period defined by this rule.
cancelChargeCommission	Element	rule	The amount representing the commission from the cancellation charge (returned for commissionable accounts)
charge	Element	rule	Charge that will be applied if booking is a no show.
total	Element	rateBasis	This element contains the total price (net or commissionable) for the rate basis. The price will be for the whole stay for this room type in the currency specified in the request.
totalTaxes	Element	rateBasis	If present, this element contains the total taxes that are included in total rate price in rate currency.
totalFee	Element	rateBasis	If present, this element contains the total fee that is included in total rate price in rate currency.
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the rate currency.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the rate currency.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
totalCommission	Element	rateBasis	This element returns the amount representing the commission (valid only for commissionable accounts)
totalNetPrice	Element	rateBasis	This element returns the value of the net total amount (valid only for commissionable accounts)
totalMinimumSelling	Element	rateBasis	This element returns the minimum selling price the customer should adhere to while distributing the product (B2C platform). XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
totalInRequestedCurrency	Element	rateBasis	This element is present only for Non Refundable Advance Rates and when the rateType/@currencyid is different from the requested currency. This element contains the total price for the room type and rate basis in two formats one without any formatting and the other one properly formatted. The price will be for the whole stay for this room type in the currency specified in the request.
totalMinimumSellingInRequestedCurrency	Element	rateBasis	This element is presented only for Non Refundable Advance Purchase rates and when the rateType/@currencyid is different from the requested currency. This element returns the minimum selling price the customer should adhere to while distributing the product (B2C platform). XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
 

searchhotels_response.xsd

searchhotels_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="hotels"  type="hotelsType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="searchhotels"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="oneOrZero">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="1|0"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="rateTypeRestriction">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="rateTypeType">  
        <xs:simpleContent>  
            <xs:extension base="rateTypeRestriction">  
                <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                <xs:attribute name="nonrefundable"  type="xs:string"  fixed="yes" use="optional"></xs:attribute>  
                <xs:attribute name="notes"  type="xs:string" use="optional"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
            <xs:enumeration value="11"></xs:enumeration>  
            <xs:enumeration value="12"></xs:enumeration>  
            <xs:enumeration value="13"></xs:enumeration>  
            <xs:enumeration value="14"></xs:enumeration>  
            <xs:enumeration value="15"></xs:enumeration>  
            <xs:enumeration value="16"></xs:enumeration>  
            <xs:enumeration value="17"></xs:enumeration>  
            <xs:enumeration value="18"></xs:enumeration>  
            <xs:enumeration value="19"></xs:enumeration>  
            <xs:enumeration value="20"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="empty">  
        <xs:restriction base="xs:string">  
            <xs:maxLength value="0"></xs:maxLength>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="hotelsType">  
        <xs:sequence>  
            <xs:element name="hotel"  type="hotelType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="hotelType">  
        <xs:all>  
            <xs:element name="rooms"  type="roomsType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="hotelid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="roomType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="roomType">  
        <xs:sequence>  
            <xs:element name="roomType"  type="roomTypeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="adults"  type="adultsCodeType" use="required"></xs:attribute>  
        <xs:attribute name="children"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="childrenages"  type="xs:string"></xs:attribute>  
        <xs:attribute name="extrabeds"  type="oneOrZero" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomTypeType">  
        <xs:all>  
            <xs:element name="name"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="rateBases"  type="rateBasesType" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="roomtypecode"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBasesType">  
        <xs:sequence>  
            <xs:element name="rateBasis"  type="rateBasisType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="rateBasisType">  
        <xs:all>  
            <xs:element name="rateType"  type="rateTypeType"></xs:element>  
            <xs:element name="total"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="totalTaxes"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="totalFee"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="totalMinimumSelling"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="totalInRequestedCurrency"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="totalMinimumSellingInRequestedCurrency"  type="xs:string" minOccurs="0"></xs:element>  
        </xs:all>  
        <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeesType" mixed="true">  
        <xs:sequence>  
            <xs:element name="propertyFee"  type="propertyFeeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeeType" mixed="true">  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="currencyshort"  type="currencyShortType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="includedinprice"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="Yes|No"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="hotels"  type="hotelsType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="searchhotels"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="oneOrZero">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="1|0"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ ]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="rateTypeRestriction">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="rateTypeType">  
        <xs:simpleContent>  
            <xs:extension base="rateTypeRestriction">  
                <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                <xs:attribute name="nonrefundable"  type="xs:string"  fixed="yes" use="optional"></xs:attribute>  
                <xs:attribute name="notes"  type="xs:string" use="optional"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
            <xs:enumeration value="11"></xs:enumeration>  
            <xs:enumeration value="12"></xs:enumeration>  
            <xs:enumeration value="13"></xs:enumeration>  
            <xs:enumeration value="14"></xs:enumeration>  
            <xs:enumeration value="15"></xs:enumeration>  
            <xs:enumeration value="16"></xs:enumeration>  
            <xs:enumeration value="17"></xs:enumeration>  
            <xs:enumeration value="18"></xs:enumeration>  
            <xs:enumeration value="19"></xs:enumeration>  
            <xs:enumeration value="20"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="empty">  
        <xs:restriction base="xs:string">  
            <xs:maxLength value="0"></xs:maxLength>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="hotelsType">  
        <xs:sequence>  
            <xs:element name="hotel"  type="hotelType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="hotelType">  
        <xs:all>  
            <xs:element name="rooms"  type="roomsType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="hotelid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="roomType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="roomType">  
        <xs:sequence>  
            <xs:element name="roomType"  type="roomTypeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="adults"  type="adultsCodeType" use="required"></xs:attribute>  
        <xs:attribute name="children"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="childrenages"  type="xs:string"></xs:attribute>  
        <xs:attribute name="extrabeds"  type="oneOrZero" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomTypeType">  
        <xs:all>  
            <xs:element name="name"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="rateBases"  type="rateBasesType" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="roomtypecode"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBasesType">  
        <xs:sequence>  
            <xs:element name="rateBasis"  type="rateBasisType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="rateBasisType">  
        <xs:all>  
            <xs:element name="rateType"  type="rateTypeType"></xs:element>  
            <xs:element name="cancellationRules"  type="cancellationRulesType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="total"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="totalTaxes"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="totalFee"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="totalMinimumSelling"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="totalInRequestedCurrency"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="totalMinimumSellingInRequestedCurrency"  type="xs:string" minOccurs="0"></xs:element>  
        </xs:all>  
        <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="cancellationRulesType">  
        <xs:sequence>  
            <xs:element name="rule"  type="ruleType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="ruleType">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="noShowPolicy"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="amendCharge"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="cancelCharge"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="charge"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="amendRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="cancelRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="propertyFeesType" mixed="true">  
        <xs:sequence>  
            <xs:element name="propertyFee"  type="propertyFeeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeeType" mixed="true">  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="currencyshort"  type="currencyShortType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="includedinprice"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="Yes|No"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
New search hotels structure by hotel id's
Please take into consideration the fact the we are dealing with a dynamic environment (we, ourselves, also depend on our suppliers) and therefore it's normal that results might slightly fluctuate from one hit to the other and especially between our XML feed and our DOTW user interface (because on our website we have a higher standard cut off time set for our suppliers than the standard 5 seconds cut off we have set via XML and this might generate differences in results).

Please note that we can provide a solution that offers our customers better and faster search results: it is a new searchhotels request structure, targeted on hotel IDs. This new searchhotels method is not a mandatory requirement from DOTW's side, therefore we can't force our customers to implement it during the certification process, but we strongly recommend it's implementation.

For improved performance and lower response rates the shopping method can be updated to the new searchhotels structure by hotelId.

To get all the available hotels in a city the request has to be sent per hotelId’s, but no more than 50 hotelId’s can be sent per request. Also, be careful to pass only hotelId's from the same city in one request.

Basically, grouping a maximum of 50 hotels per request, will result in a quicker DOTW response than when you are sending a request by city. This approach also allows you to target preferred hotels in a certain city or region. In cases when the area you are interested in has a higher number of hotels, your application should send multiple searchhotels requests.

So, for example, if you want to target all approximately 380 hotels available in Dubai, your application should send 7 searchhotels requests, each one containing a list of a maximum 50 hotelIds.

We understand that our customers might consider the new searchhotels by hotelId approach a bit different from other XML providers but I'll try to explain why we decided this new structure, targeted on product Ids, is better than the standard search by city.

Please note that via XML we have a cut off of 5 seconds for our suppliers, this means that when our customers send a request by city, which is a time consuming method, our suppliers might fail to respond during those 5 seconds therefore we might not be able to return all available properties for the search criteria so this way there's a high risk of them receiving fewer products in our response.

On the other hand, implementing the new targeted search is less time consuming therefore we can guarantee that more and faster results will be passed in our availability response. It's also very important for our customers to be aware that hitting our server with multiple simultaneous targeted search requests instead of one time with a request by city is more efficient and doesn't affect our system in any negative way.

Below you can find how the new searchhotels request should be sent to our server:

<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1 </source>  
    <product>hotel</product>  
    <request command="searchhotels">  
        <bookingdetails>  
            <fromdate></fromdate>  
            <todate></todate>  
            <currency></currency>  
            <rooms no="1">  
                <room runno="0">  
                    <adultscode></adultscode>  
                    <children no="0"></children>  
                    <ratebasis></ratebasis>  
                    <passengernationality></passengernationality>  
                    <passengercountryofresidence></passengercountryofresidence>  
                </room>  
            </rooms>  
        </bookingdetails>  
        <return>  
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
                <c:condition>  
                    <a:condition>  
                        <fieldname>hotelId</fieldname>  
                        <fieldtest>in</fieldtest>  
                        <fieldvalues>  
                            <fieldvalue>maximum 50 hotel ids per request</fieldvalue>  
                            <fieldvalue></fieldvalue>  
                            <fieldvalue></fieldvalue>  
                            <fieldvalue></fieldvalue>  
                            <fieldvalue></fieldvalue>  
                        </fieldvalues>  
                    </a:condition>  
                </c:condition>  
            </filters>  
        </return>  
    </request>  
</customer>  
Scenario H1
Customer searching for a hotel with the following parameters
Scenario H1
Customer searching for a hotel with the following parameters

City:	Dubai
Checkin Date:	01 January 2016
Checkout Date:	02 January 2016
Hotel Classification:	Luxury 5*
Number of Rooms:	1 Double Room, Best Available Rate Basis
1 Double Room with 1 Child aged 6, Best Available Rate Basis
PAX Nationality:	Romanian
PAX Country Of Residence:	Italy
Price Range:	Between 150 and 300 USD
Search for Hotels in Nearby cities:	No
 

City:	Dubai
Checkin Date:	01 January 2016
Checkout Date:	02 January 2016
Hotel Classification:	Luxury 5*
Number of Rooms:	1 Double Room, Best Available Rate Basis
1 Double Room with 1 Child aged 6, Best Available Rate Basis
PAX Nationality:	Romanian
PAX Country Of Residence:	Italy
Price Range:	Between 150 and 300 USD
Search for Hotels in Nearby cities:	No
 

The following will be the request and response XMLs that will be passed and received from DOTWconnect system.

Request XML format
The following will be the request and response XMLs that will be passed and received from DOTWconnect system.

Request XML format
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="searchhotels">  
        <bookingDetails>  
            <fromDate>1557007200</fromDate>  
            <toDate>1557093600</toDate>  
            <currency>520</currency>  
            <rooms no="2">  
                <room runno="0">  
                    <adultsCode>2</adultsCode>  
                    <children no="0"></children>  
                    <rateBasis>-1</rateBasis>  
                    <passengerNationality>81</passengerNationality>  
                    <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                </room>  
                <room runno="1">  
                    <adultsCode>2</adultsCode>  
                    <children no="1">  
                        <child runno="0">6</child>  
                    </children>  
                    <rateBasis>-1</rateBasis>  
                    <passengerNationality>81</passengerNationality>  
                    <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                </room>  
            </rooms>  
        </bookingDetails>  
        <return>  
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
                <city>364</city>  
                <nearbyCities>false</nearbyCities>  
                <c:condition>  
                    <a:condition>  
                        <fieldName>rating</fieldName>  
                        <fieldTest>equals</fieldTest>  
                        <fieldValues>  
                            <fieldValue>563</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                    <operator>AND</operator>  
                    <a:condition>  
                        <fieldName>price</fieldName>  
                        <fieldTest>between</fieldTest>  
                        <fieldValues>  
                            <fieldValue>150</fieldValue>  
                            <fieldValue>300</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                </c:condition>  
            </filters>  
        </return>  
    </request>  
</customer>  
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="searchhotels">  
        <bookingDetails>  
            <fromDate>1557007200</fromDate>  
            <toDate>1557093600</toDate>  
            <currency>520</currency>  
            <rooms no="2">  
                <room runno="0">  
                    <adultsCode>2</adultsCode>  
                    <children no="0"></children>  
                    <rateBasis>-1</rateBasis>  
                    <passengerNationality>81</passengerNationality>  
                    <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                </room>  
                <room runno="1">  
                    <adultsCode>2</adultsCode>  
                    <children no="1">  
                        <child runno="0">6</child>  
                    </children>  
                    <rateBasis>-1</rateBasis>  
                    <passengerNationality>81</passengerNationality>  
                    <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                </room>  
            </rooms>  
        </bookingDetails>  
        <return>  
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
                <city>364</city>  
                <nearbyCities>false</nearbyCities>  
                <c:condition>  
                    <a:condition>  
                        <fieldName>rating</fieldName>  
                        <fieldTest>equals</fieldTest>  
                        <fieldValues>  
                            <fieldValue>563</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                    <operator>AND</operator>  
                    <a:condition>  
                        <fieldName>price</fieldName>  
                        <fieldTest>between</fieldTest>  
                        <fieldValues>  
                            <fieldValue>150</fieldValue>  
                            <fieldValue>300</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                </c:condition>  
            </filters>  
        </return>  
    </request>  
</customer>  
Response XML Format
Response XML Format
<result command="searchhotels" date="2015-02-24 13:29:02" elapsedtime="2.4466769695282" ip="127.0.0.1" tid="1424784539000003" version="2.0">  
    <hotels>  
        <hotel id="30844">  
            <rooms>  
                <room adults="2" children="0" extrabeds="0">  
                    <roomtype roomtypecode="6945328">  
                        <name>KING ROOM 1</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                    <roomtype roomtypecode="6945338">  
                        <name>TWIN ROOM 2</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                </room>  
                <room adults="2" children="1" childrenages="6" extrabeds="0">  
                    <roomtype roomtypecode="6945328" runno="0">  
                        <name>KING ROOM 1</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                    <roomtype roomtypecode="6945338" runno="1">  
                        <name>TWIN ROOM 2</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                </room>  
            </rooms>  
        </hotel>  
    </hotels>  
    <successful>TRUE</successful>  
</result>  
<result command="searchhotels" date="2015-02-24 13:29:02" elapsedtime="2.4466769695282" ip="127.0.0.1" tid="1424784539000003" version="2.0">  
    <hotels>  
        <hotel id="30844">  
            <rooms>  
                <room adults="2" children="0" extrabeds="0">  
                    <roomtype roomtypecode="6945328">  
                        <name>KING ROOM 1</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <cancellationrules>  
                                    <rule>  
                                        <todate>2015-12-29 22:00:00</todate>  
                                        <amendcharge>0</amendcharge>  
                                        <cancelcharge>0</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-29 22:00:01</fromdate>  
                                        <todate>2015-12-31 02:00:00</todate>  
                                        <amendcharge>174.718</amendcharge>  
                                        <cancelcharge>174.718</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-31 02:00:01</fromdate>  
                                        <amendrestricted>true</amendrestricted>  
                                        <cancelrestricted>true</cancelrestricted>  
                                    </rule>  
                                </cancellationrules>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                    <roomtype roomtypecode="6945338">  
                        <name>TWIN ROOM 2</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <cancellationrules>  
                                    <rule>  
                                        <todate>2015-12-29 22:00:00</todate>  
                                        <amendcharge>0</amendcharge>  
                                        <cancelcharge>0</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-29 22:00:01</fromdate>  
                                        <todate>2015-12-31 02:00:00</todate>  
                                        <amendcharge>174.718</amendcharge>  
                                        <cancelcharge>174.718</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-31 02:00:01</fromdate>  
                                        <amendrestricted>true</amendrestricted>  
                                        <cancelrestricted>true</cancelrestricted>  
                                    </rule>  
                                </cancellationrules>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                </room>  
                <room adults="2" children="1" childrenages="6" extrabeds="0">  
                    <roomtype roomtypecode="6945328" runno="0">  
                        <name>KING ROOM 1</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <cancellationrules>  
                                    <rule>  
                                        <todate>2015-12-29 22:00:00</todate>  
                                        <amendcharge>0</amendcharge>  
                                        <cancelcharge>0</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-29 22:00:01</fromdate>  
                                        <todate>2015-12-31 02:00:00</todate>  
                                        <amendcharge>174.718</amendcharge>  
                                        <cancelcharge>174.718</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-31 02:00:01</fromdate>  
                                        <amendrestricted>true</amendrestricted>  
                                        <cancelrestricted>true</cancelrestricted>  
                                    </rule>  
                                </cancellationrules>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                    <roomtype roomtypecode="6945338" runno="1">  
                        <name>TWIN ROOM 2</name>  
                        <ratebases>  
                            <ratebasis id="0">  
                                <ratetype currencyid="520">2</ratetype>  
                                <cancellationrules>  
                                    <rule>  
                                        <todate>2015-12-29 22:00:00</todate>  
                                        <amendcharge>0</amendcharge>  
                                        <cancelcharge>0</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-29 22:00:01</fromdate>  
                                        <todate>2015-12-31 02:00:00</todate>  
                                        <amendcharge>174.718</amendcharge>  
                                        <cancelcharge>174.718</cancelcharge>  
                                    </rule>  
                                    <rule>  
                                        <fromdate>2015-12-31 02:00:01</fromdate>  
                                        <amendrestricted>true</amendrestricted>  
                                        <cancelrestricted>true</cancelrestricted>  
                                    </rule>  
                                </cancellationrules>  
                                <total>174.718</total>  
                                <totalminimumselling>197</totalminimumselling>  
                            </ratebasis>  
                        </ratebases>  
                    </roomtype>  
                </room>  
            </rooms>  
        </hotel>  
    </hotels>  
    <successful>TRUE</successful>  
</result>  
Get Rooms
General Request
This request is used to get a list of all roomtypes with rates, availability details for each roomtype for a selected hotel. It is mandatory for all our clients to add validation checks in this step for the details returned at selected property level as in the availability response some of the returned results  could be extracted from cache systems, this information being sometimes outdated.

Each response of this request also returns an encrypted string that can be passed in subsequent requests in order to block the desired roomtypes in the system until the booking process has been completed. DOTWconnect system will hold the specified roomtypes for no more than 5 minutes till the booking process is completed. The 5 minutes blocking time is guaranteed only for FIT contracts.

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="getrooms">  
        <bookingDetails>  
            <fromDate></fromDate>  
            <toDate></toDate>  
            <currency></currency>  
            <rooms no="">  
                <room runno="">  
                    <adultsCode></adultsCode>  
                    <children no="">  
                        <child runno=""></child>  
                    </children>  
                    <rateBasis></rateBasis>  
                    <passengerNationality></passengerNationality>  
                    <passengerCountryOfResidence></passengerCountryOfResidence>  
                    <roomTypeSelected>  
                        <code></code>  
                        <selectedRateBasis></selectedRateBasis>  
                        <allocationDetails></allocationDetails>  
                    </roomTypeSelected>  
                </room>  
            </rooms>  
            <productId></productId>  
        </bookingDetails>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
bookingDetails	Element	request	Contains travel dates, detailed room occupancy, currency code in which the prices are returned and also the internal code for the hotel you want to receive rates and allocation details.	Yes.
fromDate	Element	bookingDetails	Arrival date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
toDate	Element	bookingDetails	Departure date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
currency	Element	bookingDetails	Internal code of the currency in which the customer will see the prices.	Yes.
rooms	Element	bookingDetails	Contains a room element for each room the customer wishes to book.	Yes.
@no	Attribute	rooms	Specifies the total number of rooms.	Yes.
room	Element	rooms	Encapsulates details about one room.	Yes.
@runno	Attribute	room	Specifies for which room number out of total passed rooms the search specifications are applicable. Please note that the running serial number starts from 0.	Yes.
adultsCode	Element	room	Number of adults in the room; The possible codes are:
1
2
3
4
5
6
7
8
9
10
Yes.
children	Element	room	Specifies the details about the accompanying children in the room.	Yes.
@no	Attribute	children	Specifies the total number of children in the room. If the search does not include any child then the value should be 0.	Yes.
child	Element	children	Specifies a child age.	No.
@runno	Attribute	child	Specifies for which child the age is applicable.	Yes, if children@no >0.
rateBasis	Element	room	Specifies what rate basis you would like for this room (eg. Room Only, Half Board)	Yes.
passengerNationality

Element

room

Specifies passenger nationality and it is mandatory to be sent in the request. This is DOTW country internal code that can be obtained using the getallcountries request.

Yes.

passengerCountryOfResidence

Element

room

Specifies passenger country of residence and it is mandatory to be sent in the request.. This is DOTW country internal code that can be obtained using the getallcountries request.

Yes.

roomTypeSelected	Element	room	Contains information about a room type the customer wishes to block.	No. Used only in the getRooms with blocking.
code	Element	roomTypeSelected	Internal code for the roomtype the customer wishes to block.	Yes, if parent present.
selectedRateBasis	Element	roomTypeSelected	Internal code for the rate basis the customer wishes to block.	Yes, if parent present.
allocationDetails	Element	roomTypeSelected	An encrypted string containing infromation about the room type that was received in a previous response.	Yes, if parent present.
productId	Element	bookingDetails	Internal code of the hotel you wish to receive rates and allocation details for.	Yes.
 

getrooms.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition_rooms" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition_rooms">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition_rooms" schemaLocation="atomicCondition_rooms.xsd"></xs:import>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/complexCondition_rooms" schemaLocation="complexCondition_rooms.xsd"></xs:import>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="xs:string"  fixed="hotel"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="bookingDetails"  type="getRoomsBookingDetailsType"></xs:element>  
            <xs:element name="return"  type="getRoomsReturnType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getrooms"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <!--  ############################################################  -->  
    <xs:simpleType name="fieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="leftToSell"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
complexCondition_rooms.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://us.dotwconnect.com/xsd/complexCondition" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:notOperator="http://us.dotwconnect.com/xsd/notOperator" targetNamespace="http://us.dotwconnect.com/xsd/complexCondition">  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition" schemaLocation="atomicCondition.xsd"></xs:import>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/notOperator" schemaLocation="notOperator.xsd"></xs:import>  
    <xs:element name="condition">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:element ref="notOperator:operator" minOccurs="0"></xs:element>  
                <xs:choice>  
                    <xs:group ref="complexis"></xs:group>  
                    <xs:group ref="a:atomics"></xs:group>  
                </xs:choice>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <xs:group name="complexis">  
        <xs:sequence>  
            <xs:element ref="condition"></xs:element>  
            <xs:sequence minOccurs="0"  maxOccurs="unbounded">  
                <xs:element name="operator"  type="operatorType"></xs:element>  
                <xs:element ref="condition"></xs:element>  
            </xs:sequence>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="operatorType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="AND|OR"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
</xs:schema>  
atomicCondtion_rooms.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://us.dotwconnect.com/xsd/atomicCondition" targetNamespace="http://us.dotwconnect.com/xsd/atomicCondition">  
    <xs:element name="condition">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:element name="fieldName"  type="fieldNameType"></xs:element>  
                <xs:element name="fieldTest"  type="fieldTestType"></xs:element>  
                <xs:element name="fieldValues"  type="fieldValuesType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:simpleType name="fieldNameType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="hotelId"></xs:enumeration>  
            <xs:enumeration value="price"></xs:enumeration>  
            <xs:enumeration value="preferred"></xs:enumeration>  
            <xs:enumeration value="onRequest"></xs:enumeration>  
            <xs:enumeration value="rating"></xs:enumeration>  
            <xs:enumeration value="luxury"></xs:enumeration>  
            <xs:enumeration value="topDeals"></xs:enumeration>  
            <xs:enumeration value="specialDeals"></xs:enumeration>  
            <xs:enumeration value="location"></xs:enumeration>  
            <xs:enumeration value="locationId"></xs:enumeration>  
            <xs:enumeration value="amenitie"></xs:enumeration>  
            <xs:enumeration value="leisure"></xs:enumeration>  
            <xs:enumeration value="business"></xs:enumeration>  
            <xs:enumeration value="hotelPreference"></xs:enumeration>  
            <xs:enumeration value="chain"></xs:enumeration>  
            <xs:enumeration value="attraction"></xs:enumeration>  
            <xs:enumeration value="hotelName"></xs:enumeration>  
            <xs:enumeration value="builtYear"></xs:enumeration>  
            <xs:enumeration value="renovationYear"></xs:enumeration>  
            <xs:enumeration value="floors"></xs:enumeration>  
            <xs:enumeration value="noOfRooms"></xs:enumeration>  
            <xs:enumeration value="fireSafety"></xs:enumeration>  
            <xs:enumeration value="roomOnRequest"></xs:enumeration>  
            <xs:enumeration value="lastUpdated"></xs:enumeration>  
            <xs:enumeration value="roomPrice"></xs:enumeration>  
            <xs:enumeration value="suite"></xs:enumeration>  
            <xs:enumeration value="roomAmentie"></xs:enumeration>  
            <xs:enumeration value="roomId"></xs:enumeration>  
            <xs:enumeration value="roomRateBasis"></xs:enumeration>  
            <xs:enumeration value="roomName"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="fieldTestType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="equals"></xs:enumeration>  
            <xs:enumeration value="in"></xs:enumeration>  
            <xs:enumeration value="notin"></xs:enumeration>  
            <xs:enumeration value="between"></xs:enumeration>  
            <xs:enumeration value="regex"></xs:enumeration>  
            <xs:enumeration value="like"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="fieldValuesType">  
        <xs:sequence>  
            <xs:element name="fieldValue"  type="xs:string"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="fieldValueType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{1,5}|true|false"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:group name="atomics">  
        <xs:sequence>  
            <xs:element ref="condition"></xs:element>  
            <xs:sequence minOccurs="0"  maxOccurs="unbounded">  
                <xs:element name="operator"  type="xs:string"></xs:element>  
                <xs:element ref="condition"></xs:element>  
            </xs:sequence>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="roomFieldNameType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="roomOnRequest"></xs:enumeration>  
            <xs:enumeration value="roomPrice"></xs:enumeration>  
            <xs:enumeration value="suite"></xs:enumeration>  
            <xs:enumeration value="roomAmentie"></xs:enumeration>  
            <xs:enumeration value="roomId"></xs:enumeration>  
            <xs:enumeration value="roomRateBasis"></xs:enumeration>  
            <xs:enumeration value="roomName"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
notOperator.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://us.dotwconnect.com/xsd/notOperator" targetNamespace="http://us.dotwconnect.com/xsd/notOperator">  
    <xs:element name="operator">  
        <xs:simpleType>  
            <xs:restriction base="xs:string">  
                <xs:pattern value="NOT"></xs:pattern>  
            </xs:restriction>  
        </xs:simpleType>  
    </xs:element>  
</xs:schema>  
General Response
V4 also allows multiple rates with the same meal plan to be returned for the same roomTypeCode. The difference between them could be the cancellation policy and/or price. This new feature allows the user to select the most suitable combination between price and flexibility.

Another new feature introduces multiple bedding and occupancy combinations that can suit variable passenger needs.

For example, a search for 2 adults + 1 children, could return multiple rates like a rate for the child sharing the bed with the adults and a second rate with an extra bed for the child.

 

<result command="getrooms" date="" ip="">  
    <currencyShort></currencyShort>  
    <hotel id="" name=" ">  
        <allowBook></allowBook>  
        <rooms count="">  
            <room adults="" children="" childrenages="" count="" extrabed="" runno="">  
                <roomType roomtypecode="" runno="">  
                    <name></name>  
                    <roomInfo>  
                        <maxOccupancy></maxOccupancy>  
                        <maxAdults></maxAdults>  
                        <maxExtraBed></maxExtraBed>  
                        <maxChildren></maxChildren>  
                    </roomInfo>  
                    <specials count="">  
                        <special runno="">  
                            < type></ type>  
                            <specialName></specialName>  
                            <upgradeToRoomId></upgradeToRoomId>  
                            <upgradeToMealId></upgradeToMealId>  
                            <condition></condition>  
                            <description></description>  
                            <notes></notes>  
                            <stay></stay>  
                            <discount></discount>  
                            <discountedNights></discountedNights>  
                            <pay></pay>  
                        </special>  
                    </specials>  
                    <rateBases count="">  
                        <rateBasis description="" id="" runno="">  
                            <validForOccupancy></validForOccupancy>  
                            <adults></adults>  
                            <children></children>  
                            <childrenAges></childrenAges>  
                            <extraBed></extraBed>  
                            <extraBedOccupant></extraBedOccupant>  
                            <changedOccupancy></changedOccupancy>  
                            <status></status>  
                            <specialsApplied></specialsApplied>  
                            <special></special>  
                            <passengerNamesRequiredForBooking></passengerNamesRequiredForBooking>  
                            <rateType currencyid="" currencyshort="" description="" nonrefundable="" notes=""></rateType>  
                            <paymentMode></paymentMode>  
                            <allowsExtraMeals></allowsExtraMeals>  
                            <allowsSpecialRequests></allowsSpecialRequests>  
                            <allowsBeddingPreference></allowsBeddingPreference>  
                            <allocationDetails></allocationDetails>  
                            <minStay></minStay>  
                            <dateApplyMinStay></dateApplyMinStay>  
                            <cancellationRules count="">  
                                <rule runno="">  
                                    <fromDate></fromDate>  
                                    <fromDateDetails></fromDateDetails>  
                                    <toDate></toDate>  
                                    <toDateDetails></toDateDetails>  
                                    <amendRestricted></amendRestricted>  
                                    <cancelRestricted></cancelRestricted>  
                                    <noShowPolicy></noShowPolicy>  
                                    <amendCharge>  
                                        <formatted></formatted>  
                                    </amendCharge>  
                                    <cancelCharge>  
                                        <formatted></formatted>  
                                    </cancelCharge>  
                                    <charge>Cancellation Charge <formatted></formatted>  
</charge>  
                                </rule>  
                            </cancellationRules>  
                            <isBookable></isBookable>  
                            <onRequest></onRequest>  
                            <total> Total Price in Rate Currency <formatted></formatted>  
</total>  
                            <totalTaxes> Total Taxes Amount included in total Price in Rate Currency <formatted></formatted>  
</totalTaxes>  
                            <totalFee> Total Fee Amount included in total Price in Rate Currency <formatted></formatted>  
</totalFee>  
                            <propertyFees count="">  
                                <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">Fee amount in Rate Currency <formatted></formatted>  
</propertyFee>  
                            </propertyFees>  
                            <totalMinimumSelling> MSP in Rate Currency <formatted></formatted>  
</totalMinimumSelling>  
                            <totalInRequestedCurrency> Total in requested currency <formatted></formatted>  
</totalInRequestedCurrency>  
                            <totalMinimumSellingInRequestedCurrency> MSP in requested currency <formatted></formatted>  
</totalMinimumSellingInRequestedCurrency>  
                            <dates count="">  
                                <date datetime="" day="" runno=""  wday="">  
                                    <price>Price per day <formatted></formatted>  
</price>  
                                    <priceMinimumSelling> MSP Per Day <formatted></formatted>  
</priceMinimumSelling>  
                                    <priceInRequestedCurrency> Price per day in requested currency <formatted></formatted>  
</priceInRequestedCurrency>  
                                    <priceMinimumSellingInRequestedCurrency> MSP per day in requested currency <formatted></formatted>  
</priceMinimumSellingInRequestedCurrency>  
                                    <freeStay></freeStay>  
                                    <dayOnRequest></dayOnRequest>  
                                    <including count="">  
                                        <includedSupplement runno="">  
                                            <supplementName></supplementName>  
                                            <description></description>  
                                        </includedSupplement>  
                                        <includedMeal runno="">  
                                            <mealName></mealName>  
                                            <mealType></mealType>  
                                        </includedMeal>  
                                        <includedAdditionalService runno="">  
                                            <serviceId></serviceId>  
                                            <serviceName></serviceName>  
                                        </includedAdditionalService>  
                                    </including>  
                                </date>  
                            </dates>  
                        </rateBasis>  
                    </rateBases>  
                </roomType>  
                <from> Starting Price for the Room <formatted></formatted>  
</from>  
                <lookedForText></lookedForText>  
            </room>  
        </rooms>  
        <extraMeals>  
            <mealDate datetime="" day=""  wday="">  
                <mealType count="" mealtypecode="" mealtypename="">  
                    <meal applicablefor="" endage="" runno="" startage="">  
                        <mealCode></mealCode>  
                        <mealName></mealName>  
                        <mealPrice>Meal Rate <formatted></formatted>  
</mealPrice>  
                    </meal>  
                </mealType>  
            </mealDate>  
        </extraMeals>  
    </hotel>  
    <successful></successful>  
</result>  
 

Item	Type	Parent	Description
result	Element	root	The root element.
@command	Attribute	result	The request command which returned this result.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@ip	Attribute	result	The IPv4 address the request was made from.
currencyShort	Element	result	The 3 letter code which identify the currency in which the prices are provided.
hotel	Element	result	Groups information about the room types and allocation details of this hotel.
@id	Attribute	hotel	Internal code for the hotel.
@name	Attribute	hotel	Hotel name.
allowBook	Element	hotel	Specifies if the customer is allowed to make a booking for this hotel.
rooms	Element	hotel	Contains a room element for each room a customer wishes to book.
@count	Attribute	rooms	Specifies the total number of rooms.
room	Element	rooms	Encapsulates details about room types for the specified room occupancy.
@runno	Attribute	room	Specifies for which room number out of total passed rooms the room types are provided for. Please note that the running serial number starts from 0.
@count	Attribute	room	Total number of room types for this.
@adults	Attribute	room	Number of adults from the request or 2t for a twin room.
@children	Attribute	room	Number of children from the request.
@childrenages	Attribute	room	Child ages separated by comma. Empty if no children.
@extrabeds	Attribute	room	Number of extra beds.
roomType	Element	room	Encapsulates information about a room type.
@runno	Attribute	roomType	Running number starting from 0.
@roomtypecode	Attribute	roomType	Internal code for the room type.
name	Element	roomType	The room type name.
specials	Element	roomType	Encapsulates a list with all the special promotion like PAY - STAY offers that are applicable for this room type in the specified period.
@count	Attribute	specials	Total number of special promotions like PAY - STAY offers.
special	Element	specials	Contains information about one promotion.
@runno	Attribute	special	Running number starting from 0.
stay	Element	special	Number of staying nights in this promotion.
pay	Element	special	Number of paying nights in this promotion.
specialName	Element	special	Special promotion name.
roomInfo	Element	roomType	Encapsulates details about the maximum capacity of the room.
maxOccupancy	Element	roomType	Maximum number of guests for this room (adults children)
maxAdults	Element	roomInfo	Maximum number of adults that can book this room without any children.
maxExtraBed	Element	roomInfo	Specifies the maximum number of extra-beds that can be booked with this room type.
maxChildren	Element	roomInfo	Maximum number of children that can book this room.
specials	Element	roomType	Encapsulates a list with all the special promotion like PAY - STAY offers that are applicable for this room type in the specified period.
@count	Attribute	specials	Total number of special promotions like PAY - STAY offers.
special	Element	specials	Contains information about one promotion.
@runno	Attribute	special	Running number starting from 0.
type	Element	special	The type of promotion that is being applied
specialName	Element	special	Special promotion name.
upgradeToRoomId	Element	special	The roomTypeCode that is being upgraded to
upgradeToMealId	Element	special	The rateBasis code that is being upgraded to
condition	Element	special	Specifies fi there is a special condintion that has to be in act in order to qualify for the promotion
description	Element	special	Short description of the package
notes	Element	special	Additional notes regarding the promotion / package
stay	Element	special	Number of staying nights in this promotion.
discount	Element	special	Specifies the discount, in percentages, that is being applied for the discounted nights
discountedNights	Element	special	Number of discounted nights in the promotion
pay	Element	special	Number of paying nights in this promotion.
rateBases	Element	roomType	Groups details about room type by rate basis.
@count	Attribute	rateBases	Number of different rate bases for this room type.
rateBasis	Attribute	rateBases	Details about room type with this rate basis.
@runno	Attribute	rateBasis	Running serial number starting from 0.
@id	Attribute	rateBasis	Internal code for rate basis.
@attribute	Attribute	rateBasis	Rate Basis name. (eg. Room Only, Half Board)
validForOccupancy	Element	rateBasis	Container that encapsulates details regarding the bedding setting valid for the requested occupancy. If the room suports an extra bed the system will return a setting that will include one of the passengers in the extra bed. 
adults	Element	rateBasis	Number of adults that will be accomodated on the standard bedding
children	Element	rateBasis	Number of children that will be acoomodated in the room on standard bedding (excluding the extra bed)
childrenAges	Element	rateBasis	Ages of the children that will be accomodated in the room on standard bedding (excluding the extra bed)
extraBed	Element	rateBasis	Number of extra beds available for the room
extraBedOccupant	Element	rateBasis	Specifies what the occupant of the extra bed will be in the presented occupancy. Possible values:

adult
child

Please note that the passenger in the extra bed will not be returned in the adults or children elements returned in the rateBasis parent
changedOccupancy	Element	rateBasis	
Returns details regarding the occupancy of the room in an alternative combination. The element will return 4 parameters separated by comma:

The first parameter will indicate the number of adults that will be fitted on standard bedding;

The second parameter will indicate the number of children that will be accomodated in the standard bedding (sharing the beds with the adults);

The third parameter will return the ages of the children accomodated on the standard bedding; If more than one child the ages will be separated by "underscore" (_);

The forth parameter will indicate if there is an occupant for the extra bed. Possible values 0/1;

status	Element	rateBasis	Specifies if this room type is currently blocked by DOTWconnect server for you untill you complete the booking process. Possible values:
unchecked - the room type with this rate Basis is not blocked
checked - the room type with this rate Basis is blocked
Please note that you can not have more than one room type and rate basis blocked for each room you are attempting to book.
specialsApplied	Element	rateBasis	Container for details regarding the specials applied for the rateBasis
special	Element	specialsApplied	The number of special that are applicable for this particular rateBasis
passengerNamesRequiredForBooking	Element	rateBasis	If present, specifies how many passenger names are required for completing the booking. If missing, one leading passenger name is sufficient for the booking, the other passengers names being optional.
rateType	Element	rateBasis	Specifies the rate type. Possible values:
1 - DOTW rate type
2 - DYNAMIC DIRECT rate type
3 - DYNAMIC 3rd PARTY rate type
Please note that the blocking process guarantees the allotment (holds inventory) only for DOTW rate types. For the DYNAMIC rates, only the price is checked and guaranteed. Sending the blocking request is however mandatory for both rate types.
@currencyid	Attribute	rateType	Internal code of the currency in which the prices for this rate are provided.
ONLY For Non Refundable Advance Purchase Rates, this can be a different currency than the one requested. To see the prices in the requested currency you should look for the price elements which clearly specify InRequestedCurrency (totalInRequestedCurrency, totalMinimumSellingInRequestedCurrency, priceInRequestedCurrency, priceMinimumSellingInRequestedCurrency)
@currencyshort	Attribute	rateType	The 3 letter code which identifies the currency i which the rates are provided.
@description	Attribute	rateType	A short text description of the rate, indicating the type of rate (whether it is DOTW, Dynamic or 3rd party).
@nonrefundable	Attribute	rateType	If present, indicates that the rate is Non Refundable Advance Purchase.
Possible values:
yes
@notes	Attribute	rateType	If present, contains a free flow text with additional notes about the rate, mainly
paymentMode	Element	rateBasis	When present, indicates that for this rate, a special mode of payment is required. If the value is CC this means the rate requires a credit card prepayment. Possible values:
CC - Credit Card
To be able to book this type of rate it is mandatory for your application to use the savebooking and bookitinerary booking flow.
allowsExtraMeals	Element	rateBasis	If present, this element specifies if the parent rate basis can be booked with extra meals. Possible values:
true
false
allowsSpecialRequests	Element	rateBasis	If present, this element specifies if for this rate, special requests can be sent to the supplier. All of the special requests are subject to availability at check in. Possible values:
true
false
allowsBeddingPreferences	Element	rateBasis	Returns if the room has the option of selecting the bedding preferences (e.g. Queen Size Bed, Double, King Size...etc)
passengerNamesRequiredForBooking	Element	rateBasis	If present, specifies how many passenger names are required for completing the booking. If missing, one leading passenger name is sufficient for the booking, the other passengers names being optional.
allocationDetails	Element	rateBasis	Encrypted string containing information about the room type and rate basis. This encrypted string must be passed again in a getrooms request if you want to block this particular room type and rate basis.
Please note that you will have to pass this encrypted string again when you will make the request for booking.
minStay	Element	rateBasis	If the hotel has requested a minimum stay for this room type and rate basis then this element will be returned and its value will be the minimum stay required in days. If no minimum stay applies this element will be returned with no value (empty tag).
dateApplyMinStay	Element	rateBasis	If there is a minimum stay condition this element will specify the starting date when the minium stay condition applies. If no minimum stay applies this element will be returned with no value (empty tag).
cancellationRules	Element	rateBasis	Encapsulates details about the cancellation policy applicable for this room type and rate basis.
@count	Attribute	cancellationRules	Specifies the number of cancellation policies.
rule	Element	cancellationRules	Contains details about a specific cancellation policy.
@runno	Attribute	rule	Running serial number starting from 0.
fromDate	Element	rule	Starting date of the rule. From this day forward until toDate (if present), the specified charge will be applied for any cancellations or amendments. If this element is not present then the charge will be applied from the current date until toDate. Date format is: YYYY-MM-DD HH:MM:SS
fromDateDetails	Element	rule	From Date in Weekday Month Day, Year HH:MM:SS format.
toDate	Element	rule	Ending date of the rule. The specified charge will be applied for any cancellations or amendments until this date. If this element is not present then the charge from fromDate onwards. Date format is: YYYY-MM-DD HH:MM:SS
toDateDetails	Element	rule	To Date in Weekday Month Day, Year HH:MM:SS format.
amendRestricted	Element	rule	If present, this element indicates that a future amendment (using the updatebooking method) done in the time period defined by this rule, will not be possible. Fixed value:

TRUE
cancelRestricted	Element	rule	If present, this element indicates that a future cancel (using the cancelbooking or deleteitinerary methods) done in the time period defined by this rule, will not be possible. Fixed value:

TRUE
noShowPolicy	Element	rule	If present, this element indicates that the presented charge is a no show charge. Fixed value: TRUE
amendCharge	Element	rule	Amendment charge that will be applied if booking isamended in the period defined by this rule.
formatted	Element	amendCharge	Amendments charge formatted as per the customer preference (decimal places, thousand separator, decimal separator).
cancelCharge	Element	rule	Cancellation charge that will be applied if booking is canceled in the period defined by this rule.
formatted	Element	cancelCharge	Cancellation charge formatted as per the customer preference (decimal places, thousand separator, decimal separator).
charge	Element	rule	Charge that will be applied if booking is a no show.
formatted	Element	charge	No Show charge formatted as per the customer preference (decimal places, thousand separator, decimal separator).
withinCancellationDeadline	Element	rateBasis	Specifies if the service (using this rate) is within cancellation deadline. Possible value:

yes - service is within cancellation deadline
no - service is not within cancellation deadline
tariffNotes	Element	rateBasis	Contains Rate Notes and Hotel Tariff Notes regarding any specific policy or information from the hotel. It is mandatory to display these notes for the customer to acknowledge.
isBookable	Element	rateBasis	Specifies if this room type and rate basis can be booked. Possible values:
yes
no
DOTWconnect system will return a value no for this element if you are attempting to book a room type within cancellation deadline.
onRequest	Element	rateBasis	Specifies if this room type and rate basis is on request. Possible values:
0 (the room type and rate basis is not on request)
1 (the room type and rate basis is on request)
total	Element	rateBasis	This element contains the total price for the room type and rate basis in two formats one without any formatting and the other one properly formatted. The price will be for the whole stay for this room type in the currency specified in the request.
formatted	Element	total	This element contains the total price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalTaxes	Element	rateBasis	If present, this element contains the total taxes that are included in total rate price in rate currency.
formatted	Element	totalTaxes	This element contains the total tax amount included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
@feeIncluded	Attribute	totalTaxes	If present and value is True, this attribute specifies that fee amount is included in total tax amount and totalFee element will not be present
totalFee	Element	rateBasis	If present, this element contains the total fee that is included in total rate price in rate currency.
formatted	Element	totalFee	This element contains the total fee included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the rate currency.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the rate currency.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
formatted	Element	propertyFee	This element contains the fee amount, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
totalMinimumSelling	Element	rateBasis	This element returns the minimum selling price the customer should adhere to while distributing the product (B2C platform). XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
formatted	Element	totalMinimumSelling	This element contains the total minimum selling price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalInRequestedCurrency	Element	rateBasis	This element is present only for Non Refundable Advance Rates and when the rateType/@currencyid is different from the requested currency. This element contains the total price for the room type and rate basis in two formats one without any formatting and the other one properly formatted. The price will be for the whole stay for this room type in the currency specified in the request.
formatted	Element	total InRequestedCurrency	This element contains the total price in the requested currency formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalMinimumSellingInRequestedCurrency	Element	rateBasis	This element is presented only for Non Refundable Advance Purchase rates and when the rateType/@currencyid is different from the requested currency. This element returns the minimum selling price the customer should adhere to while distributing the product (B2C platform). XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
formatted	Element	totalMinimumSelling InRequestedCurrency	This element contains the total minimum selling price in the requested currency formatted as per the customer preference (decimal places, thousand separator, decimal separator)
dates	Element	rateBasis	Encapsulates daily break down of the rates for this room type and rate Basis.
@count	Attribute	dates	Total number of days for the staying period. This may include any additional nights to be stayed for satisfying the minimum stay conditions.
date	Element	dates	Groups together information for one day.
@runno	Attribute	date	Running number starting from 0.
@day	Attribute	date	Day-of-the-week name Month, day-of-the-month, year.
@wday	Attribute	date	Weekday number (from 0 (Sun) - 6 (Sat)).
@datetime	Attribute	date	Date in YYYY-MM-DD HH:MM:SS format.
price	Element	date	This element contains the price for the day in two formats one without any formatting and the other one properly formatted.
formatted	Element	price	This element contains the price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
priceMinimumSelling	Element	date	If present, this element returns the minimum selling price (for this date) the customer should adhere to while distributing the product. XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity. This minimum selling price is returned in currency indicated in the rateType/@currencyid (the rateType/@currencyid is different from the requested only currency only if this is an Non Refundable Advance Purchase Rate)
formatted	Element	priceMinimumSelling	This element contains the minimum selling price (for this date) formatted as per the customer preference (decimal places, thousand separator, decimal separator)
priceInRequestedCurrency	Element	date	This element is present only for Non Refundable Advance Purchase Rates. This element contains the price in the requested currency for the day in two formats one without any formatting and the other one properly formatted.
formatted	Element	priceInRequestedCurrency	This element contains the price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
priceMinimumSelling InRequestedCurrency	Element	date	This element is present only for Non Refundable Advance Purchase Rates and when a MSP is imposed. If present, this element returns the minimum selling price in the requested currency (for this date) the customer should adhere to while distributing the product. XML customers must display the MSP as the price that is sold to their customers. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
formatted	Element	priceMinimumSelling InRequestedCurrency	This element contains the minimum selling price (for this date) formatted as per the customer preference (decimal places, thousand separator, decimal separator)
freeStay	Element	date	Specifies if this day is free - part of a STAY - PAY offer. Possible values:
yes
no
discount	Element	date	Specifies the discount, in percentages, that is being applied for the discounted nights
dayOnRequest	Element	date	Specifies if this the room type and rate basis is on request on this day. Possible values:
0 - this room type and rate basis has an allotment and rate.
1 - this room type and rate basis does not have allotment or rates defined.
including	Element	date	Encapsulates a list with all supplements, meals.
@count	Attribute	including	Total number of included Supplements or Meals
includedSupplement	Element	including	Details about a certain supplement included in the price for this day.
@runno	Attribute	includedSupplement	Running number starting from 0.
supplementName	Element	includedSupplement	Supplement name.
description	Element	includedSupplement	A short description about supplement.
includedMeal	Element	including	Details about a certain meal supplement included in the price for this day.
@runno	Attribute	includedMeal	Running number starting from 0.
mealName	Element	includedMeal	Meal name.  Possible values:
Breakfast
Lunch
Dinner
Half Board
Full Board
All Inclusive
mealType	Element	includedMeal	Meal type code. Possible numerical values:
1331 - Breakfast
1332 - Lunch
1333 - Dinner
1334 - Half Board
1335 - Full Board
1336 - All Inclusive
freeUpgrade	Element	including	If a free upgrade promotion is applicable this element will return the name of the upgraded meal type
@code	Attribute	freeUpgrade	The code of the upgraded meal type
includedAdditionalService	Element	including	Details about a certain additional service that is included.
serviceId	Element	includedAdditionalService	Internal id for this service. This needs to be passed in the confirm booking request along with any additional information required by the hotel. To get the additional information required by the hotel for this additional service, please use the getadditionalserviceinfo request.
serviceName	Element	includedAdditionalService	Service Name
from	Element	room	The starting price for this room. This will be the cheapest price for any room type on any day. The price will be returned in two formats one without any formatting and the other one properly formatted.
formatted	Element	from	Starting price formatted as per the customer preference (decimal places, thousand separator, decimal separator).
leftToSell	Element	rateBasis	
For FIT & CM rate this element returns the number of rooms available besides the one returned. (e.g. if returned on 0 there is no other room available besides the returned one, if returned on 1 there is only one room available besides the returned one...etc). For the instances when this element is populated with value 9999, then the room can be consumed without a limitation in this sense.

For rates from our 3rd party suppliers this element will allways be retuned as populated with a default value 1.

lookedForText	Element	room	A text displaying room occupancy for each room searched.
extraMeals	Element	hotel	Encapsulates information about extra meals provided by the hotel grouped by the date.
mealDate	Element	extraMeals	Contains details about extra meals provided by the hotel on a specific date grouped by meal types.
@wday	Attribute	mealDate	Weekday name (e.g. Monday).
@day	Attribute	mealDate	Month, day-of-the-month, year.
@datetime	Attribute	mealDate	Date in YYYY-MM-DD HH:MM:SS format.
mealType	Element	mealDate	Contains information about each meal in a certain category(type) e.g. Breakfast, Lunch.
@mealtypename	Attribute	mealType	Meal Type Name.
@mealtypecode	Attribute	mealType	Meal Type Internal Code.
@count	Attribute	mealType	Specifies the total number of meal types.
meal	Element	mealType	Groups together details of one specific meal
@runno	Attribute	meal	Running Number starting from 0.
@applicablefor	Attribute	meal	Specifies if this meal (and its price) is applicable for adults or children. Possible values:
adult
child
@startage	Attribute	meal	If @applicablefor is child this attribute will indicate from what age this meal is applicable
@endage	Attribute	meal	If @applicablefor is child this attribute will indicate upto what age this meal is applicable
mealCode	Element	meal	Internal Code for the Meal
mealName	Element	meal	Name of the Meal
mealPrice	Element	meal	Meal price.
formatted	Element	meal	This element contains the meal price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
successful	Element	result	Specifies if the request was successful. Possible values:
yes
no
 

getrooms_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="currencyShort"  type="currencyShortType"></xs:element>  
            <xs:element name="hotel"  type="hotelRoomsType"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getrooms"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="oneOrZero">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="1|0"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no|Yes|No"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="statusType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="checked|unchecked"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="servicePriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="serviceTaxPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="feeIncluded"  type="trueOrFalse"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeesType">  
        <xs:sequence>  
            <xs:element name="propertyFee"  type="propertyFeeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeeType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="currencyshort"  type="currencyShortType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="includedinprice"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="maxAdultWithChildrenType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="hotelRoomsType">  
        <xs:all>  
            <xs:element name="allowBook"  type="yesOrNo"></xs:element>  
            <xs:element name="rooms"  type="roomsType"></xs:element>  
            <xs:element name="extraMeals"  type="extraMealsType" minOccurs="0"></xs:element>  
        </xs:all>  
        <xs:attribute name="id"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="roomType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomType">  
        <xs:sequence>  
            <xs:element name="roomType"  type="roomTypeType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
            <xs:element name="from"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="lookedForText"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="adults"  type="adultsCodeType" use="required"></xs:attribute>  
        <xs:attribute name="children"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="childrenages"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="extrabeds"  type="oneOrZero" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomTypeType">  
        <xs:all>  
            <xs:element name="name"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="twin"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="roomInfo"  type="roomInfoType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="specials"  type="specialsType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="rateBases"  type="rateBasesType" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="roomtypecode"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="extraBedType">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="1|0"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="roomInfoType">  
        <xs:sequence>  
            <xs:element name="maxOccupancy"  type="adultsCodeType"></xs:element>  
            <xs:element name="maxAdultWithChildren"  type="maxAdultWithChildrenType"></xs:element>  
            <xs:element name="minChildAge"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="maxChildAge"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="maxAdult"  type="adultsCodeType"></xs:element>  
            <xs:element name="maxExtraBed"  type="extraBedType"></xs:element>  
            <xs:element name="maxChildren"  type="xs:nonNegativeInteger"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="specialsType">  
        <xs:sequence>  
            <xs:element name="special"  type="specialType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="specialsAppliedType">  
        <xs:sequence>  
            <xs:element name="special"  type="xs:unsignedInt" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="validForOccupancyType">  
        <xs:sequence>  
            <xs:element name="adults"  type="adultsCodeType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="extraBed"  type="extraBedType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="extraBedOccupant"  type="applicableforType" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="changedOccupancyType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{1,2},[0-9]{1,2},[0-9_]*,[01]+"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:group name="promotionAnniversaryType">  
        <xs:sequence>  
            <xs:element name="condition"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="description"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="notes"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="promotionFreeUpgradeType">  
        <xs:sequence>  
            <xs:element name="upgradeToRoomId"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="description"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="promotionFreeMealUpgradeType">  
        <xs:sequence>  
            <xs:element name="upgradeToMealId"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="description"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="promotionStayXpayYType">  
        <xs:sequence>  
            <xs:element name="stay"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="pay"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="promotionStayXgetDiscountType">  
        <xs:sequence>  
            <xs:element name="discount"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="stay"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:group name="promotionDiscountSubsequentNightsType">  
        <xs:sequence>  
            <xs:element name="discountedNights"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="stay"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="discount"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:complexType name="specialType">  
        <xs:sequence>  
            <xs:element name="type"  type="xs:string"></xs:element>  
            <xs:element name="specialName"  type="xs:string"></xs:element>  
            <xs:group ref="promotionAnniversaryType" minOccurs="0"></xs:group>  
            <xs:group ref="promotionFreeUpgradeType" minOccurs="0"></xs:group>  
            <xs:group ref="promotionFreeMealUpgradeType" minOccurs="0"></xs:group>  
            <xs:group ref="promotionStayXpayYType" minOccurs="0"></xs:group>  
            <xs:group ref="promotionStayXgetDiscountType" minOccurs="0"></xs:group>  
            <xs:group ref="promotionDiscountSubsequentNightsType" minOccurs="0"></xs:group>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBookingCurrencyType">  
        <xs:simpleContent>  
            <xs:extension base="currencyShortType">  
                <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="rateBasesType">  
        <xs:sequence>  
            <xs:element name="rateBasis"  type="rateBasisType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBasisType">  
        <xs:all>  
            <xs:element name="validForOccupancy"  type="validForOccupancyType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="changedOccupancy"  type="changedOccupancyType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="status"  type="statusType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="specialsApplied"  type="specialsAppliedType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="passengerNamesRequiredForBooking"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="rateType"  type="rateTypeType"></xs:element>  
            <xs:element name="rateBookingCurrency"  type="rateBookingCurrencyType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="paymentMode"  type="paymentModeType" minOccurs="0"></xs:element>  
            <xs:element name="allowsExtraMeals"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="allowsSpecialRequests"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="allowsSpecials"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="allowsBeddingPreference"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="minStay"  type="minStayType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="dateApplyMinStay"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="cancellationRules"  type="cancellationRulesType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="withinCancellationDeadline"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="tariffNotes"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="packageRemarks"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="isBookable"  type="yesOrNo" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="onRequest"  type="oneOrZero" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="extraBedOnRequest"  type="oneOrZero" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="total"  type="servicePriceType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="totalTaxes"  type="serviceTaxPriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="totalFee"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="totalMinimumSelling"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="totalInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="totalMinimumSellingInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="dates"  type="datesType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="leftToSell"  type="leftToSellType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateTypeType">  
        <xs:simpleContent>  
            <xs:extension base="rateTypeRestriction">  
                <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="optional"></xs:attribute>  
                <xs:attribute name="currencyshort"  type="currencyShortType" use="optional"></xs:attribute>  
                <xs:attribute name="description"  type="xs:string" use="optional"></xs:attribute>  
                <xs:attribute name="nonrefundable"  type="xs:string"  fixed="yes" use="optional"></xs:attribute>  
                <xs:attribute name="notes"  type="xs:string" use="optional"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:simpleType name="paymentModeType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="CC"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="leftToSellType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="minStayType">  
        <xs:union memberTypes="empty xs:nonNegativeInteger"></xs:union>  
    </xs:simpleType>  
    <xs:simpleType name="rateTypeRestriction">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="empty">  
        <xs:restriction base="xs:string">  
            <xs:maxLength value="0"></xs:maxLength>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="cancellationRulesType">  
        <xs:sequence>  
            <xs:element name="rule"  type="ruleType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="ruleType">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="fromDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="amendRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="cancelRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="noShowPolicy"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="amendCharge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="cancelCharge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="charge"  type="servicePriceType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="datesType">  
        <xs:sequence>  
            <xs:element name="date"  type="dateType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="dateType">  
        <xs:all>  
            <xs:element name="price"  type="servicePriceType"></xs:element>  
            <xs:element name="priceMinimumSelling"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="priceInRequestedCurrency"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="priceMinimumSellingInRequestedCurrency"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="freeStay"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="discount"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="dayOnRequest"  type="oneOrZero" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="dayExtraBedOnRequest"  type="oneOrZero" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="including"  type="includingType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includingType">  
        <xs:all>  
            <xs:element name="includedSupplement"  type="includedSupplementType" minOccurs="0"></xs:element>  
            <xs:element name="includedMeal"  type="includedMealType" minOccurs="0"></xs:element>  
            <xs:element name="includedAdditionalService"  type="includedAdditionalServiceType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedSupplementType">  
        <xs:sequence>  
            <xs:element name="supplementName"  type="xs:string"></xs:element>  
            <xs:element name="description"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedAdditionalServiceType">  
        <xs:sequence>  
            <xs:element name="serviceId"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="serviceName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedMealType">  
        <xs:sequence>  
            <xs:element name="mealName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="mealType" minOccurs="0"  maxOccurs="1">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
            <xs:element name="freeUpgrade" minOccurs="0"  maxOccurs="1">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="extraMealsType">  
        <xs:sequence>  
            <xs:element name="mealDate"  type="mealDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealDateType">  
        <xs:sequence>  
            <xs:element name="mealType"  type="mealTypeType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="wdayType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="wdayType">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="[0-6]{1}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="mealTypeType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealComplexType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealtypename"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="mealtypecode"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealComplexType">  
        <xs:sequence>  
            <xs:element name="mealCode"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="mealName"  type="xs:string"></xs:element>  
            <xs:element name="mealPrice"  type="servicePriceType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableforType" use="required"></xs:attribute>  
        <xs:attribute name="startage"  type="xs:unsignedShort"></xs:attribute>  
        <xs:attribute name="endage"  type="xs:unsignedShort"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="applicableforType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="adult|child"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="selectedExtraMealsType">  
        <xs:sequence>  
            <xs:element name="mealPlanDate"  type="mealPlanDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="mealPlanDateType">  
        <xs:sequence>  
            <xs:element name="mealPlan"  type="mealPlanType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealplandatetime"  type="xs:date" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealPlanType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="mealscount"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableforType" use="required"></xs:attribute>  
        <xs:attribute name="childage"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="ispassenger"  type="xs:integer"  fixed="1"></xs:attribute>  
        <xs:attribute name="passengernumber"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="units"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="mealTypeCode"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="mealPrice"  type="servicePriceType"></xs:element>  
            <xs:element name="mealTypeName"  type="xs:string"></xs:element>  
            <xs:element name="mealName"  type="xs:string"></xs:element>  
            <xs:element name="bookedMealCode"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Scenario H3
After getting the response back for Scenario H1, the Customer now want to receive the details of each room type for the hotel he intends to book.
The inputs to be provided to the system are
Checkin Date:	01 January 2016
Checkout Date:	02 January 2016
Number of Rooms:	1 Double Room, Best Available Rate Basis
1 Double Room with 1 Child aged 6, Best Available Rate Basis
PAX Nationality:	Romanian
PAX Country Of Residence:	Italy
DOTWconnect Hotel Code:	30844 (Received in searchhotels request)
 

The DOTWconnect internal Hotel Code can be obtained using the method searchhotels.
The following will be the request and response XMLs that will be passed and received from DOTWconnect system for the above scenario.

Request XML format
<p>  
    <customer>  
        <username></username>  
        <password></password>  
        <id></id>  
        <source>1</source>  
        <product>hotel</product>  
        <request command="getrooms">  
            <bookingDetails>  
                <fromDate>1451606400</fromDate>  
                <toDate>1451692800</toDate>  
                <currency>520</currency>  
                <rooms no="2">  
                    <room runno="0">  
                        <adultsCode>2</adultsCode>  
                        <children no="0"></children>  
                        <rateBasis>-1</rateBasis>  
                        <passengerNationality>81</passengerNationality>  
                        <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                    </room>  
                    <room runno="1">  
                        <adultsCode>2</adultsCode>  
                        <children no="1">  
                            <child runno="0">6</child>  
                        </children>  
                        <rateBasis>-1</rateBasis>  
                        <passengerNationality>81</passengerNationality>  
                        <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                    </room>  
                </rooms>  
                <productId>30844</productId>  
            </bookingDetails>  
        </request>  
    </customer>  
</p>  
Response XML format
<p>  
    <result command="getrooms" tID="1424784539000003" ip="127.0.0.1" date="2015-02-24 13:29:02" version="2.0" elapsedTime="2.4466769695282">  
        <currencyShort>USD</currencyShort>  
        <hotel id="30844" name="HYATT REGENCY DUBAI">  
            <allowBook>yes</allowBook>  
            <rooms count="2">  
                <room runno="0" count="2" adults="2" children="0" childrenages="" extrabeds="0">  
                    <roomType runno="0" roomtypecode="6945328">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>KING ROOM 1</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00</toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01</fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00</toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01</fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY KING ROOM 1 king bed: floors 4-12: 34sq m/366 sq ft: gulf view:marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <roomType runno="1" roomtypecode="6945338">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>TWIN ROOM 2</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY TWIN ROOM 2 twin beds: floors 4-12: 34 sq m: gulf view marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <lookedForText>Room Number 1: 2 adult/s</lookedForText>  
                </room>  
                <room runno="1" count="2" adults="2" children="1" childrenages="6" extrabeds="0">  
                    <roomType runno="0" roomtypecode="6945328">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>KING ROOM 1</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY KING ROOM 1 king bed: floors 4-12: 34sq m/366 sq ft: gulf view:marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <roomType runno="1" roomtypecode="6945338">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>TWIN ROOM 2</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY TWIN ROOM 2 twin beds: floors 4-12: 34 sq m: gulf view marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <lookedForText>Room Number 2: 2 adult/s and 1 child</lookedForText>  
                </room>  
            </rooms>  
            <extraMeals count="1">  
                <mealDate runno="0"  wday="5" day="Fri Jan 01, 2016" datetime="2016-01-01">  
                    <mealType mealtypename="Half Board" mealtypecode="1334">  
                        <meal runno="0" applicablefor="adult">  
                            <mealCode>561215</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>34.0321 <formatted>34.03</formatted>  
</mealPrice>  
                        </meal>  
                        <meal runno="1" applicablefor="child" startage="6" endage="11">  
                            <mealCode>561225</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>17.1522 <formatted>17.15</formatted>  
</mealPrice>  
                        </meal>  
                    </mealType>  
                </mealDate>  
                <mealDate runno="1"  wday="6" day="Sat Jan 02, 2016" datetime="2016-01-02">  
                    <mealType mealtypename="Half Board" mealtypecode="1334">  
                        <meal runno="0" applicablefor="adult">  
                            <mealCode>561215</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>34.0321 <formatted>34.03</formatted>  
</mealPrice>  
                        </meal>  
                        <meal runno="1" applicablefor="child" startage="6" endage="11">  
                            <mealCode>561225</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>17.1522 <formatted>17.15</formatted>  
</mealPrice>  
                        </meal>  
                    </mealType>  
                </mealDate>  
            </extraMeals>  
        </hotel>  
        <successful>TRUE</successful>  
    </result>  
</p>  
Scenario H4
After receiving all Room Types for each of the rooms he likes to book, the customer can now send a request to the system to block the specific Room Types for each room.

Please make sure that the allocation details are sent correctly.
The allocation details string returned in the getRooms simple response have to be passed in the getRooms with blocking step request for the selected room.
In the confirmBooking request the application has to pass the allocation details string returned by the getRooms with blocking step response with the  status checked.

In cases when in the getRooms with block response we either return an error or we return one or more of the selected rooms with unchecked you have to please abort the booking (we recommend informing the user that the room/s is/are no longer available and restart the booking flow) and please do not send the confirmBooking request.

Request XML format
<p>  
    <customer>  
        <username></username>  
        <password></password>  
        <id></id>  
        <source>1</source>  
        <product>hotel</product>  
        <request command="getrooms">  
            <bookingDetails>  
                <fromDate>1451606400</fromDate>  
                <toDate>1451692800</toDate>  
                <currency>520</currency>  
                <rooms no="2">  
                    <room runno="0">  
                        <adultsCode>2</adultsCode>  
                        <children no="0"></children>  
                        <rateBasis>-1</rateBasis>  
                        <passengerNationality>81</passengerNationality>  
                        <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                        <roomTypeSelected>  
                            <code>6945328</code>  
                            <selectedRateBasis>0</selectedRateBasis>  
                            <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                        </roomTypeSelected>  
                    </room>  
                    <room runno="1">  
                        <adultsCode>2</adultsCode>  
                        <children no="1">  
                            <child runno="0">6</child>  
                        </children>  
                        <rateBasis>-1</rateBasis>  
                        <passengerNationality>81</passengerNationality>  
                        <passengerCountryOfResidence>72</passengerCountryOfResidence>  
                        <roomTypeSelected>  
                            <code>6945338</code>  
                            <selectedRateBasis>0</selectedRateBasis>  
                            <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                        </roomTypeSelected>  
                    </room>  
                </rooms>  
                <productId>30844</productId>  
            </bookingDetails>  
        </request>  
    </customer>  
</p>  
In this case we managed to successfully block both selected rooms (both rooms were returned with <status>checked</status>).

Response XML format
<p>  
    <result command="getrooms" tID="1424785291000003" ip="127.0.0.1" date="2015-02-24 13:41:34" version="2.0" elapsedTime="2.289393901825">  
        <currencyShort>USD</currencyShort>  
        <hotel id="30844" name="HYATT REGENCY DUBAI">  
            <allowBook>yes</allowBook>  
            <rooms count="2">  
                <room runno="0" count="6" adults="2" children="0" childrenages="" extrabeds="0">  
                    <roomType runno="0" roomtypecode="6945328">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>KING ROOM 1</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>checked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00</toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01</fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00</toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01</fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY KING ROOM 1 king bed: floors 4-12: 34sq m/366 sq ft: gulf view:marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <roomType runno="1" roomtypecode="6945338">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>TWIN ROOM 2</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY TWIN ROOM 2 twin beds: floors 4-12: 34 sq m: gulf view marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <roomType runno="4" roomtypecode="5220965">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>CLUB TWIN 2</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTc3MTIwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj I2Mi4wNzY5NjYyNDA4Njk1MjM5NzE5MjM2MjY5NTkzMjM4ODMwNTY2NDA2MjU7czoxMDoicHJpY2VWYWx1ZSI7ZDoy NjIuMDc2OTY2MjQwODY5NTIzOTcxOTIzNjI2OTU5MzIzODgzMDU2NjQwNjI1O3M6OToiZm9ybWF0dGVkIjtOO3M6MT M6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtzOjE5OiJt aW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRG F0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7aTozMDA7 czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2 FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJh cnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZC ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>262.077 <formatted>262.08</formatted>  
</amendCharge>  
                                        <cancelCharge>262.077 <formatted>262.08</formatted>  
</cancelCharge>  
                                        <charge>262.077 <formatted>262.08</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY CLUB TWIN 2 twin beds: floors 16-17: 34 sq m: gulf view Regency Club: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>262.077 <formatted>262.08</formatted>  
</total>  
                                <totalMinimumSelling>295 <formatted>295.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>262.077 <formatted>262.08</formatted>  
</price>  
                                        <priceMinimumSelling>295 <formatted>295.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <lookedForText>Room Number 1: 2 adult/s</lookedForText>  
                </room>  
                <room runno="1" count="6" adults="2" children="1" childrenages="6" extrabeds="0">  
                    <roomType runno="0" roomtypecode="6945328">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>KING ROOM 1</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>unchecked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY KING ROOM 1 king bed: floors 4-12: 34sq m/366 sq ft: gulf view:marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <roomType runno="1" roomtypecode="6945338">  
                        <roomAmenities count="0"></roomAmenities>  
                        <name>TWIN ROOM 2</name>  
                        <twin>no</twin>  
                        <roomInfo>  
                            <maxOccupancy>4</maxOccupancy>  
                            <maxAdult>4</maxAdult>  
                            <maxExtraBed>0</maxExtraBed>  
                            <maxChildren>0</maxChildren>  
                        </roomInfo>  
                        <specials count="0"></specials>  
                        <rateBases count="1">  
                            <rateBasis runno="0" id="0" description="Room Only">  
                                <status>checked</status>  
                                <passengerNamesRequiredForBooking>1</passengerNamesRequiredForBooking>  
                                <rateType currencyid="520" currencyshort="USD" description="Dynamic">2</rateType>  
                                <allowsExtraMeals>false</allowsExtraMeals>  
                                <allowsSpecialRequests>false</allowsSpecialRequests>  
                                <allowsBeddingPreference>false</allowsBeddingPreference>  
                                <allocationDetails>YTo1OntzOjM6InNpZCI7aToxMDExO3M6NDoic2Jp I7czoxOiJuIjtpOjE7czozOiJzY2EiO2E6OTp7czoyOiJjYyI7czozOiIzNjYiO3M6MjoidHIiO2k6MTE4MDgwMDtz OjI6InJjIjtzOjQ6IklQUkkiO3M6MzoiY2ljIjtzOjc6IkNSOTU5MjciO3M6MzoicnBjIjtzOjQ6IklQUkkiO3M6Nj oiY3J1bGVzIjthOjM6e2k6MDtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7TjtzOjY6 InRvRGF0ZSI7czoxOToiMjAxNS0xMi0yOSAyMjowMDowMCI7czo4OiJ0aW1lem9uZSI7aTozMDA7czoxODoicmV0dX JuZWRCeVN1cHBsaWVyIjtiOjA7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047czoxNDoiY2FuY2VsUG9zc2li bGUiO2I6MTtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjE7czo2OiJub1Nob3ciO2I6MDtzOjE3OiJhcnJBZGRpdGlvbm FsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdWVBbWVuZCI7aTowO3M6MTA6 InByaWNlVmFsdWUiO2k6MDtzOjk6ImZvcm1hdHRlZCI7TjtzOjEzOiJwcmljZUN1cnJlbmN5IjtzOjM6IjUyMCI7cz oyMToicHJpY2VJbmNsdWRlc0FsbFRheGVzIjtiOjE7czoxOToibWluaW11bVNlbGxpbmdQcmljZSI7aTowO31pOjE7 TzoxNjoiQ2FuY2VsbGF0aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO3M6MTk6IjIwMTUtMTItMjkgMjI6MDA6MD EiO3M6NjoidG9EYXRlIjtzOjE5OiIyMDE1LTEyLTMxIDAyOjAwOjAwIjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4 OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2I6MTtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZW xQb3NzaWJsZSI7YjoxO3M6MTM6ImFtZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFk ZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtkOj E3NC43MTc5Nzc0OTM5MTMwMjU0NTUxODU1NjE0NDA4ODUwNjY5ODYwODM5ODQzNzU7czoxMDoicHJpY2VWYWx1ZSI7 ZDoxNzQuNzE3OTc3NDkzOTEzMDI1NDU1MTg1NTYxNDQwODg1MDY2OTg2MDgzOTg0Mzc1O3M6OToiZm9ybWF0dGVkIj tOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZGVzQWxsVGF4ZXMiO2I6MTtz OjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MjtPOjE2OiJDYW5jZWxsYXRpb25SdWxlIjoxNjp7czo4Oi Jmcm9tRGF0ZSI7czoxOToiMjAxNS0xMi0zMSAwMjowMDowMSI7czo2OiJ0b0RhdGUiO047czo4OiJ0aW1lem9uZSI7 aTozMDA7czoxODoicmV0dXJuZWRCeVN1cHBsaWVyIjtiOjE7czoyMDoiY2FuY2VsbGF0aW9uUnVsZVRleHQiO047cz oxNDoiY2FuY2VsUG9zc2libGUiO2I6MDtzOjEzOiJhbWVuZFBvc3NpYmxlIjtiOjA7czo2OiJub1Nob3ciO2I6MDtz OjE3OiJhcnJBZGRpdGlvbmFsSW5mbyI7TjtzOjE2OiJvYmpQcmljZUN1c3RvbWVyIjtOO3M6MTU6InByaWNlVmFsdW ==</allocationDetails>  
                                <minStay></minStay>  
                                <dateApplyMinStay></dateApplyMinStay>  
                                <cancellationRules count="3">  
                                    <rule runno="0">  
                                        <toDate>2015-12-29 22:00:00</toDate>  
                                        <toDateDetails>Tue Dec 29, 2015 22:00:00 </toDateDetails>  
                                        <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                        <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                        <charge>0 <formatted>0.00</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="1">  
                                        <fromDate>2015-12-29 22:00:01</fromDate>  
                                        <fromDateDetails>Tue Dec 29, 2015 22:00:01 </fromDateDetails>  
                                        <toDate>2015-12-31 02:00:00</toDate>  
                                        <toDateDetails>Thu Dec 31, 2015 02:00:00 </toDateDetails>  
                                        <amendCharge>174.718 <formatted>174.72</formatted>  
</amendCharge>  
                                        <cancelCharge>174.718 <formatted>174.72</formatted>  
</cancelCharge>  
                                        <charge>174.718 <formatted>174.72</formatted>  
</charge>  
                                    </rule>  
                                    <rule runno="2">  
                                        <fromDate>2015-12-31 02:00:01</fromDate>  
                                        <fromDateDetails>Thu Dec 31, 2015 02:00:01 </fromDateDetails>  
                                        <amendRestricted>true</amendRestricted>  
                                        <cancelRestricted>true</cancelRestricted>  
                                    </rule>  
                                </cancellationRules>  
                                <withinCancellationDeadline>no</withinCancellationDeadline>  
                                <tariffNotes>DOTW HOTEL ONLY TWIN ROOM 2 twin beds: floors 4-12: 34 sq m: gulf view marble bath: dataport</tariffNotes>  
                                <isBookable>yes</isBookable>  
                                <onRequest>0</onRequest>  
                                <total>174.718 <formatted>174.72</formatted>  
</total>  
                                <totalMinimumSelling>197 <formatted>197.00</formatted>  
</totalMinimumSelling>  
                                <dates count="1">  
                                    <date runno="0" datetime="2016-01-01" day="Jan, 01 2016"  wday="Friday">  
                                        <price>174.718 <formatted>174.72</formatted>  
</price>  
                                        <priceMinimumSelling>197 <formatted>197.00</formatted>  
</priceMinimumSelling>  
                                        <freeStay>no</freeStay>  
                                        <dayOnRequest>0</dayOnRequest>  
                                        <including count="0"></including>  
                                    </date>  
                                </dates>  
                                <leftToSell>1</leftToSell>  
                            </rateBasis>  
                        </rateBases>  
                    </roomType>  
                    <lookedForText>Room Number 2: 2 adult/s and 1 child</lookedForText>  
                </room>  
            </rooms>  
            <extraMeals count="1">  
                <mealDate runno="0"  wday="5" day="Fri Jan 01, 2016" datetime="2016-01-01">  
                    <mealType mealtypename="Half Board" mealtypecode="1334">  
                        <meal runno="0" applicablefor="adult">  
                            <mealCode>561215</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>34.0321 <formatted>34.03</formatted>  
</mealPrice>  
                        </meal>  
                        <meal runno="1" applicablefor="child" startage="6" endage="11">  
                            <mealCode>561225</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>17.1522 <formatted>17.15</formatted>  
</mealPrice>  
                        </meal>  
                    </mealType>  
                </mealDate>  
                <mealDate runno="1"  wday="6" day="Sat Jan 02, 2016" datetime="2016-01-02">  
                    <mealType mealtypename="Half Board" mealtypecode="1334">  
                        <meal runno="0" applicablefor="adult">  
                            <mealCode>561215</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>34.0321 <formatted>34.03</formatted>  
</mealPrice>  
                        </meal>  
                        <meal runno="1" applicablefor="child" startage="6" endage="11">  
                            <mealCode>561225</mealCode>  
                            <mealName>LUNCH OR DINNER (HLF2B)</mealName>  
                            <mealPrice>17.1522 <formatted>17.15</formatted>  
</mealPrice>  
                        </meal>  
                    </mealType>  
                </mealDate>  
            </extraMeals>  
        </hotel>  
        <successful>TRUE</successful>  
    </result>  
</p>  
Save Booking
General Request
DOTWconnect server has the functionality of temporarily saving a booking: the savebooking method. A saved booking does not hold any allotments and the prices calculated for the booking at the time of saving cannot be guaranteed. A saved booking can be accessed at a later stage. The booking process is complete only when the saved bookings are sent to the suppliers. This is achieved by using the method bookitinerary (explained in the next section).

Please note that the savebooking method must be implemented only if you choose to integrate the bookitinerary booking flow (that allows also the Credit Card payment method), otherwise you can choose to ignore this method.

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company_code</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="savebooking">  
        <bookingDetails>  
            <parent></parent>  
            <bookingCode></bookingCode>  
            <addToBookedItn></addToBookedItn>  
            <bookedItnParent></bookedItnParent>  
            <fromDate></fromDate>  
            <toDate></toDate>  
            <currency></currency>  
            <productId></productId>  
            <customerReference></customerReference>  
            <rooms no="">  
                <room runno="">  
                    <roomTypeCode></roomTypeCode>  
                    <selectedRateBasis></selectedRateBasis>  
                    <allocationDetails></allocationDetails>  
                    <adultsCode></adultsCode>  
                    <actualAdults></actualAdults>  
                    <children no="">  
                        <child runno=""></child>  
                    </children>  
                    <actualChildren no="">  
                        <actualChild runno="0"></actualChild>  
                    </actualChildren>  
                    <extraBed></extraBed>  
                    <passengerNationality></passengerNationality>  
                    <passengerCountryOfResidence></passengerCountryOfResidence>  
                    <selectedExtraMeals>  
                        <mealPlanDate mealplandatetime="">  
                            <mealPlan applicablefor="" childage=""  ispassenger="" mealscount=""  passengernumber="" runno="">  
                                <meal runno="">  
                                    <mealTypeCode></mealTypeCode>  
                                    <units></units>  
                                    <mealPrice></mealPrice>  
                                </meal>  
                            </mealPlan>  
                        </mealPlanDate>  
                    </selectedExtraMeals>  
                    <passengersDetails>  
                        <passenger leading="">  
                            <salutation></salutation>  
                            <firstName></firstName>  
                            <lastName></lastName>  
                        </passenger>  
                    </passengersDetails>  
                    <specialRequests count="">  
                        <req runno=""></req>  
                    </specialRequests>  
                    <beddingPreference></beddingPreference>  
                </room>  
            </rooms>  
        </bookingDetails>  
    </request>  
</customer>  
 

Item	Type	Parent	Description	Required
bookingDetails	Element	request	Contains the travel dates, product details, passenger details etc. for saving the booking.	Yes.
parent	Element	bookingDetails	Specifies the itinerary code which is an internal code which groups together all services within one itinerary. This is an optional item and if present, this booking will be added to the specified itinerary. This element can be used when the customer is making bookings involving multiple sectors or adding a service to an existing booking.	No.
bookingCode	Element	bookingDetails	Specifies the booking code which is an internal code assigned for each service booked. This is an optional field and if present will replace the existing data against that booking code. This is used while editing an existing service.	No.
addToBookedItn	Element	bookingDetails	Specifies if the current itinerary should be merged into an itinerary all ready booked and confirmed. This merge process will take place only when the current itinerary will be confirmed. Possible values:
1
No.
bookedItnParent	Element	bookingDetails	Specifies an internal code for a booked and confirmed itinerary to which the current itinerary will be added to. Please note that you can only add booking to a confirmed itinerary that was originally made by you.	Yes, if addToBookedItn is present and its value is 1.
fromDate	Element	bookingDetails	Arrival date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
toDate	Element	bookingDetails	Departure date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
currency	Element	bookingDetails	The internal code of the currency in which the prices are calculated.	Yes.
productId	Element	bookingDetails	The internal code of the Hotel which is being booked.	Yes.
customerReference	Element	bookingDetails	Free text that will be assigned to this booking. Maximum 50 characters.	No.
rooms	Element	bookingDetails	Contains a room element for each room the customer wishes to book	Yes.
@no	Attribute	rooms	Specifies the total number of rooms.	Yes.
room	Element	rooms	Encapsulates details about one room.	Yes.
@runno	Attribute	room	Specifies for which room out of the total passed rooms the booking is made for. Please note that the running serial number starts from 0.	Yes.
roomTypeCode	Element	room	Internal code for the Room type of the Hotel being booked.	Yes.
selectedRateBasis	Element	room	Internal code for the selected rate basis.	Yes.
allocationDetails	Element	room	Encrypted string containing details about the room type. This string is received as a response from the getrooms method.	Yes.
actualAdults	Element	room	Number of adults actual in the room	Yes.
actualChildren	Element	room	Specifies the details about the accompanying children in this room.	Yes.
@no	Attribute	actualChildren	Specifies the total number of children in the room. If the booking does not involve any children then the value should be 0.	Yes.
actualChild	Element	actualChildren	Specifies the child age.	No.
@runno

Attribute	actualChild	Specifies for which child the age is applicable.	Yes, if children@no > 0.
adultsCode	Element	room	Number of adults in the room; The possible codes are:
1
2
3
4
5
6
7
8
9
10
Yes.
children	Element	room	Specifies the details about the accompanying children in this room.	Yes.
@no	Attribute	children	Specifies the total number of children in the room. If the booking does not involve any children then the value should be 0.	Yes.
child	Element	children	Specifies the child age.	No.
@runno	Attribute	child	Specifies for which child the age is applicable.	Yes, if children@no > 0.
extraBed	Element	room	If the rate option selected includes an extra bed the element should contain the value 1. Otherwise 0.	Yes.
selectedExtraMeals	Element	room	Encapsulates information about desired extra meals grouped by dates and passengers. Please Send the request for this element only if you want to book extra meals(optional).	No.
mealPlanDate	Element	selectedExtraMeals	Groups extra meals per a specific date. Each date should be part of the booking period. From the booking period only dates that contain at least one meal plan (either for adult or children) should be sent.	Yes, if parent present..
@mealplandatetime	Attribute	mealPlanDate	Meal plan date in YYYY-MM-DD format.	Yes, if parent present..
mealPlan	Element	mealPlanDate	Encapsulates details about one meal plan for one passenger.	Yes, if parent is present.
@runno	Attribute	mealPlan	Running number starting from 0.	Yes, if parent is present.
@mealscount	Attribute	mealPlan	Number of meals for this passenger.	Yes, if parent is present.
@applicablefor	Attribute	mealPlan	Specifies if this meal plan is for an adult passenger or a child.	Yes, if parent is present.
@childage	Attribute	mealPlan	Specifies the age of the child passenger.	Yes, if @applicablefor value is adult.
@ispassenger	Attribute	mealPlan	Fixed value 1.	Yes, if parent is present.
@passengernumber	Attribute	mealPlan	Specifies the passenger number. All meal plans on a specific date with the same passengernumber will be grouped.	Yes, if parent is present.
meal	Element	mealPlan	Encapsultes details about a particular meal that needs to be booked.	Yes, if parent is present.
@runno	Attribute	meal	Running number starting from 0.	Yes, if parent is present.
code	Element	meal	Meal Internal code.	Yes, if parent is present.
mealTypeCode	Element	meal	Meal Type Internal code.	Yes, if parent is present.
units	Element	meal	Number of meals included in this meal plan (for this passenger).	Yes, if parent is present.
mealPrice	Element	meal	Meal Price received in getRooms method. This should be the price without the formatting.	Yes, if parent is present.
passengersDetails	Element	room	Encapsulates details about passengers in the booking. Please note for each room booked at least one passenger element with @leading value yes should be present.	Yes.
passenger	Element	passengersDetails	Encapsulates details about one passenger in the booking. Please note for each room booked the room will be blocked under the leading passenger.	Yes, at least one occurrence.
@leading	Attribute	passenger	Specifies if the passenger is the leading passenger for this room. You can skip this attrbiute if the passenger is not the leaading one. Possible values:
yes
no
Yes, at least one occurrence with value `yes`.
salutation	Element	passenger	The internal code for Salutations (Mr, Mrs etc). This code can be obtained by calling the getsalutations method.	Yes.
firstName	Element	passenger	First name of the leading passenger. Following restrictions are required to be implemented
names should contain minimum 2 characters and maximum 25;
no white spaces or special characters allowed;
it is recommended for all the adults passenger names to be passed in the savebooking request and. If not possible it is mandatory to consider the value returned in the passengersNamesRequiredForBooking element returned in the getRooms xml response for the selected rateBasis.
 name,automatically trim the white spaces
Full Name: James Lee Happy Traveler
firstName: JamesLee
lastName:HappyTraveler
Yes.
lastName	Element	passenger	Last name of the leading passenger.	Yes.
beddingPreference	Element	room	Specifies the category of bedding preference. Subject to availability at check-in Possible values:
0- No preference
1- King size
2- Queen size
3- Twin
Valid only if allowsBeddingPreference element for the selected room is returned populated with value true in getRooms xml response

Yes.
specialRequests	Element	room	Encapsulates the details containing the special requests the customers has requested for this room.	Yes.
@count	Attribute	specialRequests	Total number of special requests for the room.	Yes.
req	Element	specialRequests	Internal code for the Special Request. This code can be obtained by calling the getspecialrequestsids method.	No.
@runno	Attribute	req	Running Serial number, starting from 0.	Yes, if parent present.
 

savebooking_hotel.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="xs:string"  fixed="hotel"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  #####################################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="bookingDetails"  type="confirmBookingBookingDetailsType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="savebooking"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer" use="optional"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
For every savebooking request sent to our DOTWconnect Server the response format will be as follows. All the necessary details regarding the elements returned in the savebooking response are presented in the below table. It is important to take into consideration the element successful that will inform you upon the savebooking method’s success or failure

<result command="savebooking" date="" ip="">  
    <returnedCode></returnedCode>  
    <returnedServiceCodes count="">  
        <returnedServiceCode runno=""></returnedServiceCode>  
    </returnedServiceCodes>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@command	Attribute	result	The request command which returned this result.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@ip	Attribute	result	The IPv4 address the request was made from.
returnedCode	Element	result	Internal code for the Itinerary. The Itinerary code can be used when booking multiple sectors or adding a service to an existing booking.
returnedServiceCodes	Element	result	Groups the Internal Codes of each service within the Itinerary that is saved.
@count	Attribute	returnedServiceCodes	Number of services in the itinerary that was saved.
returnedServiceCode	Element	returnedServiceCodes	Internal Code for the Service booked. Each service booked will have a unique service code and this code can be used for all subsequent modifications to the service.
@runno	Attribute	returnedServiceCode	Running serial number starting from 0.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
savebooking_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:all>  
            <xs:element name="currencyShort"  type="currencyShortType" minOccurs="0"></xs:element>  
            <xs:element name="returnedCode"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="returnedServiceCodes"  type="returnedServiceCodesType"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse"></xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="savebooking"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ {1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9] {1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*\.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="returnedServiceCodesType">  
        <xs:sequence>  
            <xs:element name="returnedServiceCode"  type="returnedServiceCodeType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="returnedServiceCodeType">  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Scenario H6
After selecting and blocking the desired Room Types the customer has the option of either saving this booking information or confirm it with DOTWconnect.

By saving a booking the rooms which are blocked will be released back to our inventory and the system will hold only the booking information. Later on, the customer can confirm this booking (by passing in the bookitinerary request the reference number received in the savebooking response) but DOTWconnect system will have to reprocess this request as per the current rates and availability.

Request XML format
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="savebooking">  
        <bookingDetails>  
            <fromDate>2015-02-20</fromDate>  
            <toDate>2015-02-21</toDate>  
            <currency>520</currency>  
            <productId>71114</productId>  
            <rooms no="2">  
                <room runno="0">  
                    <roomTypeCode>115094</roomTypeCode>  
                    <selectedRateBasis>1331</selectedRateBasis>  
                    <allocationDetails>YTo1OntzOjM6InNpZCI7czo0OiIxMDAwIjtzOjQ6 AwMDEiO3M6MToibiI7aToxO3M6Mzoic2NhIjthOjU6e3M6MjoiZHIiO2E6NDp7czoxMDoiMjAxNS0wMy0wNiI7ZDoy NzAuODAwMDkxMzcyOTcyOTg1OTM2OTM5OTQ5MTY5NzU0OTgxOTk0NjI4OTA2MjU7czoxMDoiMjAxNS0wMy0wNyI7ZD oyNzAuODAwMDkxMzcyOTcyOTg1OTM2OTM5OTQ5MTY5NzU0OTgxOTk0NjI4OTA2MjU7czoxMDoiMjAxNS0wMy0wOCI7 ZDoyNzAuODAwMDkxMzcyOTcyOTg1OTM2OTM5OTQ5MTY5NzU0OTgxOTk0NjI4OTA2MjU7czoxMDoiMjAxNS0wMy0wOS I7ZDoyNzAuODAwMDkxMzcyOTcyOTg1OTM2OTM5OTQ5MTY5NzU0OTgxOTk0NjI4OTA2MjU7fXM6Mjoib2EiO2E6MTQ6 e3M6MToiSSI7czoxNjoiMTQyNDY4NjQzMjAwMDAwMSI7czoxOiJLIjtpOjE7czoxOiJDIjthOjI6e2k6MTQyNDk0ND gwMDthOjM6e3M6MTM6IkNhbmNlbEFsbG93ZWQiO2k6MTtzOjEyOiJBbWVuZEFsbG93ZWQiO2k6MTtzOjEyOiJQZW5h bHR5VmFsdWUiO2E6Mjp7czo2OiJDYW5jZWwiO2Q6OTIwO3M6NToiQW1lbmQiO2Q6OTIwO319aToxNDI1NjcyMDAwO2 E6Mzp7czoxMzoiQ2FuY2VsQWxsb3dlZCI7czoxOiIwIjtzOjEyOiJBbWVuZEFsbG93ZWQiO3M6MToiMCI7czoxMjoi UGVuYWx0eVZhbHVlIjthOjI6e3M6NjoiQ2FuY2VsIjtkOjM2ODA7czo1OiJBbWVuZCI7ZDozNjgwO319fXM6MjoiR0 MiO2k6MTQyNDcwMDgzMjtzOjE6IlQiO2Q6MzY4MDtzOjM6Ik9wdCI7YTo0OntzOjEwOiIyMDE1LTAzLTA2IjtpOjE5 NDI4MztzOjEwOiIyMDE1LTAzLTA3IjtpOjE5NDI4MztzOjEwOiIyMDE1LTAzLTA4IjtpOjE5NDI4MztzOjEwOiIyMD E1LTAzLTA5IjtpOjE5NDI4Mzt9czoxOiJBIjtzOjE6IjIiO3M6MToiRSI7aTowO3M6MToiTyI7YjowO3M6MjoiT0Ui O2I6MDtzOjE6IkIiO2k6MDtzOjE6IlIiO2k6NjgwNTk2NTtzOjI6IkNoIjthOjA6e31zOjM6IlBSQSI7YjoxO31zOj I6IlJRIjtpOjA7czozOiJycGMiO3M6MzoiQkFSIjtzOjY6ImNydWxlcyI7YTozOntpOjA7TzoxNjoiQ2FuY2VsbGF0 aW9uUnVsZSI6MTY6e3M6ODoiZnJvbURhdGUiO047czo2OiJ0b0RhdGUiO3M6MTk6IjIwMTUtMDItMjYgMTE6NTk6NT kiO3M6ODoidGltZXpvbmUiO2k6MzAwO3M6MTg6InJldHVybmVkQnlTdXBwbGllciI7YjowO3M6MjA6ImNhbmNlbGxh dGlvblJ1bGVUZXh0IjtOO3M6MTQ6ImNhbmNlbFBvc3NpYmxlIjtiOjE7czoxMzoiYW1lbmRQb3NzaWJsZSI7YjoxO3 M6Njoibm9TaG93IjtiOjA7czoxNzoiYXJyQWRkaXRpb25hbEluZm8iO047czoxNjoib2JqUHJpY2VDdXN0b21lciI7 TjtzOjE1OiJwcmljZVZhbHVlQW1lbmQiO2k6MDtzOjEwOiJwcmljZVZhbHVlIjtpOjA7czo5OiJmb3JtYXR0ZWQiO0 47czoxMzoicHJpY2VDdXJyZW5jeSI7czozOiI1MjAiO3M6MjE6InByaWNlSW5jbHVkZXNBbGxUYXhlcyI7YjoxO3M6 MTk6Im1pbmltdW1TZWxsaW5nUHJpY2UiO2k6MDt9aToxO086MTY6IkNhbmNlbGxhdGlvblJ1bGUiOjE2OntzOjg6Im =</allocationDetails>  
                    <adultsCode>3</adultsCode>  
                    <children no="1">  
                        <child runno="0">11</child>  
                    </children>  
                    <passengerNationality>81</passengerNationality>  
                    <passengerCountryOfResidence>81</passengerCountryOfResidence>  
                    <selectedExtraMeals></selectedExtraMeals>  
                    <passengersDetails>  
                        <passenger leading="yes">  
                            <salutation>147</salutation>  
                            <firstName>test</firstName>  
                            <lastName>one</lastName>  
                        </passenger>  
                    </passengersDetails>  
                </room>  
                <room runno="1">  
                    <roomTypeCode>6805965</roomTypeCode>  
                    <selectedRateBasis>0</selectedRateBasis>  
                    <allocationDetails>YTo1OntzOjM6InNpZCI7czo0OiIxMDAwIjtzOjQ6 AwMDEiO3M6MToibiI7aToxO3M6Mzoic2NhIjthOjU6e3M6MjoiZHIiO2E6NDp7czoxMDoiMjAxNS0wMy0wNiI7ZDo2 MDAuNDY5NzY3ODI3MDI3MTEyNjE2NjMzNTMwNzA2MTY3MjIxMDY5MzM1OTM3NTtzOjEwOiIyMDE1LTAzLTA3IjtkOj YwMC40Njk3Njc4MjcwMjcxMTI2MTY2MzM1MzA3MDYxNjcyMjEwNjkzMzU5Mzc1O3M6MTA6IjIwMTUtMDMtMDgiO2Q6 MDtzOjEwOiIyMDE1LTAzLTA5IjtkOjA7fXM6Mjoib2EiO2E6MTQ6e3M6MToiSSI7czoxNjoiMTQyNDY4NjQzMjAwMD AwMSI7czoxOiJLIjtpOjA7czoxOiJDIjthOjI6e2k6MTQyNDk0NDgwMDthOjM6e3M6MTM6IkNhbmNlbEFsbG93ZWQi O2k6MTtzOjEyOiJBbWVuZEFsbG93ZWQiO2k6MTtzOjEyOiJQZW5hbHR5VmFsdWUiO2E6Mjp7czo2OiJDYW5jZWwiO2 Q6MjA0MDtzOjU6IkFtZW5kIjtkOjIwNDA7fX1pOjE0MjU2NzIwMDA7YTozOntzOjEzOiJDYW5jZWxBbGxvd2VkIjtz OjE6IjAiO3M6MTI6IkFtZW5kQWxsb3dlZCI7czoxOiIwIjtzOjEyOiJQZW5hbHR5VmFsdWUiO2E6Mjp7czo2OiJDYW 5jZWwiO2Q6ODE2MDtzOjU6IkFtZW5kIjtkOjgxNjA7fX19czoyOiJHQyI7aToxNDI0NzAwODMyO3M6MToiVCI7ZDo4 MTYwO3M6MzoiT3B0IjthOjQ6e3M6MTA6IjIwMTUtMDMtMDYiO2k6MTc0OTEzO3M6MTA6IjIwMTUtMDMtMDciO2k6MT c0OTEzO3M6MTA6IjIwMTUtMDMtMDgiO2k6MTc0OTEzO3M6MTA6IjIwMTUtMDMtMDkiO2k6MTc0OTEzO31zOjE6IkEi O3M6MToiMyI7czoxOiJFIjtpOjA7czoxOiJPIjtiOjA7czoyOiJPRSI7YjowO3M6MToiQiI7aToxMzMxO3M6MToiUi I7aToxMTUwOTQ7czoyOiJDaCI7YToxOntpOjA7czoyOiIxMSI7fXM6MzoiUFJBIjthOjE6e2k6MDtzOjE1OiIxNzQ5 MTNfOl9wcm9tbzEiO319czoyOiJSUSI7aTowO3M6MzoicnBjIjtzOjM6IkJBUiI7czo2OiJjcnVsZXMiO2E6Mzp7aT owO086MTY6IkNhbmNlbGxhdGlvblJ1bGUiOjE2OntzOjg6ImZyb21EYXRlIjtOO3M6NjoidG9EYXRlIjtzOjE5OiIy MDE1LTAyLTI2IDExOjU5OjU5IjtzOjg6InRpbWV6b25lIjtpOjMwMDtzOjE4OiJyZXR1cm5lZEJ5U3VwcGxpZXIiO2 I6MDtzOjIwOiJjYW5jZWxsYXRpb25SdWxlVGV4dCI7TjtzOjE0OiJjYW5jZWxQb3NzaWJsZSI7YjoxO3M6MTM6ImFt ZW5kUG9zc2libGUiO2I6MTtzOjY6Im5vU2hvdyI7YjowO3M6MTc6ImFyckFkZGl0aW9uYWxJbmZvIjtOO3M6MTY6Im 9ialByaWNlQ3VzdG9tZXIiO047czoxNToicHJpY2VWYWx1ZUFtZW5kIjtpOjA7czoxMDoicHJpY2VWYWx1ZSI7aTow O3M6OToiZm9ybWF0dGVkIjtOO3M6MTM6InByaWNlQ3VycmVuY3kiO3M6MzoiNTIwIjtzOjIxOiJwcmljZUluY2x1ZG VzQWxsVGF4ZXMiO2I6MTtzOjE5OiJtaW5pbXVtU2VsbGluZ1ByaWNlIjtpOjA7fWk6MTtPOjE2OiJDYW5jZWxsYXRp b25SdWxlIjoxNjp7czo4OiJmcm9tRGF0ZSI7czoxOToiMjAxNS0wMi0yNiAxMjowMDowMCI7czo2OiJ0b0RhdGUiO0 =</allocationDetails>  
                    <adultsCode>2</adultsCode>  
                    <children no="0"></children>  
                    <passengerNationality>107</passengerNationality>  
                    <passengerCountryOfResidence>109</passengerCountryOfResidence>  
                    <selectedExtraMeals></selectedExtraMeals>  
                    <passengersDetails>  
                        <passenger leading="yes">  
                            <salutation>147</salutation>  
                            <firstName>test</firstName>  
                            <lastName>two</lastName>  
                        </passenger>  
                    </passengersDetails>  
                </room>  
            </rooms>  
        </bookingDetails>  
    </request>  
</customer>  
Response XML format

<p>  
    <result command="savebooking" tID="1424687343000001" ip="127.0.0.1" date="2015-02-23 10:29:03" version="2.0" elapsedTime="0.095901966094971">  
        <returnedCode>1063997692</returnedCode>  
        <returnedServiceCodes count="2">  
            <returnedServiceCode runno="0">1063997712</returnedServiceCode>  
            <returnedServiceCode runno="1">1063997702</returnedServiceCode>  
        </returnedServiceCodes>  
        <successful>TRUE</successful>  
    </result>  
</p>  
Confirm Booking
General Request
The confirmbooking method of DOTWconnect is used to generate an Itinerary which contains one or more successfully booked rooms or successfully booked services. Each booked room or service will have a unique reference number (booking code) which can be individually amended or cancelled.

Multiple rooms or services booked in the same booking flow will be grouped together under the same unique itinerary number.

When using the confirmbooking method you have the option of generating a new itinerary or of adding services to an already confirmed itinerary. The format of the request and response for this method is explained in the following section.

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company_code</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="confirmbooking">  
        <bookingDetails>  
            <parent></parent>  
            <bookingCode></bookingCode>  
            <addToBookedItn></addToBookedItn>  
            <bookedItnParent></bookedItnParent>  
            <fromDate></fromDate>  
            <toDate></toDate>  
            <currency></currency>  
            <productId></productId>  
            <customerReference></customerReference>  
            <rooms no="">  
                <room runno="">  
                    <roomTypeCode></roomTypeCode>  
                    <selectedRateBasis></selectedRateBasis>  
                    <allocationDetails></allocationDetails>  
                    <adultsCode></adultsCode>  
                    <actualAdults></actualAdults>  
                    <children no="">  
                        <child runno=""></child>  
                    </children>  
                    <actualChildren no="">  
                        <actualChild runno="0"></actualChild>  
                    </actualChildren>  
                    <extraBed></extraBed>  
                    <passengerNationality></passengerNationality>  
                    <passengerCountryOfResidence></passengerCountryOfResidence>  
                    <selectedExtraMeals>  
                        <mealPlanDate mealplandatetime="">  
                            <mealPlan applicablefor="" childage=""  ispassenger="" mealscount=""  passengernumber="" runno="">  
                                <meal runno="">  
                                    <mealTypeCode></mealTypeCode>  
                                    <units></units>  
                                    <mealPrice></mealPrice>  
                                </meal>  
                            </mealPlan>  
                        </mealPlanDate>  
                    </selectedExtraMeals>  
                    <passengersDetails>  
                        <passenger leading="">  
                            <salutation></salutation>  
                            <firstName></firstName>  
                            <lastName></lastName>  
                        </passenger>  
                    </passengersDetails>  
                    <specialRequests count="">  
                        <req runno=""></req>  
                    </specialRequests>  
                    <beddingPreference></beddingPreference>  
                </room>  
            </rooms>  
        </bookingDetails>  
    </request>  
</customer>  
 

Item	Type	Parent	Description	Required
bookingDetails	Element	request	Contains the travel dates, product details, passenger details etc. for the booking.	Yes.
parent	Element	bookingDetails	Specifies the itinerary code which is an internal code which groups together all services within one itinerary. This is an optional item and if present, this booking will be added to the specified itinerary. This element can be used when the customer is making bookings involving multiple sectors or adding a service to an existing booking	No.
bookingCode	Element	bookingDetails	Specifies the booking code which is an internal code assigned for each service booked. This is an optional field and if present will replace the existing data against that booking code. This is used while editing an existing service.	No.
addToBookedItn	Element	bookingDetails	Specifies if the current itinerary should be merged into an itinerary all ready booked and confirmed. This merge process will take place only when the current itinerary will be confirmed. Possible values:
1	No.
bookedItnParent	Element	bookingDetails	Specifies an internal code for a booked and confirmed itinerary to which the current itinerary will be added to. Please note that you can only add booking to a confirmed itinerary that was originally made by you.	Yes, if add_to_booked_itn is present and its value is value is 1
fromDate	Element	bookingDetails	Arrival date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
toDate	Element	bookingDetails	Departure date in DotW date format (YYYY-MM-DD) or Unix timestamp	Yes.
currency	Element	bookingDetails	The internal code of the currency in which the prices are calculated.	Yes.
productId	Element	bookingDetails	The internal code of the Hotel which is being booked.	Yes.
customerReference	Element	bookingDetails	Agent Reference. Free text that will be assigned to this booking Maximum 50 characters.	No.
rooms	Element	bookingDetails	Contains a room element for each room the customer wishes to book	Yes.
@no	Attribute	rooms	Specifies the total number of rooms.	Yes.
room	Element	rooms	Encapsulates details about one room.	Yes.
@runno	Attribute	room	Specifies for which room out of the total passed rooms the booking is made for. Please note that the running serial number starts from 0.	Yes.
roomTypeCode	Element	room	Internal code for the Room type of the Hotel being booked.	Yes.
selectedRateBasis	Element	room	Internal code for the selected rate basis.	Yes.
allocationDetails	Element	room	Encrypted string containing details about the room type. This string is received as a response from the getrooms method.	Yes.
actualAdults	Element	room	Indicates the number of adults the initial search was made for	Yes.
actualChildren	Element	room	Indicates the number of children the initial search was made for	Yes.
actualChild	Element	room	Specifies the child's age.	Yes.
adultsCode	Element	room	Number of adults in the room; The possible codes are:
1
2
3
4
5
6
7
8
9
10
The value sent in this element may vary only if an offer with an extraBed has been selected (changedOccupancy element returned with the last paramenter set on 1)

If an adult has been fitted in the extra bed, he/she will not be included in this element anymore

Yes.
children	Element	room	Specifies the details about the accompanying children in this room. If a child has been fitted in the extra bed, he/she will not be included in this element anymore	Yes.
@no	Attribute	children	Specifies the total number of children in the room. If the booking does not involve any children then the value should be 0.	Yes.
child	Element	children	Specifies the child age.	No.
@runno	Attribute	child	Specifies for which child the age is applicable.	Yes, if children@no > 0.
runno	Element	actualChild	Running number starting from 0 Yes.	Yes
extraBed	Element	room	If for this room the customer wants also to include an extra bed, then this field will have the value 1. Otherwise the value will be 0.	Yes.
selectedExtraMeals	Element	room	Encapsulates information about desired extra meals grouped by dates and passengers. Please Send the request for this element only if you want to book extra meals(optional).	No.
mealPlanDate	Element	selectedExtraMeals	Groups extra meals per a specific date. Each date should be part of the booking period. From the booking period only dates that contain at least one meal plan (either for adult or children) should be sent.	Yes, if parent present..
@mealplandatetime	Attribute	mealPlanDate	Meal plan date in YYYY-MM-DD format.	Yes, if parent present..
mealPlan	Element	mealPlanDate	Encapsulates details about one meal plan for one passenger.	Yes, if parent is present.
@runno	Attribute	mealPlan	Running number starting from 0.	Yes, if parent is present.
@mealscount	Attribute	mealPlan	Number of meals for this passenger.	Yes, if parent is present.
@applicablefor	Attribute	mealPlan	Specifies if this meal plan is for an adult passenger or a child.	Yes, if parent is present.
@childage	Attribute	mealPlan	Specifies the age of the child passenger.	Yes, if @applicablefor value is adult.
@ispassenger	Attribute	mealPlan	Fixed value 1.	Yes, if parent is present.
@passengernumber	Attribute	mealPlan	Specifies the passenger number. All meal plans on a specific date with the same passengernumber will be grouped.	Yes, if parent is present.
meal	Element	mealPlan	Encapsultes details about a particular meal that needs to be booked.	Yes, if parent is present.
@runno	Attribute	meal	Running number starting from 0.	Yes, if parent is present.
code	Element	meal	Meal Internal code.	Yes, if parent is present.
mealTypeCode	Element	meal	Meal Type Internal code.	Yes, if parent is present.
units	Element	meal	Number of meals included in this meal plan (for this passenger).	Yes, if parent is present.
mealPrice	Element	meal	Meal price received in the getRooms method. This should be the price without the formatting.	Yes, if parent is present.
passengersDetails	Element	room	Encapsulates details about passengers in the booking. Please note for each room booked at least one passenger element with @leading value yes should be present.	Yes.
passenger	Element	passengersDetails	Encapsulates details about one passenger in the booking. Please note for each room booked the room will be blocked under the leading passenger.	Yes, at least one occurrence.
@leading	Attribute	passenger	Specifies if the passenger is the leading passenger for this room. You can skip this attrbiute if the passenger is not the leaading one. Possible values:
yes
no
Yes, at least one occurrence with value `yes`.
salutation	Element	passenger	The internal code for Salutations (Mr, Mrs etc). This code can be obtained by calling the getsalutations method.	Yes.
firstName	Element	passenger	First name of the leading passenger. Following restrictions are required to be implemented
names should contain minimum 2 characters and maximum 25;
no white spaces or special characters allowed;
it is recommended for all the adults passenger names to be passed in the confirmbooking request and. If not possible it is mandatory to consider the value returned in the passengersNamesRequiredForBooking element returned in the getRooms xml response for the selected rateBasis.
In case of multiple first/last name,automatically trim the white spaces
Full Name: James Lee Happy Traveler
firstName: JamesLee
lastName:HappyTraveler
Yes.
lastName	Element	passenger	Last name of the leading passenger.	Yes.
specialRequests	Element	room	Encapsulates the details containing the special requests the customers has requested for this room.	Yes.
@count	Attribute	specialRequests	Total number of special requests for the room.	Yes.
req	Element	specialRequests	Internal code for the Special Request. This code can be obtained by calling the getspecialrequestsids method.	No.
@runno	Attribute	req	Running Serial number, starting from 0.	Yes, if parent present.
beddingPreference	Element	room	Specifies the category of bedding preference. Subject to availability at check-in Possible values:
0- No preference
1- King size
2- Queen size
3- Twin
Valid only if allowsBeddingPreference element for the selected room is returned populated with value true in getRooms xml response

Yes.
 

confirmbooking_hotel.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="xs:string"  fixed="hotel"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  #####################################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="bookingDetails"  type="confirmBookingBookingDetailsType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="confirmbooking"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer" use="optional"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
For every confirmbooking request sent to our DOTWconnect Server the response format will be as follows. All the necessary details regarding the elements returned in the confirmbooking response are presented in the below table. It is important to take into consideration the element successful that will inform you upon the confirmbooking method’s success or failure.

<result command="confirmbooking" ip="192.168.0.1" date="1227776854">  
    <confirmationText></confirmationText>  
    <returnedCode></returnedCode>  
    <bookings>  
        <booking runno="0">  
            <bookingCode></bookingCode>  
            <bookingReferenceNumber></bookingReferenceNumber>  
            <bookingStatus></bookingStatus>  
            <servicePrice>  
                <formatted></formatted>  
            </servicePrice>  
            <mealsPrice>  
                <formatted></formatted>  
            </mealsPrice>  
            <price>  
                <formatted></formatted>  
            </price>  
            <totalTaxes>  
                <formatted></formatted>  
            </totalTaxes>  
            <totalFee>  
                <formatted></formatted>  
            </totalFee>  
            <propertyFees count="">  
                <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">  
                    <formatted></formatted>  
                </propertyFee>  
            </propertyFees>  
            <currency></currency>  
            < type>hotel</ type>  
            <voucher></voucher>  
            <paymentGuaranteedBy></paymentGuaranteedBy>  
            <emergencyContacts count="">  
                <emergencyContact runno="">  
                    <salutation code=""></salutation>  
                    <fullName></fullName>  
                    <phone></phone>  
                </emergencyContact>  
            </emergencyContacts>  
        </booking>  
    </bookings>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@command	Attribute	result	The request command which returned this result.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@ip	Attribute	result	The IPv4 address the request was made from.
confirmationText	Element	result	Itinerary Confirmation Text in HTML format.
returnedCode	Element	product	Internal itinerary code. This will have to be passed to all other operations regarding this booking and accepts itinerary codes.
bookings	Element	product	Encapsulates information about all bookings.
booking	Element	bookings	Information about one booking
@runno	Attribute	booking	Running number starting from 0.
bookingCode	Element	booking	Internal booking code. This will have to be passed to all other operations regarding this booking.
bookingReferenceNumber	Element	booking	Confirmation number for this booking. The unique confirmation number generated by DOTWconnect. This number is provided to the Customers and Suppliers and is a key to identify this booking. The confirmation number is the internal booking code prefixed with the service and booking office details.
bookingStatus	Element	booking	Specifies if the booking is confirmed from allotment or on request. Possible values:
1 - on request
2 - confirmed
servicePrice	Element	booking	Payable amount for this booking. Extra meals price is not included.
formatted	Element	servicePrice	This element contains the payable amount for this booking formatted as per the customer preference (decimal places, thousand separator, decimal separator)
mealsPrice	Element	booking	Payable amount for this booking`s extra meals.
formatted	Element	mealsPrice	This element contains the payable amount for this booking`s extra meals formatted as per the customer preference (decimal places, thousand separator, decimal separator)
price	Element	booking	Total payable amount for this booking, including extra meals.
formatted	Element	price	This element contains the total payable amount for this booking, including extra meals. formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalTaxes	Element	booking	If present, this element contains the total taxes that are included in total rate price in rate currency
formatted	Element	totalTaxes	This element contains the total taxes included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
@feeIncluded	Attribute	totalTaxes	If present and value is True, this attribute specifies that fee amount is included in total tax amount and totalFee element will not be present
totalFee	Element	booking	If present, this element contains the total fee that is included in total rate price in rate currency
formatted	Element	totalFee	This element contains the total fee included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the rate currency.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the rate currency.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
formatted	Element	propertyFee	This element contains the fee amount, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
currency	Element	booking	Internal code for the currency in which the prices are calculated
type	Element	booking	Service type. Possible values:
Hotel
Apartment
voucher	Element	booking	Booking voucher in HTML format.
paymentGuaranteedBy	Element	booking	Specifies who guarantees for the booking. This information needs to be present on the voucher.
emergencyContacts	Element	booking	Groups relevant contacts in case of emergency. These contact numbers need to be present on the voucher.
count	Attribute	emergencyContacts	Specifies how many contacts are available for this booking.
emergencyContact	Element	emergencyContacts	Groups information about an emergency contact.
runno	Attribute	emergencyContacts	Serial number starting from 0.
salutation	Element	emergencyContact	Contact Person Salutation
id	Attribute	salutation	Internal code for the salutation
fullName	Element	emergencyContact	Contact Person full name
phone	Element	emergencyContact	Contact phone number
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
confirmbooking_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:all>  
            <xs:element name="currencyShort"  type="currencyShortType"></xs:element>  
            <xs:element name="confirmationText"  type="xs:string"></xs:element>  
            <xs:element name="returnedCode"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="bookings"  type="bookingsType"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse"></xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="confirmbooking"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="bookingsType">  
        <xs:sequence>  
            <xs:element name="booking"  type="bookingType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="bookingType">  
        <xs:sequence>  
            <xs:element name="bookingCode"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="bookingReferenceNumber"  type="xs:string"></xs:element>  
            <xs:element name="bookingStatus"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="servicePrice"  type="servicePriceType"></xs:element>  
            <xs:element name="mealsPrice"  type="servicePriceType"></xs:element>  
            <xs:element name="price"  type="servicePriceType"></xs:element>  
            <xs:element name="totalTaxes"  type="serviceTaxPriceType" minOccurs="0"></xs:element>  
            <xs:element name="totalFee"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="currency"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="type"  type="xs:string"></xs:element>  
            <xs:element name="voucher"  type="xs:string"></xs:element>  
            <xs:element name="paymentGuaranteedBy"  type="xs:string"></xs:element>  
            <xs:element name="emergencyContacts"  type="emergencyContactsType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="servicePriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="serviceTaxPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="feeIncluded"  type="trueOrFalse"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="emergencyContactsType">  
        <xs:sequence>  
            <xs:element name="emergencyContact"  type="emergencyContactType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="emergencyContactType">  
        <xs:sequence>  
            <xs:element name="salutation">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
            <xs:element name="fullName"  type="xs:string"></xs:element>  
            <xs:element name="phone"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeesType" mixed="true">  
        <xs:sequence>  
            <xs:element name="propertyFee"  type="propertyFeeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeeType" mixed="true">  
        <xs:all>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="currencyshort"  type="currencyShortType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="includedinprice"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="Yes|No"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
Re-confirm booking process
The new feature has the purpose to enhance our customers experience, by providing alternative offers in cases when DOTW receive from its suppliers different conditions in the confirmation step.
Therefore, instead of only returning an error message in such cases, the re-confirmation process will provide additional details about the new booking conditions, offering to our customers the possibility to finalize the booking.

The confirmation response will still return an error Code and error message, but in addition to this, the extraDetails tag will contain the new booking conditions.

important: For those customers who are interested to implement the re-confirmation process logic, it is mandatory to add in the confirmbooking request a new tag: <returnReconfirm>. Additional details can be found under Hotel Comm Structure -. Confirm Booking -> General Request section.

It is mandatory that in the new confirmbooking request, the customer will use the allocationDetails token generated in the extraDetails tag, as this encapsulates the new booking conditions.

<!-- ?xml version="1.0" encoding="UTF-8"? -->  
<result command="confirmbooking" date="2018-05-19 07:51:23" elapsedtime="58.839843034744" ip="192.168.0.71" tid="1526716224100001" version="3.0">  
    <request>  
        <successful>FALSE</successful>  
        <error>  
            <class>GeneralRequestConfirmBooking</class>  
            <code>151</code>  
            <details>Unable to confirm the booking due to a rate change from supplier</details>  
            <extradetails>  
                <rooms no="1">  
                    <room changed="price" haserror="true" runno="0">  
                        <currencyshort>USD</currencyshort>  
                        <code>31723509</code>  
                        <selectedratebasis>0</selectedratebasis>  
                        <allocationdetails>1526716226000001B1011B0</allocationdetails>  
                        <price> 44.267408421958 <formatted>44.267408421958</formatted>  
</price>  
                        <cancellationrules count="3">  
                            <rule runno="0">  
                                <todate>2018-05-23 14:59:59</todate>  
                                <todatedetails>Wed, 01 May 2018 14:59:59</todatedetails>  
                                <amendcharge> 0 <formatted>0.00</formatted>  
</amendcharge>  
                                <cancelcharge> 0 <formatted>0.00</formatted>  
</cancelcharge>  
                                <charge> 0 <formatted>0.00</formatted>  
</charge>  
                            </rule>  
                            <rule runno="1">  
                                <fromdate>2018-05-23 15:00:00</fromdate>  
                                <fromdatedetails>Wed, 01 May 2018 15:00:00</fromdatedetails>  
                                <amendcharge> 67.2194 <formatted>67.22</formatted>  
</amendcharge>  
                                <cancelcharge> 67.2194 <formatted>67.22</formatted>  
</cancelcharge>  
                                <charge> 67.2194 <formatted>67.22</formatted>  
</charge>  
                            </rule>  
                            <rule runno="2">  
                                <fromdate>2018-05-25 00:00:00</fromdate>  
                                <fromdatedetails>Fri, 01 May 2018 00:00:00 / Midnight</fromdatedetails>  
                                <noshowpolicy>true</noshowpolicy>  
                                <charge> 67.2194 <formatted>67.22</formatted>  
</charge>  
                            </rule>  
                        </cancellationrules>  
                    </room>  
                </rooms>  
            </extradetails>  
        </error>  
    </request>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
request	Element	result	Contains specific data for the unsuccessfull request command.
successful	Element	request	Indicates that the request was not successfully processed.
error	Element	request	Contains information about the error.
code	Element	error	Internal error code.
details	Element	 	Details about the error.
extraDetails	Element	error	Extra details regarding the error.
successful	element	request	Indicates if the response is a successful or a failed one. Possible values
FALSE
TRUE
No.
rooms	Element	extraDetails	Specifies the number of rooms for which new conditions have been returned.	No.
room	Element	rooms	Encapsulates the booking conditions for the first room.	No.
haserror	attribute	response	Indicates if the confirmation response triggered an error from DOTW server. Fixed value: 'true'	No.
changed	attribute	response	Specifies the reason of the booking failure and which conditions have changed. Possible values:
price
price|cxl
cxl
No.
currencyshort	element	room	Short currency code in which rates are returned	No.
code	Element	room	DOTW Internal RoomTypeCode for the selected room.	No.
selectedratebasis	Element	room	DOTW Internal Code for the selected rateBasis	No.
allocationdetails	Element	room	AllocationDetails Token which encapsulates the new booking conditions. To be used in the next confirmbooking request;	No.
price	Element	room	New booking price	No.
cancellationrules	element	room	Encapsulates details about the new cancellation rules	No.
rule	Element	cancellationrules	Indicates the cancellation rule number.	No.
fromdate	Element	rule	Starting date of the rule. From this day forward until toDate (if present), the specified charge will be applied for any cancellations or amendments. If this element is not present then the charge will be applied from the current date until toDate. Date format is: YYYY-MM-DD HH:MM:SS	No.
fromdatedetails	Element	rule	From Date in Weekday Month Day, Year HH:MM:SS format.	No.
amendcharge	Element	rule	Amendment charge that will be applied if booking isamended in the period defined by this rule.	No.
cancelCharge	Element	rule	Cancellation charge that will be applied if booking is canceled in the period defined by this rule.	No.
cancelRestricted	Element	rule	If present, this element indicates that a future cancel (using the cancelbooking or deleteitinerary methods) done in the time period defined by this rule, will not be possible. Fixed value:
TRUE
No.
amendRestricted	Element	rule	If present, this element indicates that a future amendment (using the updatebooking method) done in the time period defined by this rule, will not be possible. Fixed value:
TRUE
No.
noshowpolicy	Element	rule	If present, this element indicates that the presented charge is a no show charge. In this case the elements fromDate, fromDateDetails, toDate, toDateDetails, amendingPossible will be absent. Fixed value:
TRUE
No.
Get Booking Details
General Request
This request is used to retrieve all the available details that belong to an already existing booking (saved - using the savebooking method or confirmed using confirmbooking/bookitinerary methods). This method can be used for all DOTW services but the response might vary from service to service.

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <request command="getbookingdetails">  
        <bookingDetails>  
            <bookingType></bookingType>  
            <bookingCode></bookingCode>  
        </bookingDetails>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
bookingDetails	Element	request	Encapsulates the detail of the booking for which the details are requested for	Yes.
bookingType	Element	bookingDetails	Specifies at what stage the booking is currently. A booking can be either in Saved stage or Confirmed stage. Possible values:
1 - Confirmed
2 - Saved
Yes.
bookingCode	Element	bookingDetails	Internal code for the Booking which was returned by DOTWconnect when the booking was Saved or Confirmed.	Yes.
getbookingdetails.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:all>  
            <xs:element name="bookingDetails">  
                <xs:complexType>  
                    <xs:sequence>  
                        <xs:group ref="bookingTypeAndCode"></xs:group>  
                    </xs:sequence>  
                </xs:complexType>  
            </xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getbookingdetails"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response (Hotel)
For a service which is booked on the DOTWconnect server the getbookingdetails response has the following format. The response will list all the details pertaining to the specified booking (i.e. room details, passenger details including adults and children, meals, special requests if any etc).

<result command="getbookingdetails" date="" ip="">  
    <product>  
        <productSpecialRequests count="">  
            <specialRequest id="" checked="checked"></specialRequest>  
        </productSpecialRequests>  
        <booked></booked>  
        <code></code>  
        <bookingReferenceNumber></bookingReferenceNumber>  
        <servicePrice>Actual Service Price <formatted></formatted>  
</servicePrice>  
        <totalTaxes>Total Taxes Amount <formatted></formatted>  
</totalTaxes>  
        <totalFee>Total Fee Amount <formatted></formatted>  
</totalFee>  
        <propertyFees count="">  
            <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">Fee amount in rate currency <formatted></formatted>  
</propertyFee>  
        </propertyFees>  
        <currency></currency>  
        <shortCurrency></shortCurrency>  
        <paymentGuaranteedBy></paymentGuaranteedBy>  
        <emergencyContacts count="">  
            <emergencyContact runno="">  
                <salutation id=""></salutation>  
                <fullName></fullName>  
                <phone></phone>  
            </emergencyContact>  
        </emergencyContacts>  
        <invoiced></invoiced>  
        <status></status>  
        <service></service>  
        <serviceId></serviceId>  
        <serviceName></serviceName>  
        <adults></adults>  
        <children no="">  
            <child runno=""></child>  
        </children>  
        <extraBed></extraBed>  
        <cancellationRules count="">  
            <rule runno="">  
                <fromDate></fromDate>  
                <fromDateDetails></fromDateDetails>  
                <toDate></toDate>  
                <toDateDetails></toDateDetails>  
                <charge>Cancellation Charge <formatted></formatted>  
</charge>  
            </rule>  
        </cancellationRules>  
        <serviceLocation></serviceLocation>  
        <cancel></cancel>  
        <allowAmmend></allowAmmend>  
        <onRequest></onRequest>  
        <customerReference></customerReference>  
        <passengersDetails>  
            <passenger leading="">  
                <salutation value=""></salutation>  
                <firstName></firstName>  
                <lastName></lastName>  
            </passenger>  
        </passengersDetails>  
        <from></from>  
        <to></to>  
        <numberOfNights></numberOfNights>  
        <fromShort></fromShort>  
        <toShort></toShort>  
        <roomTypeCode></roomTypeCode>  
        <rateBasis></rateBasis>  
        <roomName></roomName>  
        <roomInfo>  
            <maxAdult></maxAdult>  
            <maxExtraBed></maxExtraBed>  
            <allowTwin></allowTwin>  
            <maxChildren></maxChildren>  
        </roomInfo>  
        <roomCategory></roomCategory>  
        <extraMeals>  
            <mealDate runno=""  wday="" day="" datetime="">  
                <mealType mealtypename="" mealtypecode="">  
                    <meal runno="" applicablefor="" startage="" endage="">  
                        <mealCode></mealCode>  
                        <mealName></mealName>  
                        <mealPrice>  
                            <formatted></formatted>  
                        </mealPrice>  
                    </meal>  
                </mealType>  
            </mealDate>  
        </extraMeals>  
        <selectedExtraMeals>  
            <mealPlanDate mealplandatetime="">  
                <mealPlan runno="" mealscount="" applicablefor="" childage=""  ispassenger=""  passengernumber="">  
                    <meal runno="">  
                        <code></code>  
                        <mealTypeCode></mealTypeCode>  
                        <units></units>  
                        <mealPrice>  
                            <formatted></formatted>  
                        </mealPrice>  
                        <mealTypeName></mealTypeName>  
                        <mealName></mealName>  
                        <bookedMealCode></bookedMealCode>  
                    </meal>  
                </mealPlan>  
            </mealPlanDate>  
        </selectedExtraMeals>  
    </product>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@command	Attribute	result	The request command which returned this result.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@ip	Attribute	result	The IPv4 address the request was made from.
product	Element	result	Contains information about a specific booked service.
productSpecialRequests	Element	product	Encapsulates a list with all the special requests made for this booking.
@count	Attribute	specialRequests	Total number of special requests that can be requested while making a booking for Hotels
specialRequest	Element	specialRequests	Internal code for the special request
@runno	Attribute	specialRequest	Running number starting from 0
booked	Element	product	Indicates whether the booking is a saved booking or confirmed booking. Possible values:
yes
no
code	Element	product	Internal Code generated by DOTWconnect for this booking.
bookingReferenceNumber	Element	product	Confirmation number for this booking. The unique confirmation number generated by DOTWconnect. This number is provided to the Customers and Suppliers and is a key to identify this booking. The confirmation number is the internal booking code prefixed with the service and booking office details.
supplierConfirmation	Element	product	The confirmation response
servicePrice	Element	product	Total payable amount for this booking.
formatted	Element	servicePrice	This element contains the total price payable for this booking formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalTaxes	Element	product	Total taxes amount.
formatted	Element	totalTaxes	This element contains the total taxes included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
@feeIncluded	Attribute	totalTaxes	If present and value is True, this attribute specifies that fee amount is included in total tax amount and totalFee element will not be present
totalFee	Element	product	If present, this element contains the total fee amount that is included in total rate price in rate currency
formatted	Element	totalFee	This element contains the total fee amount included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the rate currency.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the rate currency.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
formatted	Element	propertyFee	This element contains the fee amount, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
currency	Element	product	Internal code for the currency in which the prices are calculated
currencyShort	Element	product	Three letter code for the currency
paymentGuaranteedBy	Element	product	The payment guaranty information.
emergencyContacts	Element	product	Groups information about the emergency contacts.
emergencyContact	Element	emergencyContacts	Encapsulates emergency contact data.
@runno	Attribute	emergencyContact	Running number starting from 0.
salutation	Element	emergencyContact	Salutation text
@id	Attribute	salutation	Salutation ID
fullName	Element	emergencyContact	Full name.
phone	Element	emergencyContact	Phone number
invoiced	Element	product	This element indicates if the booking is invoiced or not. Possible values:
true
false
status	Element	product	This element indicates the status of the booking. Possible values:
1666 Confirmed
1667 Cancelled
1669 Amended Confirmed
1705 Aborted
1665 - On Request
1668 - Amended On Request
1669 - Amended Confirmed
1707 - Denied
1708 - Saved
service	Element	product	This element indicates the service involved in this booking. For Hotel bookings this will have a value hotel.
serviceId	Element	product	Internal Code for the Hotel booked
serviceName	Element	product	Name of the Hotel
adults	Element	product	Number of adults for this booking.
children	Element	product	Contains info about the children for this booking.
@no	Attribute	children	Total number of children for this booking.
child	Element	children	Specifies child age.
@runno	Attribute	child	Specifies for which child the age applies.
extraBed	Element	product	Number of extra beds in the room for this booking.
cancellationRules	Element	product	Encapsulates details about the cancellation policy applicable for this room type and rate basis.
@count	Attribute	cancellationRules	Specifies the number of cancellation policies.
rule	Element	cancellationRules	Contains details about a specific cancellation policy.
@runno	Attribute	rule	Running serial number starting from 0.
fromDate	Element	rule	Starting date of the rule. From this date forward until toDate (if present), the specified charge will be applied for any cancellations or amendments. If this element is not present then the charge will be applied from date the booking was made until toDate. Date format is: YYYY-MM-DD HH:MM:SS
fromDateDetails	Element	rule	From Date in Weekday Month Day, Year HH:MM:SS format.
toDate	Element	rule	Ending date of the rule. The specified charge will be applied for any cancellations or amendments until this date. If this element is not present then the charge from fromDate onwards. Date format is: YYYY-MM-DD HH:MM:SS
toDateDetails	Element	rule	To Date in Weekday Month Day, Year HH:MM:SS format.
charge	Element	rule	Cancellation/Amendment charge that will be applied if booking cancelled following this rule.
formatted	Element	charge	Cancellation/Amendments charge formatted as per the customer preference (decimal places, thousand separator, decimal separator).
serviceLocation	Element	product	Hotel location in City, Country format
cancel	Element	product	Specifies if this booking can be cancelled. Possible values:
yes
no
allowAmmend	Element	product	Specifies if this booking can be amended. Possible values:
yes
no
onRequest	Element	product	Specifies if this booking is on request. Possible values:
yes
no
customerReference	Element	product	Internal reference provided by the customer.
passengersDetails	Element	product	Groups information about the passengers.
passenger	Element	passengersDetails	Encapsulates details about one passenger in the booking.
@leading	Attribute	passenger	Specifies if the passenger is the leading passenger for this room.
@runno	Attribute	passenger	Running number starting from 0.
code	Element	passenger	Passenger code.
salutation	Element	passenger	Salutation for the leading person.
firstName	Element	passenger	First Name of the leading Person
lastName	Element	passenger	Last Name of the leading Person
from	Element	product	Arrival date in the YYYY-MM-DD format.
to	Element	product	Departure date in the YYYY-MM-DD format.
numberOfNights	Element	product	Number of nights.
fromShort	Element	product	Arrival date in a formatted text showing weekday and name of the month.
toShort	Element	product	Departure date in a formatted text showing weekday and name of the month.
roomTypeCode	Element	product	Internal code for the room type.
rateBasis	Element	product	Internal code for the rate basis booked with this room type.
roomName	Element	product	Name of the Room Type
roomInfo	Element	product	Contains information about the occupancy of the room.
maxAdult	Element Element	roomInfo	Maximum number of adults this room can accommodate.
maxExtraBed	Element	roomInfo	Number of extrabeds this room can accommodate.
allowTwin	Element	roomInfo	Specifies if this room is twin or not. Possible values:
0
1
maxChildren	Element	roomInfo	Maximum number of children this room can accommodate.
roomCategory	Element	product	Category of this Room
extraMeals	Element	product	Encapsulates information about extra meals provided by the hotel grouped by the date.
@count	Attribute	extraMeals	Meals number
mealDate	Element	extraMeals	Contains details about extra meals provided by the hotel on a specific date grouped by meal types.
@wday	Attribute	mealDate	Week day number (from 0 (Sunday) to 6 (Saturday)).
day	Attribute	mealDate	Day-of-the-week name Month, day-of-the-month, year.
@datetime	Attribute	mealDate	Date in YYYY-MM-DD HH:MM:SS format.
mealType	Element	mealDate	Contains information about each meal in a certain category(type) - e.g. Breakfast, Lunch.
@mealtypename	Attribute	mealType	Meal Type Name.
@mealtypecode	Attribute	mealType	Meal Type Internal Code.
meal	Element	mealType	Groups together details of one specific meal
@runno	Attribute	meal	Running Number starting from 0.
@applicablefor	Attribute	meal	Specifies if this meal (and its price) is applicable for adults or children. Possible values:
adult
child
@startage	Attribute	meal	If @applicablefor is child this attribute will indicate from what age this meal is applicable
@endage	Attribute	meal	If @applicablefor is child this attribute will indicate upto what age this meal is applicable
mealCode	Element	meal	Internal Code for the Meal
mealName	Element	meal	Name of the Meal
mealPrice	Element	meal	Meal price.
formatted	Element	mealPrice	This element contains the meal price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
selectedExtraMeals	Element	product	Encapsulates information about booked extra meals grouped by dates and passengers.
mealPlanDate	Element	selectedExtraMeals	Groups extra meals per a specific date.
@mealplandatetime	Attribute	mealPlanDate	Meal plan date in YYYY-MM-DD format.
mealPlan	Element	mealPlanDate	Encapsulates details about one meal plan for one passenger.
@runno	Attribute	mealPlan	Running number starting from 0.
@mealscount	Attribute	mealPlan	Number of meals for this passenger.
@applicablefor	Attribute	mealPlan	Specifies if this meal plan is for an adult passenger or a child.
@childage	Attribute	mealPlan	Specifies the age of the child passenger.
@ispassenger	Attribute	mealPlan	Fixed value 1.
@passengernumber	Attribute	mealPlan	Specified the passenger number this meal plan was booked for.
meal	Element	mealPlan	Encapsultes details about a booked meal.
@runno	Attribute	meal	Running number starting from 0.
code	Element	meal	Meal Internal code.
units	Element	meal	Number of meals included in this meal plan (for this passenger).
mealTypeCode	Element	meal	Meal Type Internal code.
mealPrice	Element	meal	Meal price.
formatted	Element	mealPrice	This element contains the meal price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
mealTypeName	Element	meal	Meal type name.
mealName	Element	meal	Meal Name
bookedMealCode	Element	meal	Booked Meal internal code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
 

getbookingdetails_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:choice>  
                <xs:element name="itinerary"  type="itineraryType" minOccurs="0"  maxOccurs="1"></xs:element>  
                <xs:element name="product"  type="productType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
            </xs:choice>  
            <xs:element name="successful"  type="trueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getbookingdetails"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="sip"  type="dotwIP" use="optional"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="itineraryType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:integer"></xs:element>  
            <xs:element name="itineraryReferenceNumber"  type="xs:string"></xs:element>  
            <xs:element name="containing"  type="containingType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="containingType">  
        <xs:sequence>  
            <xs:element name="product"  type="productType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="productType">  
        <xs:all>  
            <xs:element name="rateBases"  type="rateBasesType"></xs:element>  
            <xs:element name="beddingPreferences"  type="beddingPreferencesType"></xs:element>  
            <xs:element name="specialRequests"  type="specialRequestsType"></xs:element>  
            <xs:element name="salutations"  type="salutationsType"></xs:element>  
            <xs:element name="booked"  type="yesOrNo"  maxOccurs="1"></xs:element>  
            <xs:element name="code"  type="xs:integer"  maxOccurs="1"></xs:element>  
            <xs:element name="bookingReferenceNumber"  type="xs:string"></xs:element>  
            <xs:element name="supplierConfirmation"  type="xs:string"></xs:element>  
            <xs:element name="servicePrice"  type="servicePriceType"></xs:element>  
            <xs:element name="totalTaxes"  type="serviceTaxPriceType" minOccurs="0"></xs:element>  
            <xs:element name="totalFee"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="currency"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="currencyShort"  type="currencyShortType"></xs:element>  
            <xs:element name="paymentGuaranteedBy"  type="xs:string"></xs:element>  
            <xs:element name="emergencyContacts"  type="emergencyContactsType"></xs:element>  
            <xs:element name="invoiced"  type="xs:boolean"></xs:element>  
            <xs:element name="status"  type="statusType"></xs:element>  
            <xs:element name="service"  type="xs:string"></xs:element>  
            <xs:element name="serviceId"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="serviceName"  type="xs:string"></xs:element>  
            <xs:element name="adults"  type="adultsCodeType"></xs:element>  
            <xs:element name="children"  type="childrenType"></xs:element>  
            <xs:element name="beddingPreference"  type="beddingPreferenceType"></xs:element>  
            <xs:element name="actualAdults"  type="adultsCodeType"></xs:element>  
            <xs:element name="actualChildren"  type="actualChildType"></xs:element>  
            <xs:element name="productSpecialRequests"  type="productSpecialRequestsType"></xs:element>  
            <xs:element name="cancellationRules"  type="cancellationRulesType"></xs:element>  
            <xs:element name="serviceLocation"  type="xs:string"></xs:element>  
            <xs:element name="cancel"  type="yesOrNo"  maxOccurs="1"></xs:element>  
            <xs:element name="allowAmmend"  type="yesOrNo"  maxOccurs="1"></xs:element>  
            <xs:element name="onRequest"  type="yesOrNo"  maxOccurs="1"></xs:element>  
            <xs:element name="customerReference"  type="xs:string"  maxOccurs="1"></xs:element>  
            <xs:element name="passengersDetails"  type="passengersDetailsType"></xs:element>  
            <xs:element name="extraMeals"  type="extraMealsType"></xs:element>  
            <xs:element name="rateType"  type="rateTypeType" minOccurs="0"></xs:element>  
            <xs:element name="from"  type="xs:date"></xs:element>  
            <xs:element name="to"  type="xs:date"></xs:element>  
            <xs:element name="numberOfNights"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="fromShort"  type="xs:string"></xs:element>  
            <xs:element name="toShort"  type="xs:string"></xs:element>  
            <xs:element name="roomTypeCode"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="rateBasis"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="roomName"  type="xs:string"></xs:element>  
            <xs:element name="extraBed"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="paymentMode"  type="xs:string"  fixed="CC" minOccurs="0"></xs:element>  
            <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
            <xs:element name="voucher"  type="xs:string"></xs:element>  
            <xs:element name="roomInfo"  type="roomInfoType"></xs:element>  
            <xs:element name="roomCapacityInfo"  type="roomCapacityInfoType"></xs:element>  
            <xs:element name="roomCategory"  type="xs:string"></xs:element>  
            <xs:element name="dates"  type="datesType"></xs:element>  
            <xs:element name="penaltiesApplied"  type="penaltiesAppliedType" minOccurs="0"></xs:element>  
            <xs:element name="additionalServicesRelatedInformation"  type="additionalServicesRelatedInformationType" minOccurs="0"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="customeracceptance"  type="tORf" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="beddingPreferenceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="roomCapacityInfoType">  
        <xs:sequence>  
            <xs:element name="roomPaxCapacity"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="allowedAdultsWithoutChildren"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="allowedAdultsWithChildren"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="allowedChildren"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="maxExtraBed"  type="oneOrZero"></xs:element>  
            <xs:element name="allowTwin"  type="oneOrZero"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="tORf">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="t|f"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no|Yes|No"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="servicePriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="serviceTaxPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="feeIncluded"  type="trueOrFalse"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="emergencyContactsType">  
        <xs:sequence>  
            <xs:element name="emergencyContact"  type="emergencyContactType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="emergencyContactType">  
        <xs:sequence>  
            <xs:element name="salutation"  type="salutationType"></xs:element>  
            <xs:element name="fullName"  type="xs:string"></xs:element>  
            <xs:element name="phone"  type="phoneType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="statusType">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="1665|1666|1667|1668|1669|1707|1708"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="salutationType">  
        <xs:simpleContent>  
            <xs:extension base="xs:string">  
                <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="childrenType">  
        <xs:sequence>  
            <xs:element name="child"  type="childType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="actualChildType">  
        <xs:sequence>  
            <xs:element name="actualChild"  type="childType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="childType" mixed="true">  
        <xs:attribute name="runno"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBasesType">  
        <xs:sequence>  
            <xs:element name="option"  type="selectedOptionType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="beddingPreferencesType">  
        <xs:sequence>  
            <xs:element name="option"  type="selectedOptionType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="selectedOptionType" mixed="true">  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="selected"  type="xs:string"  fixed="selected"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="specialRequestsType">  
        <xs:sequence>  
            <xs:element name="option"  type="selectedOptionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="optionType" mixed="true">  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="salutationsType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="productSpecialRequestsType">  
        <xs:sequence>  
            <xs:element name="specialRequest"  type="specialRequestType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="specialRequestType" mixed="true">  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="cancellationRulesType">  
        <xs:sequence>  
            <xs:element name="rule"  type="ruleType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="ruleType">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="fromDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="amendRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="cancelRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="charge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="cancelCharge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="amendCharge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="noShowPolicy"  type="trueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="passengersDetailsType">  
        <xs:sequence>  
            <xs:element name="passenger"  type="passengerType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="passengerType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="salutation"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="firstName"  type="xs:string"></xs:element>  
            <xs:element name="lastName"  type="xs:string"></xs:element>  
            <xs:element name="passengerNationality"  type="passengerNationalityType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="leading"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="passengerNationalityType">  
        <xs:simpleContent>  
            <xs:extension base="xs:string">  
                <xs:attribute name="code"  type="xs:positiveInteger"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="extraMealsType">  
        <xs:sequence>  
            <xs:element name="mealDate"  type="mealDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealDateType">  
        <xs:sequence>  
            <xs:element name="mealType"  type="mealTypeType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="wdayType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="wdayType">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="[0-6]{1}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="mealTypeType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealComplexType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealtypename"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="mealtypecode"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealComplexType">  
        <xs:sequence>  
            <xs:element name="mealCode"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="mealName"  type="xs:string"></xs:element>  
            <xs:element name="mealPrice"  type="servicePriceType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableforType" use="required"></xs:attribute>  
        <xs:attribute name="startage"  type="xs:unsignedShort"></xs:attribute>  
        <xs:attribute name="endage"  type="xs:unsignedShort"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="applicableforType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="adult|child"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="selectedExtraMealsType">  
        <xs:sequence>  
            <xs:element name="mealPlanDate"  type="mealPlanDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="mealPlanDateType">  
        <xs:sequence>  
            <xs:element name="mealPlan"  type="mealPlanType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealplandatetime"  type="xs:date" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealPlanType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="mealscount"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableforType" use="required"></xs:attribute>  
        <xs:attribute name="childage"  type="xs:unsignedShort"></xs:attribute>  
        <xs:attribute name="ispassenger"  type="xs:integer"  fixed="1"></xs:attribute>  
        <xs:attribute name="passengernumber"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealType">  
        <xs:all>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="units"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="mealTypeCode"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="mealPrice"  type="servicePriceType"></xs:element>  
            <xs:element name="mealTypeName"  type="xs:string"></xs:element>  
            <xs:element name="mealName"  type="xs:string"></xs:element>  
            <xs:element name="bookedMealCode"  type="xs:string"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomInfoType">  
        <xs:sequence>  
            <xs:element name="maxOccupancy"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="maxAdultWithChildren"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="minChildAge"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="maxChildAge"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="maxAdult"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="maxExtraBed"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="allowTwin"  type="oneOrZero" minOccurs="0"></xs:element>  
            <xs:element name="maxChildren"  type="xs:unsignedShort"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="oneOrZero">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="0|1"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="phoneType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[ +]?[0-9]*[/]?[0-9]*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="rateTypeType">  
        <xs:simpleContent>  
            <xs:extension base="rateTypeRestriction">  
                <xs:attribute name="nonrefundable"  type="xs:string"  fixed="yes" use="optional"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:simpleType name="rateTypeRestriction">  
        <xs:restriction base="xs:integer">  
            <xs:minInclusive value="1"></xs:minInclusive>  
            <xs:maxInclusive value="2"></xs:maxInclusive>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="datesType">  
        <xs:sequence>  
            <xs:element name="date"  type="dateType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="dateType">  
        <xs:all>  
            <xs:element name="price"  type="servicePriceType"></xs:element>  
            <xs:element name="freeStay"  type="yesOrNo"></xs:element>  
            <xs:element name="dayOnRequest"  type="oneOrZero"></xs:element>  
            <xs:element name="including"  type="includingType"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includingType">  
        <xs:all>  
            <xs:element name="includedSupplement"  type="includedSupplementType" minOccurs="0"></xs:element>  
            <xs:element name="includedMeal"  type="includedMealType" minOccurs="0"></xs:element>  
            <xs:element name="includedAdditionalService"  type="includedAdditionalServiceType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedSupplementType">  
        <xs:sequence>  
            <xs:element name="supplementName"  type="xs:string"></xs:element>  
            <xs:element name="description"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedAdditionalServiceType">  
        <xs:sequence>  
            <xs:element name="serviceId"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="serviceName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedMealType">  
        <xs:sequence>  
            <xs:element name="mealName"  type="xs:string"></xs:element>  
            <xs:element name="type">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="penaltiesAppliedType">  
        <xs:sequence>  
            <xs:element name="penaltyApplied"  type="penaltyAppliedType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="penaltyAppliedType">  
        <xs:all>  
            <xs:element name="dateApplied"  type="dotwDateType"></xs:element>  
            <xs:element name="value"  type="servicePriceType"></xs:element>  
            <xs:element name="currency"  type="xs:unsignedInt"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="type"  type="penaltyType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="penaltyType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="amend|cancel"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="additionalServicesRelatedInformationType">  
        <xs:sequence>  
            <xs:element name="additionalServiceRelatedInformation"  type="additionalServiceRelatedInformationType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="additionalServiceRelatedInformationType">  
        <xs:sequence>  
            <xs:element name="information"  type="informationType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="serviceid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="informationType">  
        <xs:sequence>  
            <xs:element name="answer"  type="xs:string" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeesType">  
        <xs:sequence>  
            <xs:element name="propertyFee"  type="propertyFeeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeeType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="currencyshort"  type="currencyShortType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="includedinprice"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Book Itinerary
A saved itinerary can be confirmed at a later time. In order to do this you must use the bookitinerary command.

The confirmation of a saved itinerary is a process made in two steps. After the first step (bookitinerary with confirm no) the system will return the corresponding details of each service of the itinerary - if it can be booked, the actual prices, etc. The second step requires another bookitinerary request that specifies the confirmation (confirm yes).

For credit card customers the confirmation of a saved itinerary is a three steps process. Like for the credit clients, in the first step (bookitinerary with confirm=no) our system will return the corresponding details of each service of the itinerary. 
The second step of the confirmation process (bookitinerary with confirm=preauth) will authorize the transaction with the credit card processor and the xml response will indicate if the transaction will be 3DS or non-3DS.
By posting the the third step (bookitinerary with confirm=yes) the reservation will be finalized. The complete credit card payment flow is detailed at Credit card payment section.
General Request
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <request command="bookitinerary">  
        <bookingdetails>  
            <bookingtype></bookingtype>  
            <bookingcode></bookingcode>  
            <confirm></confirm>  
            <sendCommunicationTo></sendCommunicationTo>  
            <testPricesAndAllocation>  
                <service referencenumber="">  
                    <testPrice></testPrice>  
                    <allocationDetails></allocationDetails>  
                </service>  
            </testPricesAndAllocation>  
            <creditCardPaymentDetails>  
                <paymentMethod></paymentMethod>  
                <usedCredit></usedCredit>  
                <creditCardCharge></creditCardCharge>  
                <creditCardDetails>  
                    <token></token>  
                    <avsDetails>  
                        <avsFirstName></avsFirstName>  
                        <avsLastName></avsLastName>  
                        <avsAddress></avsAddress>  
                        <avsZip></avsZip>  
                        <avsCountry></avsCountry>  
                        <avsCity></avsCity>  
                        <avsEmail></avsEmail>  
                        <avsPhone></avsPhone>  
                    </avsDetails>  
                    <orderCode></orderCode>  
                    <authorisationId></authorisationId>  
                </creditCardDetails>  
                <devicePayload></devicePayload>  
                <endUserIPv4Address></endUserIPv4Address>  
            </creditCardPaymentDetails>  
        </bookingdetails>  
    </request>  
</customer>  
 

Item	Type	Parent	Description	Required
bookingDetails	Element	request	Used to specify details about the request: dates, pax, rooms.	Yes.
bookingType	Element	bookingDetails	Value 2 specifies that the itinerary is a saved one.	Yes.
bookingCode	Element	bookingDetails	Internal itinerary code.	Yes.
confirm	Element	bookingDetails	This element specifies if the customer saw the new prices and he wants to confirm the booking or if he wants to just see new prices. Possible values:
no
preauth (only for cc clients)
yes
Yes.
sendCommunicationTo	Element	bookingDetails	Use this field to send the communication for all the bookings of this itinerary (the confirmation one and all subsequent amendments and cancellations) to a different email address rather than the one of the customer profile. Accepted values: valid email address.	Yes.
testPricesAndAllocation	Element	bookingDetals	Only present in the second and third request. Contains a list with all prices and allocation details received after the first response for each service of the itinerary.	Yes, if confirm value is auth and yes
service	Element	testPricesAndAllocation	Groups the price and allocation details for each service of the itinerary.	Yes, if parent present.
@referencenumber	Attribute	service	Specifies for which service the price and allocation details are applicable. This is the internal saved service code.	Yes, if parent present.
testPrice	Element	service	The price received after the first request for the service specified in service@id attribute.	Yes, fi parent present.
allocationDetails	Element	service	Allocation details received in the previous bookitinerary step's xml response for the service specified in service@id attribute.	Yes, if parent present.
creditCardPaymentDetails	Element	bookingDetails	Only present in the second and third request. Contains the information about the credit card and as well about the credit card owner.	Yes, if customer is registered as credit card customer.
paymentMethod	Element	creditCardPaymentDetails	Only present in the second and third request. Depending on the payment method can have 2 possible values:
CC_PAYMENT_NET
CC_PAYMENT_COMMISSIONABLE
Yes, if parent present.
usedCredit	Element	creditCardPaymentDetails	 	Yes, if parent present.
creditCardCharge	Element	creditCardPaymentDetails	The amount of money that will be charged.	Yes, if parent present.
creditCardDetails	Element	creditCardPaymentDetails	Contains information about the credit card	Yes, if parent present.
token	Element	creditCardDetails	Present only in the bookitinerary with confirm=preauth, it will be populated with a string token received by JS from the cc processing entity.	Yes, if parent present.
avsDetails	Element	creditCardDetails	Present in bookitinerary with confirm=preauth. Contains information about the person claiming to own the credit card.	Yes, if parent present.
avsFirstName	Element	avsDetails	Contains the first name of the credit card holder	Yes, if parent present.
avsLastName	Element	avsDetails	Contains the last name of the credit card holder	Yes, if parent present.
avsLastName	Element	avsDetails	Contains the last name of the credit card holder	Yes, if parent present.
avsAddress	Element	avsDetails	Contains the address of the credit card holder	Yes, if parent present.
avsZip	Element	avsDetails	Contains the zip code of the credit card holder	Yes, if parent present.
avsCountry	Element	avsDetails	Contains the ISO country code of the credit card holder	Yes, if parent present.
avsCity	Element	avsDetails	Contains the city of the credit card holder	Yes, if parent present.
avsEmail	Element	avsDetails	Contains the email of the credit card holder	Yes, if parent present.
avsPhone	Element	avsDetails	Contains the phone of the credit card holder	Yes, if parent present.
orderCode	Element	creditCardDetails	Present in bookitinerary with confirm=yes. Contains the order code returned by our system in the bookitinerary with confirm=preauth xml response.	Yes, if parent present.
authorisationId	Element	creditCardDetails	Present in bookitinerary with confirm=yes. Contains the authorisation ID generated from the credit card processing entity.	Yes, if parent present.
devicePayload	Element	creditCardPaymentDetails	Present in bookitinerary with confirm=preauth. Contains fraud payload collected by Java Script. (please check 'Java Script' section for additional details.	Yes, if parent present.
endUserIPv4Address	Element	creditCardPaymentDetails	Present in bookitinerary with confirm=preauth. Contains IP address of the end user	Yes, if parent present.
 

bookitinerary.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:all>  
            <xs:element name="bookingDetails">  
                <xs:complexType>  
                    <xs:sequence>  
                        <xs:group ref="bookingTypeAndCode" minOccurs="1"></xs:group>  
                        <xs:element name="confirm"  type="confirmType" minOccurs="1"  maxOccurs="1"></xs:element>  
                        <xs:element name="sendCommunicationTo"  type="validEmailType" minOccurs="0"></xs:element>  
                        <xs:element name="testPricesAndAllocation"  type="bookTestPricesAndAllocationType" minOccurs="0"></xs:element>  
                        <xs:element name="creditCardPaymentDetails"  type="creditCardPaymentDetailsType" minOccurs="0"></xs:element>  
                    </xs:sequence>  
                </xs:complexType>  
            </xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="bookitinerary"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
loginDetails.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
general.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="productType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment|transfer"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="bookingTypeType">  
        <xs:restriction base="xs:nonNegativeInteger">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:group name="bookingTypeAndCode">  
        <xs:sequence>  
            <xs:element name="bookingType"  type="bookingTypeType"></xs:element>  
            <xs:element name="bookingCode"  type="xs:nonNegativeInteger"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:simpleType name="confirmType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="no"></xs:enumeration>  
            <xs:enumeration value="yes"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
bookingDetails.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition_rooms" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition_rooms">  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition_rooms" schemaLocation="atomicCondition_rooms.xsd"></xs:import>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/complexCondition_rooms" schemaLocation="complexCondition_rooms.xsd"></xs:import>  
    <xs:complexType name="searchHotelsBookingDetailsType">  
        <xs:sequence>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="rooms"  type="roomsType"></xs:element>  
            <xs:element name="productCodeRequested"  type="xs:integer" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsBookingDetailsType">  
        <xs:sequence>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="rooms"  type="getRoomsRoomsType"></xs:element>  
            <xs:element name="productId"  type="xs:integer"></xs:element>  
            <xs:element name="roomModified"  type="xs:integer" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="confirmBookingBookingDetailsType">  
        <xs:sequence>  
            <xs:element name="parent"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="bookingCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:group ref="addToBookedItnGroup" minOccurs="0"></xs:group>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="productId"  type="xs:integer"></xs:element>  
            <xs:element name="sendCommunicationTo"  type="validEmailType" minOccurs="0"></xs:element>  
            <xs:element name="customerReference"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="rooms"  type="confirmBookingRoomsType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getExtraMealsBookingDetailsType">  
        <xs:sequence>  
            <xs:group ref="bookingDetailsDefaultGroup"></xs:group>  
            <xs:element name="productId"  type="xs:integer"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="addToBookedItnGroup">  
        <xs:sequence>  
            <xs:element name="addToBookedItn"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="bookedItnParent"  type="xs:nonNegativeInteger"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ###############################################  -->  
    <xs:group name="bookingDetailsDefaultGroup">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType"></xs:element>  
            <xs:element name="currency"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="commission"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ###############################################  -->  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10,11}|2[0-9]{3,3}-(0[1-9]|[1][0-2])-(0[1-9]|[1-2][0-9]|3[0-1])"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="roomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="roomType"  maxOccurs="100"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsRoomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="getRoomsRoomType"  maxOccurs="100"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsReturnType">  
        <xs:sequence>  
            <xs:element name="filters" minOccurs="0">  
                <xs:complexType>  
                    <xs:sequence>  
                        <xs:element name="rateTypes"  type="rateTypesType" minOccurs="0"></xs:element>  
                        <xs:element ref="c:condition" minOccurs="0"></xs:element>  
                    </xs:sequence>  
                </xs:complexType>  
            </xs:element>  
            <xs:element name="fields" minOccurs="0">  
                <xs:complexType>  
                    <xs:choice minOccurs="1"  maxOccurs="unbounded">  
                        <xs:element name="field"  type="oldRoomFieldValue"></xs:element>  
                        <xs:element name="roomField"  type="roomFieldValue"></xs:element>  
                    </xs:choice>  
                </xs:complexType>  
                <xs:unique name="differentRoomFieldValue">  
                    <xs:selector xpath="roomField"></xs:selector>  
                    <xs:field xpath="field"></xs:field>  
                </xs:unique>  
            </xs:element>  
            <xs:element name="showEmpty"  type="TrueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="confirmBookingRoomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="confirmBookingRoomType"  maxOccurs="100"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="roomOccupancy">  
        <xs:sequence>  
            <xs:element name="adultsCode"  type="adultsCodeType"></xs:element>  
            <xs:element name="children"  type="childrenType"></xs:element>  
            <xs:element name="extraBed"  type="extraBedType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:complexType name="roomType">  
        <xs:sequence>  
            <xs:group ref="roomOccupancy"></xs:group>  
            <xs:element name="rateBasis"  type="xs:integer"></xs:element>  
            <xs:element name="passengerNationality"  type="xs:integer" minOccurs="0"></xs:element>  
            <xs:element name="passengerCountryOfResidence"  type="xs:integer" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="2t"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:attribute name="no">  
        <xs:simpleType>  
            <xs:restriction base="xs:integer">  
                <xs:minInclusive value="0"></xs:minInclusive>  
                <xs:maxInclusive value="4"></xs:maxInclusive>  
            </xs:restriction>  
        </xs:simpleType>  
    </xs:attribute>  
    <!--  ################################################  -->  
    <xs:complexType name="childrenType">  
        <xs:sequence>  
            <xs:element minOccurs="0"  maxOccurs="4" name="child"  type="childType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="no"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="childType">  
        <xs:simpleContent>  
            <xs:extension base="childAge">  
                <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="childAge">  
        <xs:restriction base="xs:integer">  
            <xs:minInclusive value="1"></xs:minInclusive>  
            <xs:maxInclusive value="12"></xs:maxInclusive>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="extraBedType">  
        <xs:restriction base="xs:integer">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="getRoomsRoomType">  
        <xs:complexContent>  
            <xs:extension base="roomType">  
                <xs:sequence>  
                    <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
                    <xs:element name="roomTypeSelected"  type="roomTypeSelectedType" minOccurs="0"></xs:element>  
                </xs:sequence>  
            </xs:extension>  
        </xs:complexContent>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="confirmBookingRoomType">  
        <xs:sequence>  
            <xs:element name="roomTypeCode"  type="xs:string"></xs:element>  
            <xs:element name="selectedRateBasis"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string"></xs:element>  
            <xs:group ref="roomOccupancy"></xs:group>  
            <xs:element name="passengerNationality"  type="xs:integer" minOccurs="0"></xs:element>  
            <xs:element name="passengerCountryOfResidence"  type="xs:integer" minOccurs="0"></xs:element>  
            <xs:element name="customerReference"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
            <xs:element name="additionalServicesRelatedInformation"  type="additionalServicesRelatedInformationType" minOccurs="0"></xs:element>  
            <xs:element name="passengersDetails"  type="passengersDetailsType" minOccurs="0"></xs:element>  
            <xs:element name="specialRequests"  type="specialRequestsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="updateBookingBookingDetails">  
        <xs:sequence>  
            <xs:group ref="bookingTypeAndCode"></xs:group>  
            <xs:element name="rateBasis"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:group ref="confirmForUpdateGroup"></xs:group>  
            <xs:element name="customerReference"  type="xs:string"></xs:element>  
            <xs:element name="fromDate"  type="dotwDateType"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType"></xs:element>  
            <xs:element name="passengersDetails"  type="passengersDetailsType"></xs:element>  
            <xs:group ref="roomOccupancy"></xs:group>  
            <xs:element name="selectedExtraMeals"  type="selectedExtraMealsType" minOccurs="0"></xs:element>  
            <xs:element name="specialRequests"  type="specialRequestsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="roomTypeSelectedType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:positiveInteger"></xs:element>  
            <xs:element name="selectedRateBasis"  type="selectedRateBasisType"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:simpleType name="selectedRateBasisType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="0"></xs:enumeration>  
            <xs:enumeration value="1331"></xs:enumeration>  
            <xs:enumeration value="1332"></xs:enumeration>  
            <xs:enumeration value="1333"></xs:enumeration>  
            <xs:enumeration value="1334"></xs:enumeration>  
            <xs:enumeration value="1335"></xs:enumeration>  
            <xs:enumeration value="1336"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ###############################################  -->  
    <xs:complexType name="passengersDetailsType">  
        <xs:sequence>  
            <xs:element name="passenger"  type="leadingPassengerType"></xs:element>  
            <xs:element name="passenger"  type="passengerType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="passengerType">  
        <xs:sequence>  
            <xs:element name="salutation"  type="xs:integer"></xs:element>  
            <xs:element name="firstName"  type="xs:string"></xs:element>  
            <xs:element name="lastName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="leading"  type="xs:string"  fixed="no" use="optional"></xs:attribute>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="leadingPassengerType">  
        <xs:sequence>  
            <xs:element name="salutation"  type="xs:integer"></xs:element>  
            <xs:element name="firstName"  type="xs:string"></xs:element>  
            <xs:element name="lastName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="leading"  type="xs:string"  fixed="yes" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="specialRequestsType">  
        <xs:sequence>  
            <xs:element name="req"  maxOccurs="unbounded" minOccurs="0">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:nonNegativeInteger">  
                            <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="selectedExtraMealsType">  
        <xs:sequence>  
            <xs:element name="mealPlanDate"  type="mealPlanDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="mealPlanDateType">  
        <xs:sequence>  
            <xs:element name="mealPlan"  type="mealPlanType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealplandatetime"  type="dotwDateType"></xs:attribute>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="mealPlanType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
        <xs:attribute name="mealscount"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableForType" use="required"></xs:attribute>  
        <xs:attribute name="childage"  type="childAge"></xs:attribute>  
        <xs:attribute name="ispassenger"  type="xs:nonNegativeInteger"  fixed="1" use="required"></xs:attribute>  
        <xs:attribute name="passengernumber"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ##############################################  -->  
    <xs:complexType name="mealType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="mealTypeCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="units"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="mealPrice"  type="xs:decimal" minOccurs="0"></xs:element>  
            <xs:element name="bookedMealCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:simpleType name="applicableForType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="adult"></xs:enumeration>  
            <xs:enumeration value="child"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ###############################################  -->  
    <xs:complexType name="additionalServicesRelatedInformationType">  
        <xs:sequence>  
            <xs:element name="additionalServiceRelatedInformation"  type="additionalServiceRelatedInformationType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="additionalServiceRelatedInformationType">  
        <xs:sequence>  
            <xs:element name="information"  type="informationType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="serviceid"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  ###############################################  -->  
    <xs:complexType name="informationType">  
        <xs:sequence>  
            <xs:element name="answer"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:group name="confirmForUpdateGroup">  
        <xs:sequence>  
            <xs:element name="confirm"  type="confirmType"></xs:element>  
            <xs:element name="testPricesAndAllocation"  type="testPricesAndAllocationType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardPaymentDetails"  type="creditCardPaymentDetailsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:complexType name="creditCardPaymentDetailsType">  
        <xs:sequence>  
            <xs:element name="paymentMethod"  type="paymentMethodType"></xs:element>  
            <xs:element name="usedCredit"  type="positiveDecimal"></xs:element>  
            <xs:element name="creditCardCharge"  type="positiveDecimal"></xs:element>  
            <xs:element name="creditCardDetails"  type="creditCardDetailsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="positiveDecimal">  
        <xs:restriction base="xs:decimal">  
            <xs:minInclusive value="0"></xs:minInclusive>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="paymentMethodType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="CC_PAYMENT_COMMISSIONABLE|CC_PAYMENT_NET"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="creditCardDetailsType">  
        <xs:sequence>  
            <xs:element name="token"  type="requiredTextFieldType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardType"  type="creditCardTypeType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardNumber"  type="creditCardNumberType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardHolderName"  type="requiredTextFieldType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardExpMonth"  type="creditCardExpMonthType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardExpYear"  type="creditCardExpYearType" minOccurs="0"></xs:element>  
            <xs:element name="creditCardCVC"  type="creditCardCVCType" minOccurs="0"></xs:element>  
            <xs:element name="avsDetails"  type="avsDetailsType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="creditCardTypeType">  
        <xs:restriction base="xs:unsignedInt">  
            <xs:pattern value="100|101|102|103|104|105"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardNumberType">  
        <xs:restriction base="xs:long">  
            <xs:pattern value="[0-9]{13,19}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="requiredTextFieldType">  
        <xs:restriction base="xs:string">  
            <xs:minLength value="1"></xs:minLength>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardExpMonthType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="0[1-9]|1[0-2]"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardExpYearType">  
        <xs:restriction base="xs:unsignedInt">  
            <xs:pattern value="2[0-9]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="creditCardCVCType">  
        <xs:restriction base="xs:unsignedInt">  
            <xs:pattern value="[0-9]{3,4}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="avsDetailsType">  
        <xs:sequence>  
            <xs:element name="avsFirstName"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsLastName"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsAddress"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsZip"  type="xs:string"></xs:element>  
            <xs:element name="avsCountry"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsCity"  type="requiredTextFieldType"></xs:element>  
            <xs:element name="avsEmail"  type="validEmailType" minOccurs="0"></xs:element>  
            <xs:element name="avsPhone"  type="xs:string" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="testPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="serviceType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="bookTestPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="serviceType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="serviceType">  
        <xs:sequence>  
            <xs:element name="testPrice"  type="xs:decimal"></xs:element>  
            <xs:element name="penaltyApplied"  type="xs:decimal" minOccurs="0"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string"></xs:element>  
            <xs:element name="paymentBalance"  type="xs:decimal" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="referencenumber"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="cancelTestPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="cancelServiceType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="deleteTestPricesAndAllocationType">  
        <xs:sequence>  
            <xs:element name="service"  type="cancelServiceType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:complexType name="cancelServiceType">  
        <xs:sequence>  
            <xs:element name="penaltyApplied"  type="xs:decimal"></xs:element>  
            <xs:element name="paymentBalance"  type="xs:decimal" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="referencenumber"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <!--  #############################################  -->  
    <xs:simpleType name="validEmailType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="oldRoomFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="leftToSell"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="roomFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="roomAmenities"></xs:enumeration>  
            <xs:enumeration value="name"></xs:enumeration>  
            <xs:enumeration value="roomInfo"></xs:enumeration>  
            <xs:enumeration value="twin"></xs:enumeration>  
            <xs:enumeration value="specials"></xs:enumeration>  
            <xs:enumeration value="minStay"></xs:enumeration>  
            <xs:enumeration value="dateApplyMinStay"></xs:enumeration>  
            <xs:enumeration value="cancellation"></xs:enumeration>  
            <xs:enumeration value="tariffNotes"></xs:enumeration>  
            <xs:enumeration value="freeStay"></xs:enumeration>  
            <xs:enumeration value="dayOnRequest"></xs:enumeration>  
            <xs:enumeration value="lookedForText"></xs:enumeration>  
            <xs:enumeration value="leftToSell"></xs:enumeration>  
            <xs:enumeration value="dailyMinStay"></xs:enumeration>  
            <xs:enumeration value="including"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="rateFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="status"></xs:enumeration>  
            <xs:enumeration value="rateType"></xs:enumeration>  
            <xs:enumeration value="allowsExtraMeals"></xs:enumeration>  
            <xs:enumeration value="allowsSpecialRequests"></xs:enumeration>  
            <xs:enumeration value="passengerNamesRequiredForBooking"></xs:enumeration>  
            <xs:enumeration value="allocationDetails"></xs:enumeration>  
            <xs:enumeration value="cancellationRules"></xs:enumeration>  
            <xs:enumeration value="withinCancellationDeadline"></xs:enumeration>  
            <xs:enumeration value="isBookable"></xs:enumeration>  
            <xs:enumeration value="onRequest"></xs:enumeration>  
            <xs:enumeration value="total"></xs:enumeration>  
            <xs:enumeration value="dates"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:complexType name="rateTypesType">  
        <xs:sequence>  
            <xs:element name="rateType" minOccurs="1"  maxOccurs="3">  
                <xs:simpleType>  
                    <xs:restriction base="xs:integer">  
                        <xs:enumeration value="1"></xs:enumeration>  
                        <xs:enumeration value="2"></xs:enumeration>  
                        <xs:enumeration value="3"></xs:enumeration>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ############################################################  -->  
</xs:schema>  
General Response
<result command="bookitinerary" date="">  
    <product runno="" code=""  type="" servicename="">  
        <available></available>  
        <servicePrice>Service (Hotel / Apartment) Price <formatted></formatted>  
</servicePrice>  
        <mealsPrice>Extra Meals Price <formatted></formatted>  
</mealsPrice>  
        <price>Total Booking Cost <formatted></formatted>  
</price>  
        <totalFee>Total Fee Amount <formatted></formatted>  
</totalFee>  
        <propertyFees count="">  
            <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">Fee amount in rate currency <formatted></formatted>  
</propertyFee>  
        </propertyFees>  
        <currency></currency>  
        <currencyShort></currencyShort>  
        <fromShort></fromShort>  
        <toShort></toShort>  
        <onRequest></onRequest>  
        <minStay>  
            <min></min>  
            <from></from>  
            <to></to>  
        </minStay>  
    </product>  
    <confirmationText></confirmationText>  
    <returnedCode></returnedCode>  
    <bookings>  
        <booking runno="">  
            < type></ type>  
            <bookingStatus></bookingStatus>  
            <bookingCode></bookingCode>  
            <bookingReferenceNumber></bookingReferenceNumber>  
            <servicePrice> Service (Hotel) Price <formatted></formatted>  
</servicePrice>  
            <mealsPrice>Extra Meals Price <formatted></formatted>  
</mealsPrice>  
            <price>Total Booking Cost <formatted></formatted>  
</price>  
            <totalFee>Total Fee Amount <formatted></formatted>  
</totalFee>  
            <propertyFees count="">  
                <propertyFee runno="" currencyid="" currencyshort="" name="" description="" includedinprice="">Fee amount in rate currency <formatted></formatted>  
</propertyFee>  
            </propertyFees>  
            <currency></currency>  
        </booking>  
    </bookings>  
    <successful></successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Element	result	The command for which the result is shown.
threeDSData	Element	result	Contains information about credit card 3DS details.
initiate3DS	Element	threeDSData	
Indicates if the transaction is 3DS or non-3DS transaction. Possible values:
0 (non-3DS)
1 (3DS)
token	Element	threeDSData	Populated with 3DS token from credit card entity if the transaction is 3DS(initiate3DS=1). If the transaction is a non-3DS one, the tag will be returned as empty.
status	Element	threeDSData	
Possible values:
CHALLENGE_PENDING
NON_3DS
orderCode	Element	threeDSData	Webbeds/DotW order code.
authorisationId	Element	threeDSData	Authorisation Id.
product	Element	result	Contains details about a service of the itinerary. For each service in the itinerary one product element will be returned.
@runno	Attribute	product	Running number starting from 0.
@code	Attribute	product	Internal service code.
@type	Attribute	product	Service type. Possible values:
Hotel
Apartment
@servicename	Attribute	product	Service name.
available	Element	product	Specifies if the service is available and can be booked.
servicePrice	Element	booking	ServicePrice indicates the breakup in price for Room (excluded meal supplements)
formatted	Element	servicePrice	This element contains the service price formatted as per the customer preference (decimal places, thousand separator, decimal separator).
mealsPrice	Element	booking	MealsPrice indicates the breakup in price for meals (excluded Room rate)
formatted	Element	mealsPrice	This element contains the meals price formatted as per the customer preference (decimal places, thousand separator, decimal separator).
price	Element	booking	Total payable for this booking (including rooms and meals).
formatted	Element	price	This element contains the total price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalTaxes	Element	product	If present, this element contains the total taxes that are included in total rate price in rate currency.
formatted	Element	totalTaxes	This element contains the total taxes included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
@feeIncluded	Attribute	totalTaxes	If present and value is True, this attribute specifies that fee amount is included in total tax amount and totalFee element will not be present
totalFee	Element	product	If present, this element contains the total fee amount that is included in total rate price in rate currency
formatted	Element	totalFee	This element contains the total fee amount included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the rate currency.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the rate currency.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
formatted	Element	propertyFee	This element contains the fee amount, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
currency	Element	product	Internal code for the currency in which the prices are displayed.
currencyShort	Element	product	Specifies the shortening for the currency used to display the price.
fromShort	Element	product	Starting date of the service in DOTW format.
toShort	Element	product	Ending date of the service in DOTW format.
onRequest	Element	product	Specifies if the service is on request or not. Possible values:
0
1
minStay	Element	product	Used for hotels and apartments to specify if the service requires a minimum staying for the period it will be booked for.
min	Element	minStay	Specifies the minimum staying,
from	Element	minStay	Specifies the starting date of the min stay.in DOTW format.
to	Element	minStay	Specifies the ending date of the min stay in DOTW format.
confirmationText	Element	result	Confirmation text for the itinerary in a HTML format. This element will be returned only if the request was posted with confirm value Yes.
returnedCode	Element	result	Confirmed itinerary code. This element will be returned only if the request was posted with confirm value Yes.
bookings	Element	result	Encapsulates a list with all the services booked under this itinerary. This element and all its siblings will be returned only if the request was posted with confirm value Yes.
booking	Element	bookings	Encapsulates information about a booked services.
@runno	Attribute	booking	Running number starting from 0.
bookingStatus	Element	booking	Specifies the status of the Booking. Indicates whether the booking is confirmed on request. Possible values:
1 - onrequest
2 - confirmed
bookingCode	Element	booking	Specifies the internal code of the booking. This will be different from the internal code of the saved service and it will be the internal code used to further process the booking.
bookingReferenceNumber	Element	booking	The confirmation number generated by DOTWconnect server. This will be a unique number generated by the system under which our service providers will record this booking.
servicePrice	Element	booking	ServicePrice indicates the breakup in price for Room (excluded meal supplements)
formatted	Element	servicePrice	This element contains the service price formatted as per the customer preference (decimal places, thousand separator, decimal separator).
mealsPrice	Element	booking	MealsPrice indicates the breakup in price for meals (excluded Room rate)
formatted	Element	mealsPrice	This element contains the meals price formatted as per the customer preference (decimal places, thousand separator, decimal separator).
price	Element	booking	Total payable for this booking (including rooms and meals).
formatted	Element	price	This element contains the total price formatted as per the customer preference (decimal places, thousand separator, decimal separator)
totalTaxes	Element	product	If present, this element contains the total taxes that are included in total rate price in rate currency.
formatted	Element	totalTaxes	This element contains the total taxes included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
@feeIncluded	Attribute	totalTaxes	If present and value is True, this attribute specifies that fee amount is included in total tax amount and totalFee element will not be present
totalFee	Element	product	If present, this element contains the total fee amount that is included in total rate price in rate currency
propertyFees	Element	rateBasis	If present, this element contains the list of property fees applicable for current hotel.
@count	Attribute	propertyFees	Specifies the number of property fees.
propertyFee	Element	propertyFees	Contains details about a specific property fee.
@runno	Attribute	propertyFee	Running serial number starting from 0.
@currencyid	Attribute	propertyFee	Internal code of the currency in which the prices for this property fee are defined.
@currencyshort	Attribute	propertyFee	The 3 letter code which identifies the currency in which the property fee are defined.
@name	Attribute	propertyFee	Property fee type name.
@description	Attribute	propertyFee	A short text description of the property fee. Either they are already included in the rate or it is paid on the spot by final customer.
@includedinprice	Attribute	propertyFee	Indicates whether the fee amount(converted into rate currency) is included or not in the total price.
Possible values:
Yes
No(to be paid on the spot)
formatted	Element	propertyFee	This element contains the fee amount, formatted as per the customer preference (decimal places, thousand separator, decimal separator).
formatted	Element	totalFee	This element contains the total fee amount included in total price, formatted as per the customer preference (decimal places, thousand separator, decimal separator)
currency	Element	booking	The internal code for the Currency in which the rates are calculated.
successful	Element	product	Specifies if the request was successfully porcessed.
 

bookitinerary_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="currencyShort"  type="currencyShortType"></xs:element>  
            <xs:element name="product"  type="productType"  maxOccurs="unbounded"></xs:element>  
            <xs:element name="confirmationText"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="returnedCode"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="bookings"  type="bookingsType" minOccurs="0"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="bookItineraryType" use="required"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="productType">  
        <xs:all>  
            <xs:element name="cancellationRules"  type="cancellationRulesType" minOccurs="0"></xs:element>  
            <xs:element name="withinCancellationDeadline"  type="yesOrNo" minOccurs="0"></xs:element>  
            <xs:element name="available"  type="trueOrFalse"></xs:element>  
            <xs:element name="servicePrice"  type="formattedPriceType" minOccurs="0"></xs:element>  
            <xs:element name="mealsPrice"  type="formattedPriceType" minOccurs="0"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="dates"  type="datesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="price"  type="formattedPriceType"></xs:element>  
            <xs:element name="totalTaxes"  type="serviceTaxPriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="totalFee"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="currencyShort"  type="currencyShortType" minOccurs="0"></xs:element>  
            <xs:element name="fromShort"  type="xs:string"></xs:element>  
            <xs:element name="toShort"  type="xs:string"></xs:element>  
            <xs:element name="onRequest"  type="oneOrZero"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="type"  type="typeType" use="required"></xs:attribute>  
        <xs:attribute name="servicename"  type="xs:string"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="datesType">  
        <xs:sequence>  
            <xs:element name="date"  type="dateType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="dateType">  
        <xs:all>  
            <xs:element name="price"  type="servicePriceType"></xs:element>  
            <xs:element name="priceMinimumSelling"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="priceInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="priceMinimumSellingInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="freeStay"  type="yesOrNo"></xs:element>  
            <xs:element name="dayOnRequest"  type="oneOrZero"></xs:element>  
            <xs:element name="including"  type="includingType"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includingType">  
        <xs:all>  
            <xs:element name="includedSupplement"  type="includedSupplementType" minOccurs="0"></xs:element>  
            <xs:element name="includedMeal"  type="includedMealType" minOccurs="0"></xs:element>  
            <xs:element name="includedAdditionalService"  type="includedAdditionalServiceType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedSupplementType">  
        <xs:sequence>  
            <xs:element name="supplementName"  type="xs:string"></xs:element>  
            <xs:element name="description"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedAdditionalServiceType">  
        <xs:sequence>  
            <xs:element name="serviceId"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="serviceName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedMealType">  
        <xs:sequence>  
            <xs:element name="mealName"  type="xs:string"></xs:element>  
            <xs:element name="type">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no|Yes|No"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="formattedPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="cancellationRulesType">  
        <xs:sequence>  
            <xs:element name="rule"  type="ruleType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="ruleType">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="fromDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="amendRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="cancelRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="noShowPolicy"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="amendCharge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="cancelCharge"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="charge"  type="servicePriceType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="oneOrZero">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="0|1"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="typeType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment|tour|transfer"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="bookItineraryType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="bookitinerary|confirmbooking"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="bookingsType">  
        <xs:sequence>  
            <xs:element name="booking"  type="bookingType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="bookingType">  
        <xs:sequence>  
            <xs:element name="bookingCode"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="bookingReferenceNumber"  type="xs:string"></xs:element>  
            <xs:element name="bookingStatus"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="servicePrice"  type="servicePriceType"></xs:element>  
            <xs:element name="mealsPrice"  type="servicePriceType"></xs:element>  
            <xs:element name="price"  type="servicePriceType"></xs:element>  
            <xs:element name="totalTaxes"  type="serviceTaxPriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="totalFee"  type="servicePriceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="propertyFees"  type="propertyFeesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="currency"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="type"  type="xs:string"></xs:element>  
            <xs:element name="voucher"  type="xs:string"></xs:element>  
            <xs:element name="paymentGuaranteedBy"  type="xs:string"></xs:element>  
            <xs:element name="emergencyContacts"  type="emergencyContactsType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="servicePriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="serviceTaxPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="feeIncluded"  type="trueOrFalse"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="emergencyContactsType">  
        <xs:sequence>  
            <xs:element name="emergencyContact"  type="emergencyContactType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="emergencyContactType">  
        <xs:sequence>  
            <xs:element name="salutation">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
            <xs:element name="fullName"  type="xs:string"></xs:element>  
            <xs:element name="phone"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeesType" mixed="true">  
        <xs:sequence>  
            <xs:element name="propertyFee"  type="propertyFeeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="propertyFeeType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="currencyshort"  type="currencyShortType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="includedinprice"  type="yesOrNo" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Re-confirm booking process
The new feature has the purpose to enhance our customers experience, by providing alternative offers in cases when DOTW receive from its suppliers different conditions in the confirmation step.
Therefore, instead of only returning an error message in such cases, the re-confirmation process will provide additional details about the new booking conditions, offering to our customers the possibility to finalize the booking.

The bookItinerary response will still return an error Code and error message, but in addition to this, the extraDetails tag will contain the new booking conditions.

important: For those customers who are interested to implement the re-confirmation process logic, it is mandatory to add in the bookItinerary request a new tag: <returnReconfirm>. Additional details can be found under Hotel Comm Structure -> BookItinerary -> General Request section.

It is mandatory that in the new bookItinerary request, the customer will use the allocationDetails token generated in the extraDetails tag, as this encapsulates the new booking conditions.

<response>  
    <request>  
        <successful>FALSE</successful>  
        <error>  
            <class>GeneralRequestBookItinerary</class>  
            <code>151</code>  
            <details>Unable to confirm the booking due to a rate change from supplier</details>  
            <extraDetails>  
                <products no="2">  
                    <product runno="0" haserror="true" changed="price">  
                        <currencyShort>USD</currencyShort>  
                        <code>3509 <!--  room type code -->  
</code>  
                        <referencenumber>1081364085 <!-- saved booking code -->  
</referencenumber>  
                        <selectedRateBasis>0</selectedRateBasis>  
                        <allocationDetails>1526716226000001B1011B0</allocationDetails>  
                        <price>44.267408421958 <formatted>44.267408421958</formatted>  
</price>  
                        <cancellationRules count="3">  
                            <rule runno="0">  
                                <toDate>2018-05-23 14:59:59</toDate>  
                                <toDateDetails>Wed, 01 May 2018 14:59:59</toDateDetails>  
                                <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                <charge>0 <formatted>0.00</formatted>  
</charge>  
                            </rule>  
                            <rule runno="1">  
                                <fromDate>2018-05-23 15:00:00</fromDate>  
                                <fromDateDetails>Wed, 01 May 2018 15:00:00</fromDateDetails>  
                                <amendCharge>67.2194 <formatted>67.22</formatted>  
</amendCharge>  
                                <cancelCharge>67.2194 <formatted>67.22</formatted>  
</cancelCharge>  
                                <charge>67.2194 <formatted>67.22</formatted>  
</charge>  
                            </rule>  
                            <rule runno="2">  
                                <fromDate>2018-05-25 00:00:00</fromDate>  
                                <fromDateDetails>Fri, 01 May 2018 00:00:00 / Midnight</fromDateDetails>  
                                <noShowPolicy>true</noShowPolicy>  
                                <charge>67.2194 <formatted>67.22</formatted>  
</charge>  
                            </rule>  
                        </cancellationRules>  
                    </product>  
                    <product runno="1">  
                        <currencyShort>USD</currencyShort>  
                        <code>3509 <!--  room type code -->  
</code>  
                        <referencenumber>1081364095 <!-- saved booking code -->  
</referencenumber>  
                        <selectedRateBasis>0</selectedRateBasis>  
                        <allocationDetails>1526716226000001B1011B0</allocationDetails>  
                        <price>44.267408421958 <formatted>44.267408421958</formatted>  
</price>  
                        <cancellationRules count="3">  
                            <rule runno="0">  
                                <toDate>2018-05-23 14:59:59</toDate>  
                                <toDateDetails>Wed, 01 May 2018 14:59:59</toDateDetails>  
                                <amendCharge>0 <formatted>0.00</formatted>  
</amendCharge>  
                                <cancelCharge>0 <formatted>0.00</formatted>  
</cancelCharge>  
                                <charge>0 <formatted>0.00</formatted>  
</charge>  
                            </rule>  
                            <rule runno="1">  
                                <fromDate>2018-05-23 15:00:00</fromDate>  
                                <fromDateDetails>Wed, 01 May 2018 15:00:00</fromDateDetails>  
                                <amendCharge>67.2194 <formatted>67.22</formatted>  
</amendCharge>  
                                <cancelCharge>67.2194 <formatted>67.22</formatted>  
</cancelCharge>  
                                <charge>67.2194 <formatted>67.22</formatted>  
</charge>  
                            </rule>  
                            <rule runno="2">  
                                <fromDate>2018-05-25 00:00:00</fromDate>  
                                <fromDateDetails>Fri, 01 May 2018 00:00:00 / Midnight</fromDateDetails>  
                                <noShowPolicy>true</noShowPolicy>  
                                <charge>67.2194 <formatted>67.22</formatted>  
</charge>  
                            </rule>  
                        </cancellationRules>  
                    </product>  
                </products>  
            </extraDetails>  
        </error>  
    </request>  
</response>  
Item	Type	Parent	Description
response	Element	root	The root element.
@date	Attribute	response	The unix timestamp date and time when the response has been provided.
@command	Attribute	response	The command for which the response is shown.
request	Element	response	Contains specific data for the unsuccessfull request command.
successful	Element	request	Indicates that the request was not successfully processed.
error	Element	request	Contains information about the error.
code	Element	error	Internal error code.
details	Element	 	Details about the error.
extraDetails	Element	error	Extra details regarding the error.
successful	element	request	Indicates if the response is a successful or a failed one. Possible values
FALSE
TRUE
products	Element	extraDetails	Specifies the number of services under the itinerary.
product	Element	products	Encapsulates the booking conditions for the first service (room).
haserror	attribute	response	Indicates if the confirmation response triggered an error from DOTW server. Fixed value: 'true'
changed	attribute	response	Specifies the reason of the booking failure and which conditions have changed. Possible values:
price
price|cxl
price
currencyshort	element	product	Short currency code in which rates are returned
code	Element	product	DOTW Internal RoomTypeCode for the selected room.
referencenumber	Element	product	DOTW code for the saved booking. To be used in the new bookItinerary request
selectedratebasis	Element	product	DOTW Internal Code for the selected rateBasis
allocationdetails	Element	product	AllocationDetails Token which encapsulates the new booking conditions. To be used in the next confirmbooking request;
price	Element	product	New booking price. The exact value from tag needs to be used in the new bookItinerary request.
cancellationrules	element	product	Encapsulates details about the new cancellation rules
rule	Element	cancellationrules	Indicates the cancellation rule number.
fromdate	Element	rule	Starting date of the rule. From this day forward until toDate (if present), the specified charge will be applied for any cancellations or amendments. If this element is not present then the charge will be applied from the current date until toDate. Date format is: YYYY-MM-DD HH:MM:SS
fromdatedetails	Element	rule	From Date in Weekday Month Day, Year HH:MM:SS format.
amendcharge	Element	rule	Amendment charge that will be applied if booking isamended in the period defined by this rule.
cancelCharge	Element	rule	Cancellation charge that will be applied if booking is canceled in the period defined by this rule.
cancelRestricted	Element	rule	If present, this element indicates that a future cancel (using the cancelbooking or deleteitinerary methods) done in the time period defined by this rule, will not be possible. Fixed value:
TRUE
amendRestricted	Element	rule	If present, this element indicates that a future amendment (using the updatebooking method) done in the time period defined by this rule, will not be possible. Fixed value:
TRUE
noshowpolicy	Element	rule	If present, this element indicates that the presented charge is a no show charge. In this case the elements fromDate, fromDateDetails, toDate, toDateDetails, amendingPossible will be absent. Fixed value:
TRUE
Credit Card Payments via API

 

WebBeds Merchant of Record (MoR) solution, now supports accepting credit card payments, via API. This product can support paymenttransactions with secure 3DS version 2 for additional authentication of the card information during payment transactions, Card tokenization withreliable and intelligent anti-fraud mechanisms to detect fraudulent transactions. WebBeds will be the Merchant of Record, appearing in thecustomer’s credit card statements, for the payments made by Credit Card, for the bookings made by customers using the XML API.
 
Features of MoR solution
 
Supports rules and scored based fraud control mechanism by Accertify.
B2B2C – Reseller model
Customer specific merchant descriptors. Customer sees “Hotel Reservation LOH” along with a phone number in their monthly statements fortheir purchases
Support of card schemes: Master Card, Visa, AMEX, Discover and Diners
Support payments and acceptance of both credit and debit cards
Multiple payment gateway support World Pay, Stripe, Checkout etc.
Supports all 3DS2 payment flows.
 

Credit card payment data flow

 


 

Solution Flow – Visual 1

 


 

Solution Flow – Visual 2

 


MoR Solution – Additional information and technical requirements

Fraud payload and validations in customer’s credit card page
a. The fraud payload will be collected by java script. The customer needs to grab the fraud payload from the JS and pass this to the XML APIparameter called devicePayload. Refer to sample html with fraud payload.
b. The XML API method called as “BookItinerary” accepts both the devicePayload and IP address details.
c. The customer’s implementation is required to pass also, the end-customer’s IP address details to a parameter in the XML API. The parameter name is “endUserIPv4Address” which is available in the XML API method called as “BookItinerary”. Customers can pass their IPv6 address as well in this parameter. This parameter supports taking input of both IPv4 and IPv6 versions of the IP address.
d. The fraud payload JS is provided by Accertify to WebBeds. WebBeds have written a wrapper JS to load Accertify JS. This wrapper JS is hosted inWebBeds CDN. Following are the end points that should be made part of the customer’s credit card payment page.
 
Use the below endpoint during:
 
development - https://cdn.webbeds.com/js/payment/test.js
production - https://cdn.webbeds.com/js/payment/live.js
 
e. Validation of length of CVV characters to be implemented
f. Validation of phone number, address, card number, month and expiry, and name of the card
 
Domains to be whitelisted at customer’s end
a. cdn.webbeds.com
b. *.accdab.net
c. *.cdn-net.com
 
For MoR solution, specifically for 3DS2 flows, the credit card page hosted in the customer's website with WebBeds wrapper JS, should not have any outbound domain restrictions as there will be different domain names of different issuer banks.
 
3DS v2.0 Payment Flows
 
The MoR solution supports 3DS version 2. A transaction going through any of the below flows are identified by the issuer banks. WebBeds do not have a control of which 3DS flow the payment transaction may take.
 

3DS2 and Tokens in customer’s credit card page

Do note that, whether, or not, the payment transaction will go into 3DS2 payment flows, is decided by issuer banks (Customer’s credit card issuing bank). This depends on whether the credit card used for payment is enrolled into 3DS mechanism.

Changes to bookItinerary method for credit card payments

bookItinerary confirm=no. There are no changes made to this method 
bookItinerary confirm=preauth. This is the new endpoint. Read below and additionally refer to Postman collection
bookItinerary confirm=yes.
                 - Clear credit card information was expected in this method, before 3DS2 and Token solution

                 - With 3DS2 and Token solution, 2 new parameters are added. <orderCode>orderCode> and <authorisationId>authorisationId>

BookItinerary flow
 
1. Call bookItinerary confirm=no
2. For card information to be tokenized, customers need to call JS method, webbeds.tokenize(). This method will take in the card informationand returns a secure token called as RezToken.
3. RezToken token needs to be passed into bookItinerary method in the parameter confirm=preauth.
4. Take note of 2 parameters in the response of confirm=preauth
The parameter called initiate3DS acts as a control gate. The valid values of this parameter are 0 and 1.
The parameter called token carries 2 types of values. A blank value or the 3DS token value.
When a payment transaction requires 3DS2 flows, then
         a. initiate3DS will have a value 1
         b. token will have the value
         c. Then the customer needs to call webbeds.initiate3DS() JS method.
         d. This method will initiate 3DS flow and will return SUCCESS or CANCEL message in the result.
 
                  i. When result is SUCCESS then call bookItinerary confirm=yes
                 ii. When result is CANCEL then credit card page should display appropriate error message saying
3DS authentication failed.
                iii. The customer credit card page should NOT continue to next steps of the booking process.
               iv. Retry process in case of webbeds.initiate3DS() and the result is CANCEL
                        aa. If credit card page wants to make a new transaction again with same card, then use the same reztoken and
    make a call to bookItinerary confirm=preauth again. Go to STEP 3 and continue.
                        bb. If credit card page accepts a new/different credit card information, then new calls to webbeds.tokenize() and
                              bookItinerary confirm=preauth to be made. Go to STEP 2 and continue.
                        cc. It is suggested that not more than 2 retries to be made. The initial one + 2. Totally 3.
When a payment transaction does not require 3DS2 flows, then
           e. initiate3DS will have a value 0
           f. token will be blank
          g. The customer credit card page should continue to next steps of the booking process with a call to the
API bookItinerary confirm=yes
 
For additional information, refer to solution flow diagrams above, sample html and the postman collection
 
Pre-requisites for the credit card flow
 
Customer account is setup as “Credit Card” customer in the booking platform
Customer makes a booking via WebBeds (DOTW) XML API
Customer (or end traveller) pays for the booking via credit card
Every customer account setup as “Credit Card” type, need to implement this new flow that supports 3DS and Tokens.
Error Messaging
 
Payment related failures are grouped under main error messages of the XML Response. The response error code is 132.
Take note that payment related failures fall under 2 categories namely Payment Rejects or Payment Errors.
Payment Rejects are those that can be due to for ex: "Invalid CVV" or "Invalid card expiry date"
Payment Failures can be due to fraud rules, or they can be due to 3DS or other errors from acquirers, or from issuer banks
Since MoR solution is connected via API to various external partners like acquirers, gateways, anti-fraud tools, each of the external systems have numerous error responses and different error codes in the APIs.
 
To simplify the error messaging for card transaction failures, MoR solution has a predefined, actionable, and self-explanatory set of error codes and messages, that is supplied to the customer as part of the card payment process. This is called as "Simplified Error Messaging" - SEM.
 
Our clients need to check/read the XML API response element “extraDetails” to display the error in the customer’s website, and to take corrective action on the error message shown.
 
For ex: for some error codes, the MoR solution requires the customer’s website to retry the transaction and for some other error codes, the transaction should not be retried.
 
XML API response error data element - Below error details appear in extraDetails element of the response
 
extraDetails - Error messsage will appear in the following format.
[SEM CODE] - [SEM Message] + [Customer actionable message]

SEM Code	SEM Message	Customer actionable message
1	Invalid Platform Identifier	Could not process the transaction. Please try again after 30 seconds
2	Platform identifier should not be empty	Could not process the transaction. Please try again after 30 seconds
3	Platform identifier should not have more than N number of characters	Could not process the transaction. Please try again after 30 seconds
4	Currency should not be empty	Could not process the transaction. Please try again after 30 seconds
5	Currency should not have more than N number of characters	Could not process the transaction. Please try again after 30 seconds
6	Invalid Currency	Could not process the transaction. Please try again after 30 seconds
7	Card number should not be empty	Could not process the transaction. Please try again after 30 seconds
8	Card holder name should not be empty	Could not process the transaction. Please try again after 30 seconds
9	Expiration month should not be empty	Could not process the transaction. Please try again after 30 seconds
10	Expiration year should not be empty	Could not process the transaction. Please try again after 30 seconds
11	Country should not be empty	Could not process the transaction. Please try again after 30 seconds
12	IP Address should not be empty	Could not process the transaction. Please try again after 30 seconds
13	Amount should be greater than zero	Could not process the transaction. Please try again after 30 seconds
14	Address should not be empty	Could not process the transaction. Please try again after 30 seconds
15	Invalid Expiration Month	Could not process the transaction. Please try again after 30 seconds
16	Invalid Expiration Year	Could not process the transaction. Please try again after 30 seconds
17	Card is expired	Could not process the transaction. Please try again after 30 seconds
18	Invalid Card Number	Could not process the transaction. Please try again after 30 seconds
19	Platform identifier not supported	Could not process the transaction. Please try again after 30 seconds
20	Token should not be empty	Could not process the transaction. Please try again after 30 seconds
101	FR should not be empty	Could not process the transaction. Please try again after 30 seconds
102	FR Token should not be empty	Could not process the transaction. Please try again after 30 seconds
1001	General Error	Please try again or another card
1004	FRSERR	Cannot process your card. Please contact your issuer bank or try another card
1005	FRIERR	Cannot process your card. Please contact your issuer bank or try another card
1009	Insufficient funds	Please try another card
1010	Card Limit exceeded	Please try another card
1011	Pin Retries exceeded	Please try again or another card
1012	Declines	Can't process your card, please contact your bank or try another card
1013	Invalid Card Expiry	Please enter valid information and try again
1014	Invalid Card Information	Please enter valid information and try again
1015	Invalid Card Currency	Transaction is declined by issuer bank, please try another card
1016	Invalid Card Number	Please enter valid information and try again
1017	Invalid Amount	Please try another card
1018	Invalid Card CVV	Please enter valid information and try again
1019	Invalid Card Address	Please enter valid information and try again
1020	Invalid email	Please enter valid information and try again
1021	Invalid country	Transaction is declined by issuer bank, please try another card
1022	Invalid IP address	Please try again or another card
1023	Invalid capture	Couldn't capture the transaction
1024	Invalid refund	Couldn't process the refund
1025	Invalid Transaction - Issuer/Acquirer	Please contact merchant
1026	Invalid Transaction - Merchant	Please contact merchant
1027	Invalid Transaction - External tech. error	Please contact merchant
1028	Invalid Transaction - Card user	Please contact merchant
 

MoR Solution – Notes on some of the features
 
Connecting to the DOTW XML API
 
Customers need to implement DOTW XML API calls to searchhotels, get rooms, savebooking and bookitinerary. Customers will be guided by WebBeds integration consultants during the development phase. 
 
Amendment of bookings
 
The “Amend” booking method in the XML API does not support implementation of credit card details. The existing booking must be cancelled(using the cancelbooking method) and a new booking must be created.
 
The payment for a new booking will be made with a credit card, with tokenized credit card details passed again in the “Book Itinerary” API method.This new booking will not have any reference to the old booking.
 
Single room booking
 
The MoR solution currently supports single room booking via the XML API to accept credit card payments. The customers code base should support single room booking feature, and the same should be demonstrated during the code certification process.
 
Multi-room booking is not supported currently.
 
Solution compatibility
 
WebBeds MoR and the fraud solution is available for customer’s web clients ONLY. The solution is supported when:
the website from the desktop browser application is used
a browser application on a mobile device is used
This MoR solution is not supported using a native mobile app on a mobile device. This is planned to be supported in the future.
 
Fraud – Device Intelligence
 
There are 2 components involved in the anti-fraud solution provided MoR solution. The fraud scoring will work on these 2 components.
Device Intelligence – DI payload captures, device details, IP address details etc.
Fraud payload, that captures additional data elements including but not limited to credit card and booking information.
WebBeds fraud solution provider is of the view that, although the DI payload is important component of fraud scoring, it is not mandatorily required to compute the fraud score. This doesn’t reduce the efficacy of the fraud score computation.
 
This is NOT saying that DI payload isn’t important for fraud scoring computation. The idea being communicated is that the DIpayload cannot always be collected from the client’s browser, potentially due to network issues or other technical issues.
 
Fraud – End user device compliance
 
The end user device must have JS enabled.
 
IP Address compatibility
 
The MoR solution supports IP V4 and IP V6 address formats.
 
Currencies
 
The MoR solution supports accepting payments in USD, Australian dollars, and EURO currencies. There is a plan to accept credit card payments in additional currencies, soon.
 
Questionnaire
 
As part of the onboarding process, there is a questionnaire to be filled in. The questionnaire collects information specific to account setup including information related to card payments.
 
The expectation is that WebBeds integration consultant or your implementation contact in WebBeds will work with you (the customer) to fill information in this questionnaire.
 
Use this link to download the questionnaire.
 
 
Cancel Booking
The following request can be used to cancel a booking (booking code) that is confirmed or delete a booking that is saved.

Please note that this method is a two steps process:

1.<confirm>no</confirm>; 2.<confirm>yes</confirm>.

If you want to cancel an entire itinerary using the cancelBooking method you have to send separate cancelbooking requests for each of the booking codes in your itinerary.

General Request
<customer>  
    <userName>username</userName>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <request command="cancelbooking">  
        <bookingDetails>  
            <bookingType></bookingType>  
            <bookingCode>internal booking code</bookingCode>  
            <confirm></confirm>  
            <testPricesAndAllocation>  
                <service referencenumber="">  
                    <penaltyApplied></penaltyApplied>  
                    <paymentBalance></paymentBalance>  
                </service>  
            </testPricesAndAllocation>  
        </bookingDetails>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
bookingDetails	Element	request	Used to specify details about the request.	Yes.
bookingType	Element	bookingDetails	Specifies if the booking is confirmed or saved. Possible values:
1 - confirmed
2 - saved
Yes.
bookingCode	Element	bookingDetails	Booking internal code.	Yes.
confirm	Element	bookingDetails	For confirmed bookings the cancellation process takes place in two steps to ensure the customer is agreeing to any cancellation penalty that should be applied. In the first step, the request is indicating which booking the customer wishes to cancel - confirm value: no. The second step also provides details about cancellation penalty (by mentioning this, the customer is in fact agreeing to that cancellation penalty.) - confirm value: yes. Possible values:
yes
no
Yes.
testPricesAndAllocation	Element	bookingDetails	Groups information about prices, allocation and penalties for each service.	Yes, if confirm nodevalue is yes.
service	Element	testPricesAndAllocation	Specifies for which service the details are about.	Yes.
@referencenumber	Attribute	service	Booking Internal Code - same value as bookingCode	Yes.
penaltyApplied	Element	service	Specifies the penalty charge for canceling this booking, the customer agrees to. This should be the exact value received from the system and not the formatted one.	
Yes.

 

paymentBalance	Element	service	Must contain the balance between the total booking amount and applied penalty (if any)
This tag is required to be used by credit card customers only.	No.
 

cancelbooking.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="bookingDetails">  
                <xs:complexType>  
                    <xs:sequence>  
                        <xs:group ref="bookingTypeAndCode"></xs:group>  
                        <xs:element name="confirm"  type="confirmType"></xs:element>  
                        <xs:element name="testPricesAndAllocation"  type="cancelTestPricesAndAllocationType" minOccurs="0"></xs:element>  
                    </xs:sequence>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="cancelbooking"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
In case of cancelBooking failure (if the booking can't be cancelled successfully after a few tries) we strongly recommend that you contact us immediately so that we can analyze the cause and suggest a course of action (i.e. reporting the issue in real time to our suppliers so that they can manually cancel it from their side).

<result command="cancelbooking" date="">  
    <services>  
        <service code="" runno="">  
            <cancellationPenalty>  
                <penaltyApplied>  
                    <formatted></formatted>  
                </penaltyApplied>  
                <currency></currency>  
                <currencyShort></currencyShort>  
            </cancellationPenalty>  
        </service>  
    </services>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The Unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
services	Element	result	Groups information about the services that were canceled.
service	Element	services	Encapsulates information about the penalty that was applied for this booking.
@runno	Element	service	Serial running number starting from 0.
@code	Element	service	Internal code for the booking that was canceled.
cancellationPenalty	Element	result	Encapsulates details about the cancellation policy applied for this booking.
penaltyApplied	Element	cancellationPenalty	Cancellation charge applied for this booking.
formatted	Element	penaltyApplied	Cancellation charge formatted as per the customer preference (decimal places, thousand separator, decimal separator).
currency	Element	cancellationPenalty	Internal code of the currency in which the cancellation charge is provided.
currencyShort	Element	cancellationPenalty	The 3 letter code which identify the currency in which the cancellation charge is provided.
successful	Element	result	Specifies if the request was successfully processed.
cancelbooking_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:all>  
            <xs:element name="productsLeftOnItinerary"  type="xs:unsignedShort" minOccurs="0"></xs:element>  
            <xs:element name="services"  type="servicesType"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse"></xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="cancelbooking"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ {1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9] {1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*\.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="servicesType">  
        <xs:sequence>  
            <xs:element name="service"  type="serviceType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="serviceType">  
        <xs:sequence>  
            <xs:element name="cancellationPenalty"  type="cancellationPenaltyType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedByte" use="required"></xs:attribute>  
        <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="cancellationPenaltyType">  
        <xs:sequence>  
            <xs:choice>  
                <xs:element name="penaltyApplied"  type="formattedPriceType"></xs:element>  
                <xs:element name="charge"  type="formattedPriceType"></xs:element>  
            </xs:choice>  
            <xs:element name="currency"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="currencyShort"  type="currencyShortType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="formattedPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
</xs:schema>  
Delete Itinerary
An itinerary can contain one or more services. You can use this method to delete all services in a saved itinerary or cancel all services in a confirmed itinerary.

Please note that this method is a two steps process:

1.no; 2.yes.

When implementing the deleteitinerary method you always have to take into consideration the value of the element returned in our deleteItinerary with yes response.

If the value of this element is greater or equal to 1 the application should display a message informing the user that not all of the services have been successfully cancelled:

e.g. If you send a deleteitinerary request for a booking of 3 rooms and our system returns the element 2 it means that 2 out of the 3 booked rooms could not be cancelled.

In cases when the value returned by this element is different than 0 please retry to cancel the itinerary and immediately contact us if you still can't succeed so we can raise the issue with our suppliers.

General Request
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <request command="deleteitinerary">  
        <bookingDetails>  
            <bookingType></bookingType>  
            <bookingCode></bookingCode>  
            <confirm></confirm>  
            <testPricesAndAllocation>  
                <service referencenumber="">  
                    <penaltyApplied></penaltyApplied>  
                </service>  
            </testPricesAndAllocation>  
        </bookingDetails>  
    </request>  
</customer>  
 

Item	Type	Parent	Description	Required
bookingDetails	Element	request	Used to specify details about the request.	Yes.
bookingType	Element	bookingdetails	Specifies if the booking is confirmed or saved. Possible values:
1 - confirmed
2 - saved
Yes.
bookingCode	Element	bookingdetails	Itinerary internal code.	Yes.
confirm	Element	bookingDetails	For confirmed bookings the cancellation process takes place in two steps to ensure the customer is agreeing to any cancellation penalty that should be applied. In the first step, the request is indicating which booking the customer wishes to cancel - confirm value: no. The second step also provides details about cancellation penalty (by mentioning this, the customer is in fact agreeing to that cancellation penalty.) - confirm value: yes. Possible values:
yes
no
Yes.
testPricesAndAllocation	Element	bookingDetails	Groups information about prices, allocation and penalties for each service.	Yes, if confirm node value is yes.
service	Element	testPricesAndAllocation	Specifies for which service the details are about.	Yes.
@referencenumber	Attribute	service	Booking Internal Code returned in deleteitinerary with confirm=no xml response in the "code" attribute per each service (room)	Yes.
penaltyApplied	Element	service	Specifies the penalty charge for canceling this booking, the customer agrees to. This should be the exact value received from the system and not the formatted one.	Yes.
 

deleteitinerary.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetails.xsd"></xs:include>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:all>  
            <xs:element name="bookingDetails">  
                <xs:complexType>  
                    <xs:sequence>  
                        <xs:group ref="bookingTypeAndCode"></xs:group>  
                        <xs:element name="confirm"  type="confirmType"></xs:element>  
                        <xs:element name="testPricesAndAllocation"  type="deleteTestPricesAndAllocationType" minOccurs="0"></xs:element>  
                    </xs:sequence>  
                </xs:complexType>  
            </xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="deleteitinerary"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
In case of deleteItinerary failure (if not all the bookings under the requested itinerary can be cancelled successfully after a few tries) we strongly recommend that you contact us immediately so that we can analyze the cause and suggest a course of action (i.e. reporting the issue in real time to our suppliers so that they can manually cancel it from their side).

 

<result command="deleteitinerary" ip="" date="" version="">  
    <currencyShort></currencyShort>  
    <productsLeftOnItinerary></productsLeftOnItinerary>  
    <services>  
        <service runno="0" code="">  
            <cancellationPenalty>  
                <charge>  
                    <formatted></formatted>  
                </charge>  
                <currency>413</currency>  
                <currencyShort>EUR</currencyShort>  
            </cancellationPenalty>  
        </service>  
        <service runno="1" code="14275817">  
            <cancellationPenalty>  
                <charge>  
                    <formatted></formatted>  
                </charge>  
                <currency>413</currency>  
                <currencyShort>EUR</currencyShort>  
            </cancellationPenalty>  
        </service>  
    </services>  
    <successful></successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
productsLeftOnItinerary	Element	result	Specifies how many services are still confirmed and part of the itinerary after the cancellation request.It is important to take into consideration this element and implement a validation to verify if the value returned is different than 0. In such case you should immediately contact DOTW team in order to successfully cancel the itinerary.
services	Element	result	Groups information about the services that are to be canceled.
service	Element	services	Encapsulates information about the penalty that was applied for this booking.
@runno	Element	service	Serial running number starting from 0.
@code	Element	service	Internal code for the booking that was canceled.
cancellationPenalty	Element	result	Encapsulates details about the cancellation policy applied for this booking.
penaltyApplied	Element	cancellationPenalty	Cancellation charge applied for this booking.
formatted	Element	penaltyApplied	Cancellation charge formatted as per the customer preference (decimal places, thousand separator, decimal separator).
currency	Element	cancellationPenalty	Internal code of the currency in which the cancellation charge is provided.
currencyShort	Element	cancellationPenalty	The 3 letter code which identify the currency in which the cancellation charge is provided.
successful	Element	result	Specifies if the request was successfully processed.
 

deleteitinerary_response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:all>  
            <xs:element name="currencyShort"  type="currencyShortType" minOccurs="0"></xs:element>  
            <xs:element name="productsLeftOnItinerary"  type="xs:unsignedShort" minOccurs="0"></xs:element>  
            <xs:element name="services"  type="servicesType"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse"></xs:element>  
        </xs:all>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="deleteitinerary"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ {1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9] {1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*\.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="servicesType">  
        <xs:sequence>  
            <xs:element name="service"  type="serviceType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="serviceType">  
        <xs:sequence>  
            <xs:element name="cancellationPenalty"  type="cancellationPenaltyType"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedByte" use="required"></xs:attribute>  
        <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="cancellationPenaltyType">  
        <xs:sequence>  
            <xs:choice>  
                <xs:element name="penaltyApplied"  type="formattedPriceType"></xs:element>  
                <xs:element name="charge"  type="formattedPriceType"></xs:element>  
            </xs:choice>  
            <xs:element name="currency"  type="xs:unsignedShort"></xs:element>  
            <xs:element name="currencyShort"  type="currencyShortType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="formattedPriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
</xs:schema>  
Based on the search criteria provided in the XML request, this method returns the (mandatory) additional services provided by the hotel for a specific period. When additional services are returned, the charges applicable for these services are always included in the total payable price for that particular room. In addition to the Authentication data the elements required to be passed for this method are defined in the following table.

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company_code</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="getadditionalserviceinfo">  
        <fromDate>dotw date format</fromDate>  
        <toDate>dotw date format</toDate>  
        <currency>currency internal code</currency>  
        <hotelId>hotel internal code</hotelId>  
        <additionalServices>  
            <additionalServiceId></additionalServiceId>  
        </additionalServices>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
fromDate	Element	request	Arrival date in dotw date format.	Yes.
toDate	Element	request	Departure date in dotw date format.	Yes.
currency	Element	request	Internal code of the currency in which the customer will see the prices. Include this element only if you are interested to get prices of the additional services.	No.
hotelId	Element	request	Internal code for the hotel you wish to see the additional services.	Yes.
additionalServices	Element	request	Groups several additional services ids. Send this element only if you want to receive information for specific services. If this element is not present, the request will return details for all additional services valid for the specified period.	No.
additionalServiceId	Element	request	Internal code for the additional service you want to receive details. Repeat this element if you wish to receive details for more services.	Yes, if parent present.
Our getadditionalserviceinfo response will provide information regarding the additional services that apply for the requested period. If the request was sent for specific additional service ids, the result will list only information about the mentioned services, if they are applicable for the requested period.

<result command="getadditionalserviceinfo" date="" elapsedtime="" ip="" tid="" version="2.0">  
    <additionalservices count="">  
        <additionalservice id="" runno="">  
            <name>mandatory transfer airport to hotel</name>  
            <appliedto>person</appliedto>  
            <appliedon>checkIn</appliedon>  
            <adultrate> Adult Rate <formatted></formatted>  
</adultrate>  
            <childrate> Child Rate <formatted></formatted>  
</childrate>  
            <relatedinformation count="">  
                <relatedinformationitem id="" runno="">  
                    < type id=""></ type>  
                    <info></info>  
                    <answerchoises count="">  
                        <answer runno="0"></answer>  
                    </answerchoises>  
                </relatedinformationitem>  
            </relatedinformation>  
        </additionalservice>  
    </additionalservices>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The date and time when the result was provided in unix timestamp.
@command	Attribute	result	The request command which returned this result.
@ip	Attribute	result	The Ipv4 address the request was made from.
additionalServices	Element	result	Groups information about the additional services applied for the period request. If the request was sent with specific additional services ids, the result will contain only information about the mentioned services, if they are valid for the requested period.
@count	Attribute	additionalServices	Total number of additional services valid for the requested period and specific additional services requested.
additionalService	Element	additionalServices	Groups information about one additional service.
@id	Attribute	additionalService	Internal code for this additional service. This needs to be specified in the confirmbooking request along with any information needed by the hotel for this additional service.
runno	Attribute	additionalService	Running number starting from 0.
name	Element	additionalService	Additional service name as entered by the hotel.
appliedTo	Element	additionalService	Specified how this additional service is applied. Possible values:
person
room
If service is applied per person, the specified rates (adult and/or child) will apply in the same manner.
appliedOn	Element	additionalService	Specified when this additional service is applied. Possible values:
checkIn
checkOut
Depending on when it is applied, the rate for the service, is included in the first night or last night rate. In the getRooms response, the nightly rates include the additional services rates. If you want to display the additional service rate you can use information in this response to compute the total rate for additional services. Please note that any additional services defined by the hotel are mandatory and bookings can not be made without these services included.
adultRate	Element	additionalService	This element contains the adult rate for this additional service. Returned only if the request contains the currency element and if the service is applied per person.
formatted	Element	adultRate	This element contains the adult rate formatted as per the customer preference (decimal places, thousand separator, decimal separator)
childRate	Element	additionalService	This element contains the child rate for this additional service. Returned only if the request contains the currency element and if the service is applied per person.
formatted	Element	childRate	This element contains the child rate formatted as per the customer preference (decimal places, thousand separator, decimal separator)
rate	Element	additionalService	This element contains the additional service rate for this additional service. Returned only if the request contains the currency element and if the service is applied per room.
formatted	Element	rate	This element contains the additional service rate formatted as per the customer preference (decimal places, thousand separator, decimal separator)
relatedInformation	Element	additionalService	In order to book an additional service, the hotel might need several additional information from the end customer. (flight numbers, luggage info). If present, this elements flags that there is at least one information required by the hotel for this additional service.
relatedInformationItem	Element	relatedInformation	This element contains details about a specific info required by the hotel. Please note that there might be multiple info required for one additional service.
info	Element	additionalService	Specifies which is the information required by the hotel.
type	Element	relatedInformation	Specifies which type of information is required by the hotel. Possible values:
Radio selection - one single answer; the answerChoices element will contain the possible answers for the information required
Multiple choices - multiple answers allowed; the answerChoices element will contain the possible answers for the information required
Free text - free text answer up to 200 characters
Date - date in YYYY-mm-dd format
Date Time - date time in YYYY-mm-dd HH:SS
Date Interval - two dates specifying an interval (YYYY-mm-dd YYYY-mm-dd)
id	Attribute	type	Internal code for the type of answer, in case you want to write your application using internal codes rather than strings. This is in fact the preferred way to do it. The actual text description of the expected answer might change slightly during time the code will never change. If you want to get a complete list of the codes, please use getrelatedinfotypeids request, documented in the Internal Codes section.
answerChoices	Element	relatedInformation	Element is returned when the hotel has already predefined the possible answers and at confirm only one of these are accepted.
answerChoice	Element	type	Specifies one possible answer predefined by the hotel.
runno	Attribute	answerChoice	Running number starting from 0.
Based on the criteria provided in the searchBookings request, this method will return details for all the DOTW bookings created by the same customer (including passenger names, booking status and booking code). In addition to the Authentication data you have to also pass in your method the elements defined in the following table.

1

<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="searchbookings" debug="1">  
        <bookingDetails>  
            <passengerFirstName></passengerFirstName>  
            <passengerLastName></passengerLastName>  
            <bookedCity></bookedCity>  
            <bookingType></bookingType>  
            <serviceDate  type="bookingdate">  
                <!--     type="checkindate | checkoutdate | bookingdate"     -->  
                <from></from>  
                <to></to>  
            </serviceDate>  
            <serviceType></serviceType>  
            <status></status>  
            <agentReference></agentReference>  
        </bookingDetails>  
    </request>  
</customer>  
 

Item	Type	Parent	Description	Required
bookingDetails	Element	request	Contains filtering options in order to retrieve DOTW bookings, as passenger names, booking date, travel dates. Please note that at least two filters have to be specified in the XML request.	Yes
passengerFirstName	Element	bookingDetails	Passenger first name	No
passengerLastName	Element	bookingDetails	Passenger last name	No
bookedCity	Element	bookingDetails	DOTW internal code of the city where bookings have been created in.	No
bookingType	Element	bookingDetails	Internal code of the booking status. Possible values:
1 Confirmed
2 Saved
No
serviceDate	Element	bookingDetails	Date in unix time stamp or YYYY-MM-DD format	No
type	Attribute	serviceDate	Specifies the date type. Possible values:
checkindate
checkoutdate
bookingdate
No
from	Element	serviceDate	Specifies the starting date on which the user wants to retreive bookings, based on the serviceDate type provided	No
to	Element	serviceDate	Specifies the end date until which the user wants to retreive bookings, based on the serviceDate type provided. Note that the results will be retrieved for maximum 30 days.	No
status	Element	bookingDetails	Specifies the booking status. Possible values:
1666 Confirmed
1667 Cancelled
1669 Amended Confirmed
1705 Aborted
1665 - On Request
1668 - Amended On Request
1669 - Amended Confirmed
1707 - Denied
1708 - Saved
No
agentReference	Element	bookingDetails	Filters the bookings based on the customerReference number, if this has been provided in the confirmbooking request.	No
 

Our searchbookings response will provide information regarding the DOTW bookings made by a customer.

Requests To Get Internal Codes
This section contains details of all methods which can be used to retrieve the internal codes we use in DOTWconnect system. The internal codes can be for the Countries, Cities, Hotels etc. All methods has same format The following requests can be made in order to get internal codes from the system. If not specified explicitly for the command, all requests have the same format with some of them needing the presence of the product element in order to be correct. The value of the command is different from one request to another.
General Request
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <product></product>  
    <request command=""></request>  
</customer>  
This command is used to get a complete list with all information needed about cities in the system.

General Request
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <request command="getallcities">  
        <return>  
            <filters>  
                <countryCode></countryCode>  
                <countryName></countryName>  
            </filters>  
            <fields>  
                <field>countryName</field>  
                <field>countryCode</field>  
            </fields>  
        </return>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
return	Element	root	Groups elements that control what to be returned.	No.
filters	Element	result	Groups the filter that will be applied.	No.
countryCode	Element	filters	For filtering and returning only cities from the country with the specified internal code.	No.
countryName	Element	filters	For filtering and returning only cities from the country with the specified name.	No.
fields	Element	result	Encapsulates elements that specify what should be returned for each city.	No.
field	Element	result	Specifies what elements to be returned along with the name and internal code for each city. Possible values:
countryName - the response will return the country name for each city
countryCode - the response will return the country internal code for each city
No.
General Request XSD

getallcities.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="return"  type="returnType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getallcities"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer" use="optional"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="filters"  type="filtersType" minOccurs="0"></xs:element>  
            <xs:element name="fields"  type="fieldsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="filtersType">  
        <xs:sequence>  
            <xs:element name="countryCode" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([0-9]) "></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="countryName" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-z A-Z]) "></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="fieldsType">  
        <xs:sequence>  
            <xs:element name="field"  maxOccurs="2" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:enumeration value="countryName"></xs:enumeration>  
                        <xs:enumeration value="countryCode"></xs:enumeration>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getallcities" date="">  
    <cities count="">  
        <city runno="">  
            <name></name>  
            <code></code>  
            <countryName></countryName>  
            <countryCode></countryCode>  
        </city>  
    </cities>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
cities	Element	result	Contains a list with all the cities.
@count	Attribute	cities	Total number of cities.
city	Element	cities	Contains information about the city.
@runno	Attribute	city	Running number starting from 0.
name	Element	city	City name. Returned by default.
code	Element	city	Internal code for the city. Returned by default.
countryName	Element	city	Country name of this city`s country. Returned only if specified in the request.
countryCode	Element	city	Country internal code for this city`s country. Returned only if specified in the request.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD

getallcities.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="cities"  type="citiesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getallcities"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="citiesType">  
        <xs:sequence>  
            <xs:element name="city"  type="cityType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="cityType">  
        <xs:sequence>  
            <xs:element name="name">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-zA-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="countryCode"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="countryName">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-zA-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:integer"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
This command is used to get a complete list with all information needed about countries in the system.

General Request
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <request command="getallcountries">  
        <return>  
            <fields>  
                <field>regionName</field>  
                <field>regionCode</field>  
            </fields>  
        </return>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
return	Element	root	Groups elements that control what to be returned.	No.
fields	Element	result	Encapsulates elements that specify what should be returned for each country.	No.
field	Element	result	Specifies what elements to be returned along with the name and internal code for each country. Possible values:
regionName - the response will return the region name for each country
regionCode - the response will return the region code for each country
No.
General Request XSD

getallcountries.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="return"  type="returnType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getallcountries"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer" use="optional"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="fields"  type="fieldsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="fieldsType">  
        <xs:sequence>  
            <xs:element name="field"  maxOccurs="2" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:enumeration value="regionName"></xs:enumeration>  
                        <xs:enumeration value="regionCode"></xs:enumeration>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getallcountries" date="">  
    <countries count="">  
        <country runno="">  
            <name></name>  
            <code></code>  
            <regionName></regionName>  
            <regionCode></regionCode>  
        </country>  
    </countries>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
countries	Element	result	Contains a list with all the countries.
@count	Attribute	cities	Total number of countries.
country	Element	cities	Contains information about the country.
@runno	Attribute	city	Running number starting from 0.
name	Element	city	Country name.
code	Element	city	Internal code for the country.
regionName	Element	city	Region name of this city`s region.
regionCode	Element	city	Region internal code for this city`s region.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD

getallcountries_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="countries"  type="countriesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getallcountries"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="countriesType">  
        <xs:sequence>  
            <xs:element name="country"  type="countryType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="countryType">  
        <xs:sequence>  
            <xs:element name="name">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-z A-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="regionName">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-z A-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="regionCode"  type="xs:unsignedInt"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:integer"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
The requests for this command must have the product element present. Its value will see for what service the servicing cities will be returned. Possible values for the value of product element: hotel, apartment. These command are used to get a complete list with all informaton needed about the cities in the system that have at least one hotel/apartment available in the future.

Genreal Request
The topDeals, luxury, specialDeals siblings of filters element is to be present only when product value is hotel.
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <product></product>  
    <request command="getservingcities">  
        <return>  
            <filters>  
                <topDeals>true</topDeals>  
                <luxury>true</luxury>  
                <specialDeals>true</specialDeals>  
                <countryCode></countryCode>  
                <countryName></countryName>  
            </filters>  
            <fields>  
                <field>countryName</field>  
                <field>countryCode</field>  
            </fields>  
        </return>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
return	Element	root	Groups elements that control the response.	No.
filters	Element	result	Groups the filter that will be applied.	No.
topDeals	Element	filters	For filtering and returning only cities with hotels which have at least one booking made in the next week of the search date. Fixed value: true.	No.
luxury	Element	filters	For filtering and returning only cities with at least one hotel that is marked as luxury in the system.	No.
specialDeals	Element	filters	For filtering and returning only cities with hotels that have at least one special deal in the next two month form the search date. Special deals are PAY - STAY OFFERS. Fixed value: true;	No.
countryCode	Element	filters	For filtering and returning only cities from the country with the specified internal code.	No.
countryName	Element	filters	For filtering and returning only cities from the country with the specified name.	No.
fields	Element	result	Encapsulates elements that specify what should be returned for each city.	No.
field	Element	result	Specifies what elements to be returned along with the name and internal code for each city. Possible values:
countryName â�� the response will return the country name for each city
countryCode â�� the response will return the country internal code for each city
No.
General Request XSD

getservingcities.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="productType"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="return"  type="returnType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getservingcities"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="filters"  type="filtersType" minOccurs="0"></xs:element>  
            <xs:element name="fields"  type="fieldsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="filtersType">  
        <xs:sequence>  
            <xs:element name="topDeals"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="luxury"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="specialDeals"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="countryCode" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([0-9]) "></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="countryName" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-z A-Z]) "></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="fieldsType">  
        <xs:sequence>  
            <xs:element name="field"  maxOccurs="4" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:enumeration value="countryName"></xs:enumeration>  
                        <xs:enumeration value="countryCode"></xs:enumeration>  
                        <xs:enumeration value="code"></xs:enumeration>  
                        <xs:enumeration value="name"></xs:enumeration>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="productType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command=" getservingcities" date="">  
    <cities count="">  
        <city runno="">  
            <name></name>  
            <code></code>  
            <countryName></countryName>  
            <countryCode></countryCode>  
        </city>  
    </cities>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
cities	Element	result	Contains a list with all the cities.
@count	Attribute	cities	Total number of cities.
city	Element	cities	Contains information about the city.
@runno	Attribute	city	Running number starting from 0.
name	Element	city	City name.
code	Element	city	Internal code for the city.
countryName	Element	city	Country name of this city`s country. Returned only if specified in the request.
countryCode	Element	city	Country internal code for this city`s country. Returned only if specified in the request.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD

getservingcities_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="cities"  type="citiesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getservingcities"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="citiesType">  
        <xs:sequence>  
            <xs:element name="city"  type="cityType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="cityType">  
        <xs:sequence>  
            <xs:element name="name">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-zA-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="countryName">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-zA-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="countryCode"  type="xs:unsignedInt"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:integer"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
The requests for this command must have the product element present. Its value will see for what service the servicing countries will be returned. Possible values for the value of product element: hotel. This commands is used to get a complete list with all informaton needed about the countries in the system that have at least one hotel/apartment available in the future.

General Request
The topDeals, luxury, specialDeals siblings of filters element is to be present only when product value is hotel.

<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <product></product>  
    <request command="getservingcountries">  
        <return>  
            <filters>  
                <topDeals>true</topDeals>  
                <luxury>true</luxury>  
                <specialDeals>true</specialDeals>  
            </filters>  
            <fields>  
                <field>name</field>  
                <field>code</field>  
                <field>regionName</field>  
                <field>regionCode</field>  
            </fields>  
        </return>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
return	Element	root	Groups elements that control the response.	No.
filters	Element	result	Groups the filter that will be applied.	No.
topDeals	Element	filters	For filtering and returning only countries with hotels which have at least one booking made in the next week of the search date. Fixed value: true.	No.
luxury	Element	filters	For filtering and returning only countries with at least one hotel that is marked as luxury in the system.	No.
specialDeals	Element	filters	For filtering and returning only countries with hotels that have at least one special deal that is available in the following two month of the search date. Special deals are PAY - STAY OFFERS. Fixed value: true;	No.
countryCode	Element	filters	For filtering and returning only cities from the country with the specified internal code.	No.
countryName	Element	filters	For filtering and returning only cities from the country with the specified name.	No.
fields	Element	result	Encapsulates elements that specify what should be returned for each country.	No.
field	Element	result	Specifies what elements to be returned along with the name and internal code for each country. Possible values:
regionName - the response will return the region name for each country
regionCode - the response will return the region internal code for each country
No.
Genereal Request XSD

getservincountries.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="productType"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="return"  type="returnType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getservingcountries"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="filters"  type="filtersType" minOccurs="0"></xs:element>  
            <xs:element name="fields"  type="fieldsType" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="filtersType">  
        <xs:sequence>  
            <xs:element name="topDeals"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="luxury"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="specialDeals"  type="TrueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="fieldsType">  
        <xs:sequence>  
            <xs:element name="field"  maxOccurs="4" minOccurs="0">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:enumeration value="name"></xs:enumeration>  
                        <xs:enumeration value="code"></xs:enumeration>  
                        <xs:enumeration value="regionName"></xs:enumeration>  
                        <xs:enumeration value="regionCode"></xs:enumeration>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="productType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getservingcountries" date="">  
    <countries count="">  
        <country runno="">  
            <name></name>  
            <code></code>  
            <regionname></regionname>  
            <regioncode></regioncode>  
        </country>  
    </countries>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
countries	Element	result	Contains a list with all the countries.
@count	Attribute	countries	Total number of countries.
country	Element	countries	Contains information about the country.
@runno	Attribute	country	Running number starting from 0.
name	Element	country	Country name.
code	Element	country	Internal code for the country.
regionname	Element	country	Region name of this country`s region.
regioncode	Element	country	Region internal code for this country`s region.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getservingcountries_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="countries"  type="countriesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getservingcountries"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="countriesType">  
        <xs:sequence>  
            <xs:element name="country"  type="countryType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="countryType">  
        <xs:sequence>  
            <xs:element name="name">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-z A-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="code"  type="xs:unsignedInt"></xs:element>  
            <xs:element name="regionName">  
                <xs:simpleType>  
                    <xs:restriction base="xs:string">  
                        <xs:pattern value="([a-z A-Z])*"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
            <xs:element name="regionCode"  type="xs:unsignedInt"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:integer"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
This command is used to get a complete list with all information needed about currencies in the system.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getcurrenciesids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getcurrenciesids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getcurrencies" date="">  
    <currency>  
        <option runno="" shortcut=" " value=""></option>  
    </currency>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
currency	Element	result	Contains a list with all the currencies available.
option	Element	currency	Contains the full name of the currency.
@runno	Attribute	option	Running number starting from 0.
@shortcut	Attribute	option	Shorthening for the currency name.
@value	Attribute	option	Internal code for this currency.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD

getcurrenciesids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="currency"  type="currencyType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getcurrenciesids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="currencyType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="shortcut"  type="shortcutType" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="shortcutType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
Use this command to get a list with all available languages in the system.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getlanguagesids"></request>  
</customer>  
General Request XSD

getlanguages.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getlanguagesids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getlanguagesids" date="">  
    <languages>  
        <option runno="" shortcut="" value=""></option>  
    </languages>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
languages	Element	result	Contains a list with the languages.
option	Attribute	languages	Language name.
@runno	Attribute	option	Running number starting from 0.
@shortcut	Attribute	option	Shortening for language name.
@value	Attribute	option	Internal language code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getlanguagesids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="languages"  type="languagesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getlanguagesids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="languagesType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="shortcut"  type="shortcutType" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="shortcutType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[a-z]{2}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
This command is used to get a list with all hotel leisure and sports amenities.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getleisureids"></request>  
</customer>  
General Request XSD

getleisureids.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getleisureids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getleisureids" date="">  
    <leisures>  
        <option runno="" value=""></option>  
    </leisures>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
leisures	Element	result	Contains a list with the leisure and sports amenities.
option	Attribute	leisures	Leisure and sports amenitie name.
@runno	Attribute	option	Running number starting from 0.
@value	Attribute	option	Internal leisure ans sports amenitie code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getleisureids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="leisures"  type="leisuresType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getleisureids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="leisuresType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Use this command to get a list with all business features.

General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getbusinessids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getbusinessids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getbusinessids" date="">  
    <business>  
        <option runno="" value=""></option>  
    </business>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
business	Element	result	Contains a list with the business features.
option	Attribute	leisures	Business feature name.
@runno	Attribute	option	Running number starting from 0.
@value	Attribute	option	Internal leisure code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getbusinessids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="business"  type="businessType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getbusinessids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="businessType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Request


Use this command to get a list with all hotel/apartment amenities.
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getamenitieids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getamenitieids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getamenitieids" date="">  
    <amenities>  
        <option runno="" value=""></option>  
    </amenities>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
amenities	Element	result	Contains a list with the amenities.
option	Element	amenities	Amenitie name.
@runno	Attribute	option	Running number starting from 0.
@value	Attribute	option	Internal amentie code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getamenitieids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="amenities"  type="amenitiesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getamenitieids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="amenitiesType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Use this command to get a list with all room/apartment amenities.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getroomamenitieids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  #####################################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getroomamenitieids"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
<result command="getroomamenitieids" date="">  
    <amenities>  
        <option runno="" value=""></option>  
    </amenities>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
amenities	Element	result	Contains a list with the amenities.
option	Element	amenities	Amenitie name.
@runno	Attribute	option	Running number starting from 0.
@value	Attribute	option	Internal amentie code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getroomamenitieids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="amenities"  type="amenitiesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getroomamenitieids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="amenitiesType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Use this command to get a list with all salutations available for the system.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getsalutationsids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getsalutationsids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response
<result command="getsalutationsids" date="">  
    <salutations>  
        <option runno="" value=""></option>  
    </salutations>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
salutations	Element	result	Contains a list with the salutations.
option	Element	salutations	Salutation name.
@runno	Attribute	option	Running number starting from 0.
@value	Attribute	option	Internal salutation code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getsalutationsids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="salutations"  type="salutationsType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getsalutationsids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="salutationsType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
This command can be used to receive all the available special requests and their corresponding internal codes for each of the following services - hotel, apartment. The service you wish to see the special requests for must be specified through the product element.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="getspecialrequestsids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="productType"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="productType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  #####################################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getspecialrequestsids"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
<result command="getspecialrequestsids" date="">  
    <specialRequests count="">  
        <specialRequest runno="" code=""></specialRequest>  
    </specialRequests>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
specialRequests	Element	result	Contains a list with the special requests.
@count	Attribute	specialRequests	Total number of special requests for the indicated service.
specialRequest	Element	specialRequests	Special_request name.
@runno	Attribute	specialRequest	Running number starting from 0.
@code	Attribute	specialRequest	Internal code.
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
General Response XSD
getspecialrequestsids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="specialRequests"  type="specialRequestsType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getspecialrequestsids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="specialRequestsType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Use this command to get a list with all chains available for the system.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="gethotelchainsids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  #####################################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="gethotelchainsids"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
<result command="getchainids" date="">  
    <chains>  
        <option runno="" value=""></option>  
    </chains>  
    <successful>TRUE</successful>  
</result>  
General Response XSD
gethotelchainsids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="chains"  type="chainsType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="gethotelchainsids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="chainsType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Use this command to get a list with all hotel classification available for the system.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="gethotelclassificationids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complextype>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup">  
                    <xs:element name="request"  type="requestType"></xs:element>  
                </xs:group>  
            </xs:sequence>  
        </xs:complextype>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpletype name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpletype>  
    <!--  ################################################  -->  
    <xs:simpletype name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpletype>  
    <!--  #####################################################################  -->  
    <xs:complextype name="requestType">  
        <xs:attribute  fixed="gethotelclassificationids" name="command"  type="xs:string" use="required"></xs:attribute>  
    </xs:complextype>  
</xs:schema>  
General Response
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complextype>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup">  
                    <xs:element name="request"  type="requestType"></xs:element>  
                </xs:group>  
            </xs:sequence>  
        </xs:complextype>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpletype name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpletype>  
    <!--  ################################################  -->  
    <xs:simpletype name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpletype>  
    <!--  #####################################################################  -->  
    <xs:complextype name="requestType">  
        <xs:attribute  fixed="gethotelclassificationids" name="command"  type="xs:string" use="required"></xs:attribute>  
    </xs:complextype>  
</xs:schema>  
General Response XSD
gethotelclassificationids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="classification"  type="classificationType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="gethotelclassificationids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="classificationType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
Use this command to get a list with all the rate bases available in the system. These are needed in the search, blocl rooms and confirm booking processes.


General Request
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getratebasisids"></request>  
</customer>  
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  #####################################################################  -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getratebasisids"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
General Response
<result command="getratebasisids" date="">  
    <ratebasis>  
        <option runno="" value=""></option>  
    </ratebasis>  
    <successful>TRUE</successful>  
</result>  
General Response XSD
getratebasisids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="ratebasis"  type="ratebasisType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getratebasisids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="ratebasisType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
This command is used to get a complete list with all the locations in a certain city. You can use the location internal code to filter the hotels you want to be returned by the system.

General Request
<customer>  
    <username>username</username>  
    <password>md5(password)</password>  
    <id>company code</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="getlocationids">  
        <return>  
            <filters>  
                <cityCode></cityCode>  
            </filters>  
        </return>  
    </request>  
</customer>  
Item	Type	Parent	Description	Required
return	Element	root	Groups elements that control the response.	Yes.
filters	Element	result	Groups the filter that will be applied.	Yes.
cityCode	Element	filters	For filtering and returning only location in the specified city. This should be a city internal code.	Yes.
General Request XSD
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="productType"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ################################################  -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ################################################  -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:simpleType name="productType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="hotel|apartment"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="return"  type="returnType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getlocationids"></xs:attribute>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="filters"  type="filtersType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ################################################  -->  
    <xs:complexType name="filtersType">  
        <xs:sequence>  
            <xs:element name="cityCode">  
                <xs:simpleType>  
                    <xs:restriction base="xs:nonNegativeInteger">  
                        <xs:pattern value="([0-9])+"></xs:pattern>  
                    </xs:restriction>  
                </xs:simpleType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
</xs:schema>  
General Response
<result date="" command="getlocationids" ip="">  
    <locations count="" cityid="" cityname="">  
        <location runno="" id=""></location>  
    </locations>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
locations	Element	result	Contains a list with all the locations.
@count	Attribute	locations	Total number of locations.
@cityid	Attribute	locations	City internal code for the locations
@cityname	Attribute	locations	City name for the locations
location	Element	locations	Location name.
@runno	Attribute	location	Running number starting from 0.
@id	Attribute	location	Internal code for this location.
General Response XSD
getlocationids_response.xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="locations"  type="locationsType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getlocationids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="locationsType">  
        <xs:sequence>  
            <xs:element name="location"  type="locationType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="cityId"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="cityName"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="locationType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
This command is used to get a complete list with all details regarding the info types required to book hotels with additional services.

General Request

<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <request command="getrelatedinfotypeids"></request>  
</customer>  
General Request XSD

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--   ################################################   -->  
    <xs:complexType name="requestType">  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getrelatedinfotypeids"></xs:attribute>  
    </xs:complexType>  
    <!--   ################################################   -->  
    <xs:group name="loginDetailsGroup">  
        <xs:sequence>  
            <xs:element name="username"  type="xs:string"></xs:element>  
            <xs:element name="password"  type="passwordType"></xs:element>  
            <xs:element name="id"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="source"  type="sourceType"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--   ################################################   -->  
    <xs:simpleType name="passwordType">  
        <xs:restriction base="xs:string">  
            <xs:length value="32"></xs:length>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--   ################################################   -->  
    <xs:simpleType name="sourceType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
General Response

<result command="getrelatedinfotypeids" date="">  
    <infoTypes count="">  
        <option runno="" value=""></option>  
    </infoTypes>  
    <successful>TRUE</successful>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
infoTypes	Element	result	Contains a list with all the possible answer types (related info types).
option	Element	infoTypes	Contains the full name of the answer type.
@runno	Attribute	option	Running number starting from 0.
@value	Attribute	option	Internal code for this answer type (related info type).
successful	Element	result	Specifies if the request was successfully processed. Possible values:
TRUE
FALSE
 

General Response XSD

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="infoTypes"  type="infoTypesType"></xs:element>  
            <xs:element name="successful"  type="TrueOrFalse"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="getrelatedinfotypeids"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ ]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="infoTypesType">  
        <xs:sequence>  
            <xs:element name="option"  type="optionType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:integer" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="TrueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="optionType">  
        <xs:attribute name="runno"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="value"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
 
Q. What is your URL for Test Server?
A. The Test Server address for XML connectivity is https://xmldev.dotwconnect.com/gatewayV4.dotw
Q: Do we need to provide you with a list of IP addresses that will be required to access your system?
A: You may supply as many IP addresses as you want. Our servers accepts the requests only from the specified IP range.
Q: Does the test environment contain the same details as the live site? Are there any differences we need to be aware of?
A: The test environment contains exactly the same details like the live server. If your application functions properly on this environment it will definitely work on the live server as well. The only difference is that the bookings processed on the test servers are not broadcasted to the suppliers and no invoices generated for customers.
Q: What is the process for making a test booking against the live site? Is there specific criteria we should use, can test bookings be cancelled or are they chargeable, is there a limit to the number of test bookings we can make? Do you have test credit card details we should use?
A: The only difference between the booking process on the test and live environment is the fact that in test environment the bookings are not sent to the supplier and customers are not invoiced for it. For any information in relation with the Credit Card payment, we recommend you to check our Hotel Comm / Bookitinerary / Credit Card Payment section.
Q: Are there any restrictions on which customers will be allowed access e.g. only certain size/volume, specific markets or specific business types?
A: Our global product range is available for you via XML, . there are no restrictions on the size/volume.
Q: Are there Look/book ratios or penalties?
A: There are no look/book ratios or penalties. However monitory this very closely and reserve the right to take appropriate action if we find that over a period there are only look and no book actions.
Q: Are there any license costs of using the API and/or any costs for support/certification during the integration phase and afterwards?
A: There are no cost of using the API or for support/certification.
Q: Is there any mandatory information that we will need to display e.g. cancellation/amendment details?
A: The cancellation penalty charges are passed back from our web services. We do not control the display of the same. Please note that you can also customize your requests and retrieve from the server only data that you really need to process. In fact this is recommended as it will improve your performance.
Q: What is the timezone in which DOTW provides cancellation & amend policy?
A: DOTW system will always return the cancellation/amendment policies in the agency timezone.
Q: What is the age range for an adult?
A: There is no specific age limits/range for adult.
Q: What is the age range for a child?
A: The child age policy varies from hotel to hotel and we bracket the age from 1 to 21. The hotels are allowed to provide us with child rates applicable for a varied age bracket. Generally we consider any child below the age of 2 as an infant and up to 12 as child. But as mentioned this can be changed per property per room type and we leave it completely to the discretion of the properties based on their occupancy and child policy.
Q: Is an infant also considered a child?
A: The booking engine handles this internally. Depending on the age of the child entered at the time of booking and what rules the hotels provided in their profile the booking engine will allocate the child rate.
Q: What is the maximum number of children in a room?
A: This depends on the Hotel and varies, but as a policy we allow upto 4 children per room.
Q: What is the booking cutoff time that needs to be considered?
A: The cutoff time DOTW has with suppliers in confirmation step is 120 seconds..
Q:What is the DOTW date format?
A: The date format we use is in Unix Time Stamp or YYYY-MM-DD format.
Q: What is the maximum number of rooms in a hotel search?
A: We allow up to 5 rooms per Booking/Search
Q: How long is a saved itinerary available?
A: The Saved Itineraries are not purged, but please note the Saved Itineraries are like draft bookings, no action will be taken by DOTW on Saved Itineraries.
Q: Is the blocking rooms step mandatory?
A: Yes, the block rooms procedure is a mandatory one. By blocking the rooms prior to booking, the system guarantees the prices and allocation for 5 minutes, this being valid only for FIT rates. If more than 5 minutes pass before the booking is actually completed, a new blocking request is required.
Q: Is the hotel rating a star rating, or an internal DOTW rating?
A: This is very much Internal to DOTW. The classification is based on the information provided to us by our various service providers.
Q: Are special requests just a request to the hotel, or are the guaranteed to be honored?
A: Special Requests are subject to availability at the time of Check in and cannot be guaranteed.
Q: What is Maximum number of adults per room ?
A: The maximum allowed is 10 but again depends upon how the Hotels have provided the occupancy level. The hotels have an option of setting the maximum occupancy levels for Adults and Children in a Room. Booking engine does the validation against this at the time of a search and returns only properties meeting the search requirements.
Q: As the currency must be passed to DOTW, you presumably do currency conversion ?
A: Yes, we do have an internal exchange rate management and conversion is done based on the Exchange rates we hold. The exchange rates are managed regularly.
Q: What is the process of cutting over from Development environment to Live?
A: We have a certification process before moving a customer from Development environment to Live. This process is to ensure the communication between the two systems has been built properly and all mandatory requirements are met by the customer. The customers will be granted access to the Live server based on the application submitted for certification. Any changes to the XML integration post certification process will involve another round of certification process.
Q: Where do I check the bookings done using my XML Booking Engine or do you provide access to an interface to view our Bookings?
A: Yes, we allow the XML Customers to have a View Only Access to their bookings. You can log on to https://www.dotwconnect.com with the same login credentials you use to connect your XML Booking engine.
Q: Can bookings processed through XML Booking engine be cancelled or amended using the interface?
A: Yes, but please note that any offline cancellation or amendment, will not reflect in the customer's application.
The Internal Codes section contains a series of commands that can be used to receive the DOTW internal codes required during the booking/amending/cancelling process. (eg. City and country codes, currency codes, rate basis codes, special requests codes, etc). You need to obtain our static codes at regular intervals if you plan to keep this data locally. This is the first step of static download.

Regarding hotel data, this can also be separated into static (hotel name, classification, address, leisure amenities, business amenities, etc) and dynamic data (prices and availability). If you would like to speed up the process of booking through our web services it is recommendable that you download the static data to your server and query our server only for dynamic data. Our web services have the feature to give our clients the ability to control exactly what needs to be returned.

In order to get the static data for hotels you need to use the searchhotels command. In our documentation you will find exact details about all the information we provide for any given hotel. From the list select all the fields that you want to receive information about and pass them into the fields list. It is also very important that you make the mapping / static download request with the parameter noPrice set to true. It is recommended that you do this request per city (preferred) or country considering the range of property per city and the time system requires to process this information. If you are searching for an entire country please make sure you request for the Internal city code as well to group the hotels citywise.
For USA the mapping must be done city wise as due to the large amount of data, the request by country will fail.

Another important thing to consider while using the searchhotels command is that the bookingDetails element should contain the following data: travel dates and occupancy. For the static download process you can use the current date as the check in date and the next day for the check out date, 1 adult, no children. This will ensure you get all the hotels in the city / country you requested.

In order to get in the response the static information for rooms you need to add in your request the element set to value "true". This way our system will only return you properties that have active rooms. You can choose from the below list of roomFields/rateFields what information you are interested to retrieve using the static data download request


Please take a look at the following scenario to download the static data for Hotels:
You want to receive a complete list of the hotels in Dubai with the static data hotel name, hotel description, full address, hotel rating, leisure and business amenities, number of floors and rooms. Some of this data will be returned as internal codes this is why we recommend you to download the static data as well prior to this request.
The Request will be passed as follows:
(Please note that you need to fill in the login credentials with your login details. Also when posting this request you may need to change the dates depending on the date you are downloading the static data)


If interested to obtain the hotel details in another language than english, please note that you should add in the static data request the element , specifying the language code you wish to retrieve the details in. The languages codes, can be found in the language.xsd file.


Customers have the option to also require information about hotels priority. The priority of the properties is being established based on the number of reservations made by DOTW customers in the last 30 days. Basically top selling hotels from each destination will have priority '1'. The value of priority tag will increase as much as the priority of the property will decrease.
By downloading and storing this information at hotel level, customers are able to send the availability request, targeting only the top selling properties. In order to retrieve the hotels priority, the static data request must contain below tag:

<fields>  
    <field>priority</field>  
</fields>  
<customer>  
    <username></username>  
    <password></password>  
    <id></id>  
    <source>1</source>  
    <product>hotel</product>  
    <language></language>  
    <request command="searchhotels">  
        <bookingDetails>  
            <fromDate>current date</fromDate>  
            <toDate>next day</toDate>  
            <currency>currency internal code</currency>  
            <rooms no="1">  
                <room runno="0">  
                    <adultsCode>1</adultsCode>  
                    <children no="0"></children>  
                    <rateBasis>-1</rateBasis>  
                </room>  
            </rooms>  
        </bookingDetails>  
        <return>  
            <getRooms>true</getRooms>  
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
                <city>364</city>  
                <noPrice>true</noPrice>  
            </filters>  
            <fields>  
                <field>preferred</field>  
                <field>builtYear</field>  
                <field>renovationYear</field>  
                <field>floors</field>  
                <field>noOfRooms</field>  
                <field>preferred</field>  
                <field>fullAddress</field>  
                <field>description1</field>  
                <field>description2</field>  
                <field>hotelName</field>  
                <field>address</field>  
                <field>zipCode</field>  
                <field>location</field>  
                <field>locationId</field>  
                <field>geoLocations</field>  
                <field>location1</field>  
                <field>location2</field>  
                <field>location3</field>  
                <field>cityName</field>  
                <field>cityCode</field>  
                <field>stateName</field>  
                <field>stateCode</field>  
                <field>countryName</field>  
                <field>countryCode</field>  
                <field>regionName</field>  
                <field>regionCode</field>  
                <field>attraction</field>  
                <field>amenitie</field>  
                <field>leisure</field>  
                <field>business</field>  
                <field>transportation</field>  
                <field>hotelPhone</field>  
                <field>hotelCheckIn</field>  
                <field>hotelCheckOut</field>  
                <field>minAge</field>  
                <field>rating</field>  
                <field>fireSafety</field>  
                <field>hotelPreference</field>  
                <field>direct</field>  
                <field>geoPoint</field>  
                <field>leftToSell</field>  
                <field>chain</field>  
                <field>lastUpdated</field>  
                <field>priority</field>  
                <field>hotelAttributes</field>  
                <field>hotelAmenities</field>  
                <field>hotelImages</field>  
                <roomField>name</roomField>  
                <roomField>roomInfo</roomField>  
                <roomField>twin</roomField>  
                <roomField>roomAmenities</roomField>  
                <roomField>roomAttributes</roomField>  
                <roomField>roomDescription</roomField>  
                <roomField>roomImages</roomField>  
            </fields>  
        </return>  
    </request>  
</customer>  
To continuously be updated with our hotels please find below our suggestions:

Do the initial mapping country wise.
You can also have a periodical automatic process to get all NEW hotels. You can do this by making use of the filter notin (more details in the documentation) for the hotelId and ask only for the hotels which you don’t have mapped yet. If an empty list is returned this means that you have mapped all hotels for that particular criteria (city or country). This process can be run once a week or two times per month.
To get the updates of the hotels, make use of the conditional filter lastUpdated to ask the system to only return you hotels which have been update between a specific period. The system would return hotels which were modified in the specified interval. To get hotels updated from a certain date, just pass the second parameter as the current timestamp or any date in the future.
 

Static data request/response XSDs

 

request.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
    <xs:include schemaLocation="loginDetails.xsd"></xs:include>  
    <xs:include schemaLocation="bookingDetailsChildAgeNew.xsd"></xs:include>  
    <xs:include schemaLocation="general.xsd"></xs:include>  
    <xs:include schemaLocation="language.xsd"></xs:include>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/atomicCondition" schemaLocation="atomicCondition.xsd"></xs:import>  
    <xs:import namespace="http://us.dotwconnect.com/xsd/complexCondition" schemaLocation="complexCondition.xsd"></xs:import>  
    <!--  ############################################################  -->  
    <xs:element name="customer">  
        <xs:complexType>  
            <xs:sequence>  
                <xs:group ref="loginDetailsGroup"></xs:group>  
                <xs:element name="product"  type="xs:string"  fixed="hotel"></xs:element>  
                <xs:element name="myhash"  type="xs:string" minOccurs="0"></xs:element>  
                <xs:element name="language"  type="languageType" minOccurs="0"  maxOccurs="1"></xs:element>  
                <xs:element name="request"  type="requestType"></xs:element>  
            </xs:sequence>  
        </xs:complexType>  
    </xs:element>  
    <!--  ############################################################  -->  
    <xs:complexType name="requestType">  
        <xs:sequence>  
            <xs:element name="bookingDetails"  type="searchHotelsBookingDetailsType"></xs:element>  
            <xs:element name="return"  type="returnType"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="searchhotels"></xs:attribute>  
        <xs:attribute name="debug"  type="xs:integer" use="optional"></xs:attribute>  
        <xs:attribute name="defaultnamespace"  type="xs:string" use="optional"  fixed="true"></xs:attribute>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:complexType name="returnType">  
        <xs:sequence>  
            <xs:element name="sorting"  type="sortingType" minOccurs="0"></xs:element>  
            <xs:element name="getRooms"  type="xs:string" minOccurs="0"  fixed="true"></xs:element>  
            <xs:element name="filters"  type="filtersType"></xs:element>  
            <xs:element name="fields" minOccurs="0">  
                <xs:complexType>  
                    <xs:choice minOccurs="1"  maxOccurs="unbounded">  
                        <xs:element name="field"  type="staticFieldValue"></xs:element>  
                        <xs:element name="roomField"  type="staticRoomFieldValue"></xs:element>  
                    </xs:choice>  
                </xs:complexType>  
                <xs:unique name="differentFieldValue">  
                    <xs:selector xpath="field"></xs:selector>  
                    <xs:field xpath="field"></xs:field>  
                </xs:unique>  
            </xs:element>  
            <xs:element name="showEmpty"  type="TrueOrFalse" minOccurs="0"></xs:element>  
            <xs:group ref="resultsPerPageGroup" minOccurs="0"></xs:group>  
            <xs:element name="fromWholeStay"  type="yesOrNo" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="staticRoomFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="name"></xs:enumeration>  
            <xs:enumeration value="roomInfo"></xs:enumeration>  
            <xs:enumeration value="roomAmenities"></xs:enumeration>  
            <xs:enumeration value="twin"></xs:enumeration>  
            <xs:enumeration value="roomAttributes"></xs:enumeration>  
            <xs:enumeration value="roomDescription"></xs:enumeration>  
            <xs:enumeration value="roomImages"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:complexType name="sortingType">  
        <xs:simpleContent>  
            <xs:extension base="sortingBy">  
                <xs:attribute name="order" use="required">  
                    <xs:simpleType>  
                        <xs:restriction base="xs:string">  
                            <xs:pattern value="asc|desc"></xs:pattern>  
                        </xs:restriction>  
                    </xs:simpleType>  
                </xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:simpleType name="sortingBy">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="sortByRating"></xs:enumeration>  
            <xs:enumeration value="sortByHotelName"></xs:enumeration>  
            <xs:enumeration value="sortByPreferred"></xs:enumeration>  
            <xs:enumeration value="sortBySuites"></xs:enumeration>  
            <xs:enumeration value="sortByLastUpdated"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:complexType name="filtersType">  
        <xs:sequence>  
            <xs:group ref="destinationFilter" minOccurs="0"></xs:group>  
            <xs:element name="noPrice"  type="xs:string" minOccurs="1"  maxOccurs="1"  fixed="true"></xs:element>  
            <xs:element name="rateTypes"  type="rateTypesType" minOccurs="0"></xs:element>  
            <xs:element ref="c:condition" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:group name="groupOfCity">  
        <xs:sequence>  
            <xs:element name="city"  type="xs:positiveInteger"></xs:element>  
            <xs:element name="nearbyCities"  type="TrueOrFalse" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <!--  ############################################################  -->  
    <xs:complexType name="geoLocationType">  
        <xs:simpleContent>  
            <xs:extension base="xs:positiveInteger">  
                <xs:attribute name="range"  type="xs:positiveInteger"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <!--  ############################################################  -->  
    <xs:group name="destinationFilter">  
        <xs:choice>  
            <xs:group ref="groupOfCity"></xs:group>  
            <xs:element name="country"  type="xs:integer"></xs:element>  
            <xs:element name="area"  type="xs:integer"></xs:element>  
            <xs:element name="geoLocation"  type="geoLocationType"></xs:element>  
        </xs:choice>  
    </xs:group>  
    <!--  ############################################################  -->  
    <xs:simpleType name="staticFieldValue">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="preferred"></xs:enumeration>  
            <xs:enumeration value="exclusive"></xs:enumeration>  
            <xs:enumeration value="builtYear"></xs:enumeration>  
            <xs:enumeration value="renovationYear"></xs:enumeration>  
            <xs:enumeration value="floors"></xs:enumeration>  
            <xs:enumeration value="noOfRooms"></xs:enumeration>  
            <xs:enumeration value="luxury"></xs:enumeration>  
            <xs:enumeration value="fullAddress"></xs:enumeration>  
            <xs:enumeration value="description1"></xs:enumeration>  
            <xs:enumeration value="description2"></xs:enumeration>  
            <xs:enumeration value="hotelName"></xs:enumeration>  
            <xs:enumeration value="address"></xs:enumeration>  
            <xs:enumeration value="zipCode"></xs:enumeration>  
            <xs:enumeration value="location"></xs:enumeration>  
            <xs:enumeration value="locationId"></xs:enumeration>  
            <xs:enumeration value="location1"></xs:enumeration>  
            <xs:enumeration value="location2"></xs:enumeration>  
            <xs:enumeration value="location3"></xs:enumeration>  
            <xs:enumeration value="cityName"></xs:enumeration>  
            <xs:enumeration value="cityCode"></xs:enumeration>  
            <xs:enumeration value="areaName"></xs:enumeration>  
            <xs:enumeration value="areaCode"></xs:enumeration>  
            <xs:enumeration value="stateName"></xs:enumeration>  
            <xs:enumeration value="stateCode"></xs:enumeration>  
            <xs:enumeration value="countryName"></xs:enumeration>  
            <xs:enumeration value="countryCode"></xs:enumeration>  
            <xs:enumeration value="regionName"></xs:enumeration>  
            <xs:enumeration value="regionCode"></xs:enumeration>  
            <xs:enumeration value="attraction"></xs:enumeration>  
            <xs:enumeration value="amenitie"></xs:enumeration>  
            <xs:enumeration value="leisure"></xs:enumeration>  
            <xs:enumeration value="business"></xs:enumeration>  
            <xs:enumeration value="transportation"></xs:enumeration>  
            <xs:enumeration value="hotelPhone"></xs:enumeration>  
            <xs:enumeration value="hotelCheckIn"></xs:enumeration>  
            <xs:enumeration value="hotelCheckOut"></xs:enumeration>  
            <xs:enumeration value="minAge"></xs:enumeration>  
            <xs:enumeration value="rating"></xs:enumeration>  
            <xs:enumeration value="images"></xs:enumeration>  
            <xs:enumeration value="fireSafety"></xs:enumeration>  
            <xs:enumeration value="healthCompliant"></xs:enumeration>  
            <xs:enumeration value="direct"></xs:enumeration>  
            <xs:enumeration value="geoPoint"></xs:enumeration>  
            <xs:enumeration value="hotelPreference"></xs:enumeration>  
            <xs:enumeration value="lastUpdated"></xs:enumeration>  
            <xs:enumeration value="leftToSell"></xs:enumeration>  
            <xs:enumeration value="chain"></xs:enumeration>  
            <xs:enumeration value="geoLocations"></xs:enumeration>  
            <xs:enumeration value="priority"></xs:enumeration>  
            <xs:enumeration value="hotelImages"></xs:enumeration>  
            <xs:enumeration value="hotelAttributes"></xs:enumeration>  
            <xs:enumeration value="hotelAmenities"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <!--  ############################################################  -->  
    <xs:group name="resultsPerPageGroup">  
        <xs:sequence>  
            <xs:element name="resultsPerPage"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="page"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
        </xs:sequence>  
    </xs:group>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
 

response.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:include schemaLocation="../language.xsd"></xs:include>  
    <xs:element name="result"  type="resultType"></xs:element>  
    <xs:complexType name="resultType">  
        <xs:sequence>  
            <xs:element name="currencyShort"  type="currencyShortType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="sort"  type="sortType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotels"  type="hotelsType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="nearbyCities"  type="nearbyCitiesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="successful"  type="trueOrFalse" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="command"  type="xs:string" use="required"  fixed="searchhotels"></xs:attribute>  
        <xs:attribute name="tID"  type="xs:integer" use="required"></xs:attribute>  
        <xs:attribute name="ip"  type="dotwIP" use="required"></xs:attribute>  
        <xs:attribute name="date"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="version"  type="versionType" use="required"></xs:attribute>  
        <xs:attribute name="elapsedTime"  type="xs:decimal" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="currencyShortType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[A-Z]{3}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="trueOrFalse">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="true|false|TRUE|FALSE"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="oneOrZero">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="1|0"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="leftToSellType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwIP">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[ 1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1 }|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])" ></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="dotwDateType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[0-9]{10}|[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*|[0-9]{4,4}/[0-9]{1,2}/[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="versionType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="[1-9]{1}([0-9])*.([0-9])*"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="yesOrNo">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="freeStayType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="yes|no"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="statusType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="checked|unchecked"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="rateTypeRestriction">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="rateTypeType">  
        <xs:simpleContent>  
            <xs:extension base="rateTypeRestriction">  
                <xs:attribute name="currencyid"  type="xs:nonNegativeInteger" use="optional"></xs:attribute>  
                <xs:attribute name="currencyshort"  type="currencyShortType" use="optional"></xs:attribute>  
                <xs:attribute name="description"  type="xs:string" use="optional"></xs:attribute>  
                <xs:attribute name="nonrefundable"  type="xs:string"  fixed="yes" use="optional"></xs:attribute>  
                <xs:attribute name="notes"  type="xs:string" use="optional"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:simpleType name="paymentModeType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="CC"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="servicePriceType" mixed="true">  
        <xs:sequence>  
            <xs:element name="formatted"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:simpleType name="adultsCodeType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="2t"></xs:enumeration>  
            <xs:enumeration value="1"></xs:enumeration>  
            <xs:enumeration value="2"></xs:enumeration>  
            <xs:enumeration value="3"></xs:enumeration>  
            <xs:enumeration value="4"></xs:enumeration>  
            <xs:enumeration value="5"></xs:enumeration>  
            <xs:enumeration value="6"></xs:enumeration>  
            <xs:enumeration value="7"></xs:enumeration>  
            <xs:enumeration value="8"></xs:enumeration>  
            <xs:enumeration value="9"></xs:enumeration>  
            <xs:enumeration value="10"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="availableType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="available|request"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="orderType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="asc|desc"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="empty">  
        <xs:restriction base="xs:string">  
            <xs:maxLength value="0"></xs:maxLength>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="hourType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="([0-1][0-9]|2[0-3]):[0-5][0-9]"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="sortType">  
        <xs:simpleContent>  
            <xs:extension base="xs:string">  
                <xs:attribute name="order"  type="orderType"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="hotelsType">  
        <xs:sequence>  
            <xs:element name="hotel"  type="hotelType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="hotelType">  
        <xs:all>  
            <xs:element name="preferred"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="exclusive"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="builtYear"  type="emptyOrPositiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="renovationYear"  type="emptyOrPositiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="floors"  type="emptyOrPositiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="noOfRooms"  type="emptyOrPositiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="luxury"  type="trueOrFalse" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="fullAddress"  type="fullAddressType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="description1"  type="descriptionType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="description2"  type="descriptionType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="address"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="zipCode"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="location"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="locationId"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="location1"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="location2"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="location3"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="cityName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="cityCode"  type="xs:nonNegativeInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="areaName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="areaCode"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="stateName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="stateCode"  type="emptyOrPositiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="countryName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="regionName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="countryCode"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="attraction"  type="attractionType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="amenitie"  type="amenitieType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="leisure"  type="leisureType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="business"  type="businessType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="transportation"  type="transportationType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelPhone"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelCheckIn"  type="hourType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelCheckOut"  type="hourType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="minAge"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="rating"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="images"  type="imagesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="mapLink"  type="xs:anyURI" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="fireSafety"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="chain"  type="xs:integer" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelPreference"  type="hotelPreferenceType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="direct"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="geoPoint"  type="geoPointType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="priority"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelImages"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelAttributes"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelAmenities"  type="xs:positiveInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="rooms"  type="roomsType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="preferred"  type="yesOrNo" use="required"></xs:attribute>  
        <xs:attribute name="exclusive"  type="yesOrNo" use="optional"></xs:attribute>  
        <xs:attribute name="cityname"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="order"  type="xs:integer" use="optional"></xs:attribute>  
        <xs:attribute name="hotelid"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="emptyOrPositiveInteger">  
        <xs:union memberTypes="empty xs:positiveInteger"></xs:union>  
    </xs:simpleType>  
    <xs:complexType name="fullAddressType">  
        <xs:sequence>  
            <xs:element name="hotelStreetAddress"  type="xs:string"></xs:element>  
            <xs:element name="hotelZipCode"  type="xs:string"></xs:element>  
            <xs:element name="hotelCountry"  type="xs:string"></xs:element>  
            <xs:element name="hotelState"  type="xs:string"></xs:element>  
            <xs:element name="hotelCity"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="descriptionType">  
        <xs:sequence>  
            <xs:element name="language" minOccurs="1"  maxOccurs="10">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="id"  type="languageType" use="required"></xs:attribute>  
                            <xs:attribute name="name"  type="languageNameType" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="attractionType">  
        <xs:sequence>  
            <xs:element name="attractionItem"  type="attractionItemType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="attractionItemType">  
        <xs:sequence>  
            <xs:element name="name"  type="xs:string"></xs:element>  
            <xs:element name="dist"  type="distType" minOccurs="1"  maxOccurs="2"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="distType">  
        <xs:simpleContent>  
            <xs:extension base="xs:decimal">  
                <xs:attribute name="attr"  type="distAttrType" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:simpleType name="distAttrType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="Km|Miles|minutes"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="amenitieType">  
        <xs:sequence>  
            <xs:element name="language"  type="amenitieLanguageType" minOccurs="0"  maxOccurs="10"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="language">  
        <xs:attribute name="id"  type="languageType" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="languageNameType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="stringWithIdAttribute">  
        <xs:simpleContent>  
            <xs:extension base="xs:string">  
                <xs:attribute name="id"  type="xs:positiveInteger"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="amenitieLanguageType">  
        <xs:complexContent>  
            <xs:extension base="language">  
                <xs:sequence>  
                    <xs:element name="amenitieItem"  type="stringWithIdAttribute"  maxOccurs="unbounded"></xs:element>  
                </xs:sequence>  
            </xs:extension>  
        </xs:complexContent>  
    </xs:complexType>  
    <xs:complexType name="leisureType">  
        <xs:sequence>  
            <xs:element name="language"  type="leisureLanguageType" minOccurs="0"  maxOccurs="10"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="leisureLanguageType">  
        <xs:complexContent>  
            <xs:extension base="language">  
                <xs:sequence>  
                    <xs:element name="leisureItem"  type="stringWithIdAttribute"  maxOccurs="unbounded"></xs:element>  
                </xs:sequence>  
            </xs:extension>  
        </xs:complexContent>  
    </xs:complexType>  
    <xs:complexType name="businessType">  
        <xs:sequence>  
            <xs:element name="language"  type="businessLanguageType" minOccurs="0"  maxOccurs="10"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="businessLanguageType">  
        <xs:complexContent>  
            <xs:extension base="language">  
                <xs:sequence>  
                    <xs:element name="businessItem"  type="stringWithIdAttribute"  maxOccurs="unbounded"></xs:element>  
                </xs:sequence>  
            </xs:extension>  
        </xs:complexContent>  
    </xs:complexType>  
    <xs:complexType name="transportationType">  
        <xs:sequence>  
            <xs:element name="airports"  type="airportsType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="rails"  type="railsType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="subways"  type="subwaysType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="cruises"  type="cruisesType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="airportsType">  
        <xs:sequence>  
            <xs:element name="airport"  type="transportType"  maxOccurs="2"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="railsType">  
        <xs:sequence>  
            <xs:element name="rail"  type="transportType"  maxOccurs="2"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="subwaysType">  
        <xs:sequence>  
            <xs:element name="subway"  type="transportType"  maxOccurs="2"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="cruisesType">  
        <xs:sequence>  
            <xs:element name="cruise"  type="transportType"  maxOccurs="2"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="transportType">  
        <xs:sequence>  
            <xs:element name="name"  type="xs:string"></xs:element>  
            <xs:element name="dist"  type="distType" minOccurs="1"  maxOccurs="2"></xs:element>  
            <xs:element name="directions"  type="xs:string"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="imagesType">  
        <xs:sequence>  
            <xs:element name="thumb"  type="xs:anyURI" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="hotelImages"  type="imageListType"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="imageListType">  
        <xs:sequence>  
            <xs:element name="thumb"  type="xs:anyURI" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
            <xs:element name="image"  type="imageType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="imageType">  
        <xs:sequence>  
            <xs:element name="alt"  type="xs:string" minOccurs="0"></xs:element>  
            <xs:element name="category"  type="imageCategoryType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="url"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="imageCategoryNameType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="Exterior"></xs:enumeration>  
            <xs:enumeration value="Lobby"></xs:enumeration>  
            <xs:enumeration value="Hotel Rooms"></xs:enumeration>  
            <xs:enumeration value="Amenities and Services"></xs:enumeration>  
            <xs:enumeration value="Leisure and Sport Facilities"></xs:enumeration>  
            <xs:enumeration value="General"></xs:enumeration>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="imageCategoryType">  
        <xs:simpleContent>  
            <xs:extension base="imageCategoryNameType">  
                <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="hotelPreferenceType">  
        <xs:sequence>  
            <xs:element name="language"  type="hotelPreferenceLanguageType" minOccurs="0"  maxOccurs="10"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="hotelPreferenceLanguageType">  
        <xs:complexContent>  
            <xs:extension base="language">  
                <xs:sequence>  
                    <xs:element name="hotelPreferenceItem"  type="stringWithIdAttribute"  maxOccurs="unbounded"></xs:element>  
                </xs:sequence>  
            </xs:extension>  
        </xs:complexContent>  
    </xs:complexType>  
    <xs:complexType name="geoPointType">  
        <xs:sequence>  
            <xs:element name="lat"  type="xs:decimal"></xs:element>  
            <xs:element name="lng"  type="xs:decimal"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="roomsType">  
        <xs:sequence>  
            <xs:element name="room"  type="roomType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"  fixed="1"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomType">  
        <xs:sequence>  
            <xs:element name="roomType"  type="roomTypeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomTypeType">  
        <xs:all>  
            <xs:element name="roomAmenities"  type="roomAmenitiesType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="name"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="categoryCode"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="categoryName"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="roomAttributes"  type="xs:nonNegativeInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="roomDescription"  type="xs:nonNegativeInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="roomImages"  type="xs:nonNegativeInteger" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="twin"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="roomInfo"  type="roomInfoType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="roomCapacityInfo"  type="roomCapacityInfoType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="roomtypecode"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="roomAmenitiesType">  
        <xs:sequence>  
            <xs:element name="amenity"  type="amenityType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="amenityType">  
        <xs:simpleContent>  
            <xs:extension base="xs:string">  
                <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="roomInfoType">  
        <xs:sequence>  
            <xs:element name="maxAdult"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="maxExtraBed"  type="oneOrZero" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="maxChildren"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="roomCapacityInfoType">  
        <xs:sequence>  
            <xs:element name="roomPaxCapacity"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="allowedAdultsWithoutChildren"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="allowedAdultsWithChildren"  type="xs:nonNegativeInteger" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="maxExtraBed"  type="oneOrZero" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="specialsType">  
        <xs:sequence>  
            <xs:element name="special"  type="specialType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBookingCurrencyType">  
        <xs:simpleContent>  
            <xs:extension base="currencyShortType">  
                <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
            </xs:extension>  
        </xs:simpleContent>  
    </xs:complexType>  
    <xs:complexType name="specialType">  
        <xs:all>  
            <xs:element name="stay"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="pay"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="specialName"  type="xs:string"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBasesType">  
        <xs:sequence>  
            <xs:element name="rateBasis"  type="rateBasisType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="rateBasisType">  
        <xs:all>  
            <xs:element name="status"  type="statusType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="rateType"  type="rateTypeType"></xs:element>  
            <xs:element name="rateBookingCurrency"  type="rateBookingCurrencyType"></xs:element>  
            <xs:element name="paymentMode"  type="paymentModeType" minOccurs="0"></xs:element>  
            <xs:element name="allowsExtraMeals"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="allowsSpecialRequests"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="allowsSpecials"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="passengerNamesRequiredForBooking"  type="xs:nonNegativeInteger" minOccurs="0"></xs:element>  
            <xs:element name="allocationDetails"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="minStay"  type="minStayType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="dateApplyMinStay"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="cancellationRules"  type="cancellationRulesType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="withinCancellationDeadline"  type="yesOrNo" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="tariffNotes"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="packageRemarks"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="isBookable"  type="yesOrNo" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="onRequest"  type="oneOrZero" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="total"  type="servicePriceType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="totalMinimumSelling"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="totalInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="totalMinimumSellingInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="dates"  type="datesType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="leftToSell"  type="leftToSellType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="description"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="minStayType">  
        <xs:union memberTypes="empty xs:nonNegativeInteger"></xs:union>  
    </xs:simpleType>  
    <xs:complexType name="cancellationRulesType">  
        <xs:sequence>  
            <xs:element name="rule"  type="ruleType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="ruleType">  
        <xs:sequence>  
            <xs:element name="fromDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="fromDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDate"  type="dotwDateType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="toDateDetails"  type="xs:string" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="amendRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="cancelRestricted"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="noShowPolicy"  type="trueOrFalse" minOccurs="0"></xs:element>  
            <xs:element name="charge"  type="servicePriceType" minOccurs="0"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="datesType">  
        <xs:sequence>  
            <xs:element name="date"  type="dateType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="dateType">  
        <xs:all>  
            <xs:element name="price"  type="servicePriceType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="priceMinimumSelling"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="priceInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="priceMinimumSellingInRequestedCurrency"  type="servicePriceType" minOccurs="0"></xs:element>  
            <xs:element name="freeStay"  type="freeStayType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="dayOnRequest"  type="oneOrZero" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="including"  type="includingType" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includingType">  
        <xs:all>  
            <xs:element name="includedSupplement"  type="includedSupplementType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="includedMeal"  type="includedMealType" minOccurs="0"  maxOccurs="1"></xs:element>  
            <xs:element name="includedAdditionalService"  type="includedAdditionalServiceType" minOccurs="0"  maxOccurs="1"></xs:element>  
        </xs:all>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedAdditionalServiceType">  
        <xs:sequence>  
            <xs:element name="serviceId"  type="xs:nonNegativeInteger"></xs:element>  
            <xs:element name="serviceName"  type="xs:string"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedSupplementType">  
        <xs:sequence>  
            <xs:element name="supplementName"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="description"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="includedMealType">  
        <xs:sequence>  
            <xs:element name="mealName"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealType">  
                <xs:complexType>  
                    <xs:simpleContent>  
                        <xs:extension base="xs:string">  
                            <xs:attribute name="code"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
                        </xs:extension>  
                    </xs:simpleContent>  
                </xs:complexType>  
            </xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="extraMealsType">  
        <xs:sequence>  
            <xs:element name="mealDate"  type="mealDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealDateType">  
        <xs:sequence>  
            <xs:element name="mealType"  type="mealTypeType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
        <xs:attribute name="wday"  type="wdayType" use="required"></xs:attribute>  
        <xs:attribute name="day"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="datetime"  type="dotwDateType" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="wdayType">  
        <xs:restriction base="xs:integer">  
            <xs:pattern value="[0-6]{1}"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="mealTypeType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealComplexType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealtypename"  type="xs:string" use="required"></xs:attribute>  
        <xs:attribute name="mealtypecode"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealComplexType">  
        <xs:sequence>  
            <xs:element name="mealCode"  type="xs:unsignedInt" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealName"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealPrice"  type="servicePriceType" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableforType" use="required"></xs:attribute>  
        <xs:attribute name="startage"  type="xs:unsignedShort"></xs:attribute>  
        <xs:attribute name="endage"  type="xs:unsignedShort"></xs:attribute>  
    </xs:complexType>  
    <xs:simpleType name="applicableforType">  
        <xs:restriction base="xs:string">  
            <xs:pattern value="adult|child"></xs:pattern>  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:complexType name="selectedExtraMealsType">  
        <xs:sequence>  
            <xs:element name="mealPlanDate"  type="mealPlanDateType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
    </xs:complexType>  
    <xs:complexType name="mealPlanDateType">  
        <xs:sequence>  
            <xs:element name="mealPlan"  type="mealPlanType" minOccurs="1"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="mealplandatetime"  type="xs:date" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealPlanType">  
        <xs:sequence>  
            <xs:element name="meal"  type="mealType" minOccurs="0"  maxOccurs="unbounded"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="mealscount"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="applicablefor"  type="applicableforType" use="required"></xs:attribute>  
        <xs:attribute name="childage"  type="xs:unsignedShort" use="required"></xs:attribute>  
        <xs:attribute name="ispassenger"  type="xs:integer"  fixed="1"></xs:attribute>  
        <xs:attribute name="passengernumber"  type="xs:unsignedShort" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="mealType">  
        <xs:sequence>  
            <xs:element name="code"  type="xs:unsignedInt" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="units"  type="xs:unsignedInt" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealTypeCode"  type="xs:unsignedInt" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealPrice"  type="servicePriceType" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealTypeName"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="mealName"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
            <xs:element name="bookedMealCode"  type="xs:string" minOccurs="1"  maxOccurs="1"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:unsignedInt" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="nearbyCitiesType">  
        <xs:sequence>  
            <xs:element name="nearbyCity"  type="nearbyCityType" minOccurs="0"  maxOccurs="5"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="count"  type="xs:nonNegativeInteger" use="required"></xs:attribute>  
    </xs:complexType>  
    <xs:complexType name="nearbyCityType">  
        <xs:sequence>  
            <xs:element name="hotels"  type="hotelsType" minOccurs="0"  maxOccurs="5"></xs:element>  
        </xs:sequence>  
        <xs:attribute name="runno"  type="xs:positiveInteger" use="required"></xs:attribute>  
        <xs:attribute name="id"  type="xs:positiveInteger" use="required"></xs:attribute>  
        <xs:attribute name="name"  type="xs:string" use="required"></xs:attribute>  
    </xs:complexType>  
</xs:schema>  
 

language.xsd

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">  
    <xs:simpleType name="languageType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="en"></xs:enumeration>  
            <!--  english  -->  
            <xs:enumeration value="cn"></xs:enumeration>  
            <!--  chinese simplified  -->  
            <xs:enumeration value="tw"></xs:enumeration>  
            <!--  chinese traditional  -->  
            <xs:enumeration value="dk"></xs:enumeration>  
            <!--  danish  -->  
            <xs:enumeration value="de"></xs:enumeration>  
            <!--  german  -->  
            <xs:enumeration value="es"></xs:enumeration>  
            <!--  spanish  -->  
            <xs:enumeration value="fr"></xs:enumeration>  
            <!--  french  -->  
            <xs:enumeration value="it"></xs:enumeration>  
            <!--  italian  -->  
            <xs:enumeration value="jp"></xs:enumeration>  
            <!--  japanese  -->  
            <xs:enumeration value="pl"></xs:enumeration>  
            <!--  polish  -->  
            <xs:enumeration value="kr"></xs:enumeration>  
            <!--  korean  -->  
            <xs:enumeration value="nl"></xs:enumeration>  
            <!--  dutch  -->  
            <xs:enumeration value="no"></xs:enumeration>  
            <!--  norwegian  -->  
            <xs:enumeration value="pt"></xs:enumeration>  
            <!--  portuguese  -->  
            <xs:enumeration value="ru"></xs:enumeration>  
            <!--  russian  -->  
            <xs:enumeration value="fi"></xs:enumeration>  
            <!--  finnish  -->  
            <xs:enumeration value="se"></xs:enumeration>  
            <!--  swedish  -->  
            <xs:enumeration value="ar"></xs:enumeration>  
            <!--  arabic  -->  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="languageCodeType">  
        <xs:restriction base="xs:nonNegativeInteger">  
            <xs:enumeration value="1"></xs:enumeration>  
            <!--  english  -->  
            <xs:enumeration value="2"></xs:enumeration>  
            <!--  spanish  -->  
            <xs:enumeration value="3"></xs:enumeration>  
            <!--  italian  -->  
            <xs:enumeration value="4"></xs:enumeration>  
            <!--  french  -->  
            <xs:enumeration value="5"></xs:enumeration>  
            <!--  german  -->  
            <xs:enumeration value="6"></xs:enumeration>  
            <!--  russian  -->  
            <xs:enumeration value="7"></xs:enumeration>  
            <!--  dutch  -->  
            <xs:enumeration value="8"></xs:enumeration>  
            <!--  portuguese  -->  
            <xs:enumeration value="9"></xs:enumeration>  
            <!--  polish  -->  
            <xs:enumeration value="10"></xs:enumeration>  
            <!--  swedish  -->  
            <xs:enumeration value="11"></xs:enumeration>  
            <!--  danish  -->  
            <xs:enumeration value="12"></xs:enumeration>  
            <!--  norwegian  -->  
            <xs:enumeration value="13"></xs:enumeration>  
            <!--  finnish  -->  
            <xs:enumeration value="14"></xs:enumeration>  
            <!--  japanese  -->  
            <xs:enumeration value="15"></xs:enumeration>  
            <!--  korean  -->  
            <xs:enumeration value="16"></xs:enumeration>  
            <!--  chinese simplified  -->  
            <xs:enumeration value="20"></xs:enumeration>  
            <!--  chinese traditional  -->  
            <xs:enumeration value="21"></xs:enumeration>  
            <!--  arabic  -->  
        </xs:restriction>  
    </xs:simpleType>  
    <xs:simpleType name="languageNameType">  
        <xs:restriction base="xs:string">  
            <xs:enumeration value="English"></xs:enumeration>  
            <!--  english  -->  
            <xs:enumeration value="Espaniol"></xs:enumeration>  
            <!--  spanish  -->  
            <xs:enumeration value="Italiano"></xs:enumeration>  
            <!--  italian  -->  
            <xs:enumeration value="Francais"></xs:enumeration>  
            <!--  french  -->  
            <xs:enumeration value="Deutche"></xs:enumeration>  
            <!--  german  -->  
            <xs:enumeration value="Russian"></xs:enumeration>  
            <!--  russian  -->  
            <xs:enumeration value="Dutch"></xs:enumeration>  
            <!--  dutch  -->  
            <xs:enumeration value="Portuguese"></xs:enumeration>  
            <!--  portuguese  -->  
            <xs:enumeration value="Polish"></xs:enumeration>  
            <!--  polish  -->  
            <xs:enumeration value="Swedish"></xs:enumeration>  
            <!--  swedish  -->  
            <xs:enumeration value="Danish"></xs:enumeration>  
            <!--  danish  -->  
            <xs:enumeration value="Norwegian"></xs:enumeration>  
            <!--  norwegian  -->  
            <xs:enumeration value="Finnish"></xs:enumeration>  
            <!--  finnish  -->  
            <xs:enumeration value="Japanese"></xs:enumeration>  
            <!--  japanese  -->  
            <xs:enumeration value="Korean"></xs:enumeration>  
            <!--  korean  -->  
            <xs:enumeration value="Chinese simplified"></xs:enumeration>  
            <!--  chinese simplified  -->  
            <xs:enumeration value="Chinese traditional"></xs:enumeration>  
            <!--  chinese traditional  -->  
            <xs:enumeration value="Arabic"></xs:enumeration>  
            <!--  arabic  -->  
        </xs:restriction>  
    </xs:simpleType>  
</xs:schema>  
 

Error Code	Details
0	No XML or invalid/corupt/not well formated XML request.
1	The request generated too many result rows. For system saftey the process has been halted. Please read the manual to see how you can filter the results.
3	No apartments found for this property.
4	Wrong hotel id.
5	XML request NOT DTD VALID.
6	Wrong or required parameters for this request. Please read the user manual.
7	No Request, Empty or Not Formated Request. Please read the user manual for available commands.
8	Wrong customer username or password.
9	Inexistent Request Command. Please read the user manual for available commands.
12	No rooms found for this hotel.
13	Wrong property id.
18	System error due to database structure changed.
20	Wrong or no customer username or password.
23	Incomplete or bad formated Booking data
24	The DataBase connection is down.
25	Inactive Customer.
26	XML request NOT XSD VALID.
31	The request was made from an unrecognized customer ip. The request was logged. Please contact dotw to solve this issue
32	The Currency Code given is not valid for this customer. Please contact your Supervisor.
33	The Starting/Ending Date format is not valid.
63	Internal communication timed out
67	Too many requested hotels in a short period of time
81	The number of passengers details received is not valid.
100	Incorrect or Inexistent Booking Data or the cancellation period has expired.
102	Reservation Error. No data, invalid or corrupted reservation data sent to system.
103	Nothing to change/update.
104	Customer id does not match for this booking.
105	At least one service is out of date. You can`t book this itinerary or package.
107	You cannot make a booking starting in the past. Please contact DOTW team in order to do it.
109	Left To Sell error.
115	You do not have Rights to View Rates. Please contact your Supervisor.
116	You do not have Rights to Make/Amend Bookings. Please contact your Supervisor.
117	Please note that your booking session has been exceeded and we cannot complete this booking. Your Itinerary has been saved and you may access this reservation through the link `My Itinerary` on our home page. The booking will be reprocessed based on the current availability and rates. If you would like to edit this service please click on the link `Edit` under Reservation Summary.
119	You do not have access to this product.
127	The reservation period has exceeded allowed value.
131	The starting date for this service has expired
140	We are unable to process this request as there are no more rooms available
147	Invalid number of rooms sent. Please check documentation for allowed number of rooms
149	No rooms returned for the requested hotel.
151	Unable to confirm the booking due to a rate change from supplier
152	Unable to confirm the booking due to cancellation policy change from supplier
153	Unable to confirm the booking due to rate and cancellation policy change from supplier
157	We are unable to process this request as there are no more rooms available
190	Customer cannot perform this operation due to Insufficient limit to finalize this request
210	Wrong booking code, cancellation period expired or this booking is already cancelled.
211	This booking can`t be cancelled because the cancellation period expired for one or more booked serice/s.
212	You cannot cancel a booking starting in the past. Please contact DOTW team in order to do it.
302	Booking amending failed.
303	No available service for the new booking data.
304	You can`t change this booking. The new period doesn`t contain any days from the initial booking period.
305	The booking price is not the same.
306	Please note that this booking cannot be processed online as the service is within Cancellation Deadline. Kindly contact our Reservation department who will be able to process this this booking provided payment is made in full immediately on receipt of confirmation of the requested services. If you would like to edit this service please click on the link `Edit` under Reservation Summary.
307	You cannot change a booking for a past travel date. Please contact DOTW team in order to do it.
696	System Fatal Error
900	Limit of searches per second exceeded.
901	Limit of searches per minute exceeded.
5012	Invalid parameter received
5300	Internal communication error supplier integration
65002	The booking status is invalid.
86000	Booking not successful
120002	No rooms found for this hotel.
120003	No rooms found for this hotel.
120009	Room type code mismatched from selected Room data.
1109858	We are unable to process this request as there are no more rooms available
 

Unsuccessful Responses
<result date="">  
    <request>  
        <successful>FALSE</successful>  
        <error>  
            <code></code>  
            <details></details>  
            <extraDetails></extraDetails>  
        </error>  
    </request>  
</result>  
Item	Type	Parent	Description
result	Element	root	The root element.
@date	Attribute	result	The unix timestamp date and time when the result has been provided.
@command	Attribute	result	The command for which the result is shown.
request	Element	result	Contains specific data for the unsuccessfull request command.
successful	Element	request	Indicates that the request was not successfully processed.
error	Element	request	Contains information about the error.
code	Element	error	Internal error code.
details	Element		Details about the error.
extraDetails	Element	error	Extra details regarding the error.
The certification process implies a series of tests to be conducted by the XML Support and integration team, in order to validate that the customer's implementation is following our technical specifications.

The proffered method is for our customers to provide us access to a test environment of their application, where the team is able to conduct the test. This is because there are specific display items which need to be validated during the process.

However, if for some reasons customer is not able to provide e test access, we can validate the integration based on the XML logs provided by customer itself.

This implies that customer will conduct the complete test suite on their side and once finalized, will provide the XML logs and any additional info required by the integration team.

Focus points to be considered when implementing DOTW API

1.Minimum Stay Rules
In DOTW system hotels are able to define a minimumStay rule at room level, or even rate level.

We highlight this information in the XML response by the below two elements:

minStay	Element	rateBasis	If the hotel has requested a minimum stay for this room type and rate basis then this element will be returned and its value will be the minimum stay required in days. If no minimum stay applies this element will be returned with no value (empty tag).
dateApplyMinStay	Element	rateBasis	If there is a minimum stay condition this element will specify the starting date when the minium stay condition applies. If no minimum stay applies this element will be returned with no value (empty tag).
Our requirement is that customer’s application somehow inform the user about the fact that the stay period has modified for the selected roomType and rateBasis.
Please note that we can manage this from our side and if you want we can filter out the rates for which a minimum stay policy, higher than the initial number of nights requested for booking, applies.

Please let us know if we should apply this filter from our side or you will manage it from yours.

2.Passenger Nationality and Country of Residence
Since most products are now with specific source markets and nationality, Nationality and Residence check is mandatory for all customers now and it has to be made from the beginning of the booking.

We have two dedicated elements to be used in order to pass this information to DOTW server:
- passengerNationality & passengerCuontryOfResidence.
For any further questions you can consult our online documentation, or contact the Integration support team at xmlsupport@dotw.com

3. Passenger Names Format
It is mandatory to implement the following restrictions in matter of passenger names:

names should contain minimum 2 characters and maximum 25;
no white spaces or special characters allowed;
all the passenger names should be passed in the confirmation request
We recommend that in case of multiple first / last names to automatically merge the names by removing the white spaces, same as in the following example

Full Name: James Lee Happy Traveler

firstName in XML request:JamesLee

lastName in XML request:HappyTraveler

 

4.Displaying tariffNotes
Displaying of the content in the tariffNotes tag present in the getRooms response is mandatory, because it contains free text information provided by suppliers or notes regarding any specific policy or information of the hotel. e.g.
No show and early departure will be subjected to 100% charge, no name change.

5. APRs (Advance Purchased Rates) These rates come with the advantage of high discounts for our customers.

These types of rates are highlighted in the xml response trough the nonrefundable element always set on the value true


Also, bookings confirmed for APRs cannot be cancelled nor amended starting with the booking time, meaning that cancellation policy will contain both cancelRestricted and amendRestricted elements, returned with value ‘TRUE’

6. Minimum Selling Price If your application is using a B2C distribution platform, you must take into consideration the value returned in the totalMinimumSelling
This element returns the minimum selling price that the customer should adhere to while distributing the product directly to the final consumer (B2C). The application must display the MSP or higher if selling directly to the final customer. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.
This element should only be considered by your customer as you are distributing to a B2C platform.
Please note that you will still be charged by DOTW as per the value returned in the tag.

If you have any doubts about the minimumSellingPrice please contact your DOTW account manager and/or the XML Support & Integration team. (xmlsupport@dotw.com)

7. Searchhotels by Hotel IDs list
For improved performance and lower response rate we suggest to our customers to implement the searchhotels method by hotel IDs list, rather than destination code.
Please note that this is not a mandatory requirement, but we received positive feedback from our customers who chose to integrate this method
Basically grouping the hotels by 50 per request the response time will be generated a lot quicker and you can also target preferred hotels in a certain city or region.

To get all the available hotels for a city you should send the request per hotelId, but you cannot send more than 50 hotelIds per request.
If in the area you are searching the number of hotels you are interested in is higher, your application should send multiple searchHotels requests. So if you want to target all 382 hotels available for Dubai your application should send 7 searchHotels requests each one containing a list of a maximum 50 hotelIds.
Please see below a build example of implementation for the new searchHotels request:

<customer>  
    <username>...</username>  
    <password>...</password>  
    <id>...</id>  
    <source>1</source>  
    <product>hotel</product>  
    <request command="searchhotels">  
        <bookingDetails>  
            <fromDate>2014-11-29</fromDate>  
            <toDate>2014-11-30</toDate>  
            <currency>492</currency>  
            <rooms no="1">  
                <room runno="0">  
                    <adultsCode>2</adultsCode>  
                    <children no="0"></children>  
                    <extraBed>0</extraBed>  
                    <rateBasis>-1</rateBasis>  
                    <passengerNationality> DOTW internal code</passengerNationality>  
                    <passengerCountryOfResidence> DOTW internal code</passengerCountryOfResidence>  
                </room>  
            </rooms>  
        </bookingDetails>  
        <return>  
            <sorting order="asc">sortByPrice</sorting>  
            <getRooms>true</getRooms>  
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">  
                <c:condition>  
                    <a:condition>  
                        <fieldName>hotelId</fieldName>  
                        <fieldTest>in</fieldTest>  
                        <fieldValues>  
                            <fieldValue>31234</fieldValue>  
                            <fieldValue>30674</fieldValue>  
                            <fieldValue>37094</fieldValue>  
                        </fieldValues>  
                    </a:condition>  
                </c:condition>  
            </filters>  
        </return>  
    </request>  
</customer>  
 

No	Test	Status/Observation
 	Occupancy Tests	 
1.	Create a booking for 2 Adults Occupancy	 
2	Create a booking for 2adults+1child (11 years old)	 
3	Create a booking for 2 adults+2children (8,9 years old) (the child runno attribute must start with 0)	 
4	Create a booking for 2 rooms. (1 single + 1 double)	 
 	Cancelbooking process (if this functionality is implemented) using cancelbooking or deleteItinerary method.	 
5	Create a booking for a single room outisde cancellation deadline and then cancel it (if the application has implemented this functionality) and check that the correct data is passed to DOTW server.	 
6	Create a booking for 2 rooms (1 single + 1 triple) within cancellation deadline and then cancel it (if the application has implemented this functionality). Verify if correct penalties and data is passed to DOTW server.	 
 	Cancelbooking Process using deleteItinerary method	 
7	An additional test should be made to verify that in cases when productsLeftOnItinerary element is returned with a value grater than 0, the application should display a message that not all the services have been successfully cancelled.	 
 	Mandatory elements to be displayed/implemented in the customer’s application	 
8	Tariff Notes: Verify if in cases when the tarifNotes element is populated the same is displayed in the customer’s application. We have no restriction regarding the step where the customer’s application should display the tariff Notes.	 
9	Cancellation Rules and Policies: Verify that correct cancellation rules are displayed your application. In case your application is adding a buffer to DOTW cancellation rules, please specify the same.	 
10	Passenger Names Restrictions It is mandatory to implement the following restrictions in matter of passenger names:
names should contain minimum 2 characters and maximum 25;
no white spaces or special characters allowed;
all the adults passenger names should be passed in the confirmbooking request
 
11	MinimumSellingPrice (ONLY FOR B2C applications) This element returns the minimum selling price that the customer should adhere to while distributing the product directly to the final consumer (B2C). The application must display the MSP, or higher, if selling directly to the final customer. The MSP cannot be undercut and this is a mandatory requirement from all the hotel chains working on direct connectivity.	 
12	Property Fees
The amount breakdown must be shown in your UI during the booking process. This is highlighted in the XML responses trough element	 
13	Total taxes
These taxes are applied in any rate by the government of each destination, for example the VAT. They are included in the total price. The amount is returned in XML responses via element	 
14	Gzip Compression It is mandatory to enable the Gzip in the source code of your application so that outgoing requests from your API to add in the header Accept-Enconding gzip, deflate	 
15	Blocking step validation It is mandatory for you to implement a validation in the blocking step (getrooms request) in order to always verify if the selected room/s and rate bases have been successfully blocked (returned with checked	 
16	Changed Occupancy Feature * Select to book a rate with changed Occupancy (changedOccupancy element must be present). In order to force the system to return rates with changed occupancy, please make a search for at least 4 passengers (3 Adults+1 child; 4 Adults, etc). Make sure the correct details are passed to DOTW server. Please refer to the separate document, which explains how changed occupancy feature should be implemented.	 
17	Special Promotions In case of a rate with an applicable special promotion, make sure that you display the same at your end. Please take into consideration that the special promotions are defined per rate and not per rooom. Please refer to the separate document, which explains how specials should be treated.	 
18	APRs (If supported) Book an APR and make sure that your application does not allow cancel action to the user. APRs can be identified in the XML response by the element: • nonRefundable(value:yes)	 
19	Restricted Cancellation Rules Select to book a rate with strict cancellation rules. This type of rates can be identified in the xml response by the below elements:
cancelRestricted (possible value=true);
amendRestricted (possible value=true)
When present, this elements indicate that cancel and/or amend is restricted in the period defiend by the cancellation policy.	 
20	Minimum Stay Rules. ** Create a reservation for a rate with an applicable minimumStay rule and make sure the new stay period is communicated to the user.

minStay If the hotel has requested a minimum stay for this room type and rate basis then this element will be returned and its value will be the minimum stay required in days. If no minimum stay applies this element will be returned with no value (empty tag).

dateApplyMinStay If there is a minimum stay condition this element will specify the starting date when the minium stay condition applies. If no minimum stay applies this element will be returned with no value (empty tag).	 
21	Special Requests *** Verify that correct DOTW internal code is being sent in XML messge, for the selected special request.	 
 

*If you are not willing to implement the changed occupancy Feature, it is mandatory for you to filter these rates and not show them to your customers. You can implement a validaiton based on validForOccupancy/changedOccupancy elements.
** If you are not willing to receive this type of rates, we can block them from our side, so you will not receive rates which have a minimum stay rule grater than the initial requested stay period.
*** Only if customer’s application has implemented this functionality.
 

 Print Documentation