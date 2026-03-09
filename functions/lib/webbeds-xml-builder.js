const { WEBBEDS_CONFIG, md5Hash } = require("./webbeds-config");

function wrapWithCustomer(requestXml) {
  const encryptedPassword = md5Hash(WEBBEDS_CONFIG.password);
  return `<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${WEBBEDS_CONFIG.username}</username>
    <password>${encryptedPassword}</password>
    <id>${WEBBEDS_CONFIG.companyId}</id>
    <source>${WEBBEDS_CONFIG.source}</source>
    <product>${WEBBEDS_CONFIG.product}</product>
    <language>${WEBBEDS_CONFIG.language}</language>
    ${requestXml}
</customer>`;
}

function buildRoomsXml(rooms, nationality, countryOfResidence) {
  const roomLines = rooms
    .map((room, i) => {
      const childrenCount = (room.childAges && room.childAges.length) || room.children || 0;
      let childrenXml;
      if (childrenCount === 0) {
        childrenXml = `        <children no="0"></children>`;
      } else {
        const childLines = (room.childAges || [])
          .map((age, j) => `            <child runno="${j}">${age}</child>`)
          .join("\n");
        childrenXml = `        <children no="${childrenCount}">\n${childLines}\n        </children>`;
      }
      return `    <room runno="${i}">
        <adultsCode>${room.adults}</adultsCode>
${childrenXml}
        <rateBasis>-1</rateBasis>
        <passengerNationality>${nationality}</passengerNationality>
        <passengerCountryOfResidence>${countryOfResidence}</passengerCountryOfResidence>
    </room>`;
    })
    .join("\n");

  return `<rooms no="${rooms.length}">\n${roomLines}\n</rooms>`;
}

function buildSearchHotelsXML(params) {
  const roomsXml = buildRoomsXml(params.rooms, params.nationality, params.nationality);
  const inner = `<request command="searchhotels">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${params.currency}</currency>
        ${roomsXml}
    </bookingDetails>
    <return>
        <filters>
            <city>${params.cityCode}</city>
        </filters>
    </return>
</request>`;
  return wrapWithCustomer(inner);
}

function buildSearchByIdsXML(params) {
  const hotelIdsXml = params.hotelIds
    .map((id) => `                            <fieldValue>${id}</fieldValue>`)
    .join("\n");
  const inner = `<request command="searchhotels">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${params.currency}</currency>
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
            <noPrice>true</noPrice>
            <c:condition>
                <a:condition>
                    <fieldName>hotelId</fieldName>
                    <fieldTest>in</fieldTest>
                    <fieldValues>
${hotelIdsXml}
                    </fieldValues>
                </a:condition>
            </c:condition>
        </filters>
        <fields>
            <field>hotelName</field>
            <field>address</field>
            <field>fullAddress</field>
            <field>rating</field>
            <field>hotelImages</field>
            <field>description1</field>
            <field>geoPoint</field>
            <field>cityName</field>
            <field>cityCode</field>
            <field>countryName</field>
            <field>countryCode</field>
            <field>preferred</field>
        </fields>
    </return>
</request>`;
  return wrapWithCustomer(inner);
}

function buildGetRoomsXML(params) {
  const roomsXml = buildRoomsXml(params.rooms, params.nationality, params.nationality);
  const inner = `<request command="getrooms">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${params.currency}</currency>
        ${roomsXml}
        <productId>${params.hotelId}</productId>
    </bookingDetails>
</request>`;
  return wrapWithCustomer(inner);
}

function buildBlockRoomXML(params) {
  const nationality = params.nationality || 5;
  const currency = params.currency || 520;
  const inner = `<request command="getrooms">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${currency}</currency>
        <rooms no="1">
            <room runno="0">
                <adultsCode>${(params.rooms && params.rooms[0] && params.rooms[0].adults) || 2}</adultsCode>
                <children no="0"></children>
                <rateBasis>-1</rateBasis>
                <passengerNationality>${nationality}</passengerNationality>
                <passengerCountryOfResidence>${nationality}</passengerCountryOfResidence>
                <roomTypeSelected>
                    <code>${params.roomTypeCode}</code>
                    <selectedRateBasis>${params.selectedRateBasis}</selectedRateBasis>
                    <allocationDetails>${params.allocationDetails}</allocationDetails>
                </roomTypeSelected>
            </room>
        </rooms>
        <productId>${params.hotelId}</productId>
    </bookingDetails>
</request>`;
  return wrapWithCustomer(inner);
}

function buildBookingXML(params) {
  const currency = params.currency || 520;
  const childrenAges = params.childrenAges || [];
  const childrenXml =
    childrenAges.length === 0
      ? `<children no="0"></children>`
      : `<children no="${childrenAges.length}">\n${childrenAges.map((a, i) => `                    <child runno="${i}">${a}</child>`).join("\n")}\n                </children>`;

  const inner = `<request command="confirmbooking">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${currency}</currency>
        <productId>${params.hotelId}</productId>
        <customerReference>${params.customerReference}</customerReference>
        <rooms no="1">
            <room runno="0">
                <roomTypeCode>${params.roomTypeCode}</roomTypeCode>
                <selectedRateBasis>${params.selectedRateBasis}</selectedRateBasis>
                <allocationDetails>${params.allocationDetails}</allocationDetails>
                <adultsCode>${params.adultsCode}</adultsCode>
                <actualAdults>${params.actualAdults}</actualAdults>
                ${childrenXml}
                <actualChildren no="0"></actualChildren>
                <extraBed>0</extraBed>
                <passengerNationality>5</passengerNationality>
                <passengerCountryOfResidence>5</passengerCountryOfResidence>
                <passengersDetails>
                    <passenger leading="yes">
                        <salutation>${params.leadPassenger.salutation}</salutation>
                        <firstName>${params.leadPassenger.firstName}</firstName>
                        <lastName>${params.leadPassenger.lastName}</lastName>
                    </passenger>
                </passengersDetails>
                <specialRequests count="0"/>
            </room>
        </rooms>
    </bookingDetails>
</request>`;
  return wrapWithCustomer(inner);
}

module.exports = {
  buildSearchHotelsXML,
  buildSearchByIdsXML,
  buildGetRoomsXML,
  buildBlockRoomXML,
  buildBookingXML,
};
