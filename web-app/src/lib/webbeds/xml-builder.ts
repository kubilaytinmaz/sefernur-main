import { WEBBEDS_CONFIG, md5Hash } from "./config";

interface Room {
  adults: number;
  children: number;
  childAges?: number[];
}

/**
 * Wraps inner <request> XML with <customer> auth envelope — V4 DOTW format.
 */
function wrapWithCustomer(requestXml: string): string {
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

function buildRoomsXml(
  rooms: Room[],
  nationality: number,
  countryOfResidence: number,
): string {
  const roomLines = rooms
    .map((room, i) => {
      const childrenCount = room.childAges?.length ?? room.children ?? 0;
      let childrenXml: string;
      if (childrenCount === 0) {
        childrenXml = `        <children no="0"></children>`;
      } else {
        const childLines = (room.childAges ?? [])
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

/**
 * Search hotels by city or country with pricing.
 * V4 API returns: result > hotels > hotel[@hotelid] > rooms > room > roomType > rateBases > rateBasis > total
 * 
 * IMPORTANT: V4 searchhotels does NOT return hotel names, addresses, images etc.
 * by default. Only hotelid + pricing data is returned.
 * To get hotel details, use buildSearchByIdsXML with <fields> and <noPrice>true</noPrice>.
 */
export function buildSearchHotelsXML(params: {
  cityCode?: number;
  countryCode?: number;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  nationality: number;
  currency: number;
}): string {
  const roomsXml = buildRoomsXml(params.rooms, params.nationality, params.nationality);

  let filters = "";
  if (params.cityCode) {
    filters = `<filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
                <city>${params.cityCode}</city>
              </filters>`;
  } else if (params.countryCode) {
    filters = `<filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
                <country>${params.countryCode}</country>
              </filters>`;
  } else {
    filters = `<filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
              </filters>`;
  }

  const inner = `<request command="searchhotels">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${params.currency}</currency>
        ${roomsXml}
    </bookingDetails>
    <return>
        ${filters}
    </return>
</request>`;

  return wrapWithCustomer(inner);
}

/**
 * Search hotels by IDs with noPrice + fields to get hotel metadata (static data).
 * Returns hotel name, address, images, rating, geoPoint etc. WITHOUT pricing.
 * 
 * V4 Response format:
 * result > hotels > hotel[@hotelid] > hotelName, address, fullAddress, rating, 
 *   hotelImages > thumb, image[], geoPoint > lat, lng, cityName, etc.
 */
export function buildSearchByIdsXML(params: {
  hotelIds: string[];
  checkIn: string;
  checkOut: string;
  currency: number;
  nationality?: number;
}): string {
  const nat = params.nationality ?? 5;
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
                <passengerNationality>${nat}</passengerNationality>
                <passengerCountryOfResidence>${nat}</passengerCountryOfResidence>
            </room>
        </rooms>
    </bookingDetails>
    <return>
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
            <field>description2</field>
            <field>geoPoint</field>
            <field>cityName</field>
            <field>cityCode</field>
            <field>countryName</field>
            <field>countryCode</field>
            <field>preferred</field>
            <field>hotelCheckIn</field>
            <field>hotelCheckOut</field>
        </fields>
    </return>
</request>`;

  return wrapWithCustomer(inner);
}

/**
 * Search hotels by IDs WITH pricing (no noPrice flag).
 * Used when we need both hotel availability and pricing for specific hotel IDs.
 * Max 50 hotel IDs per request as recommended by DOTW docs.
 */
export function buildSearchByIdsWithPriceXML(params: {
  hotelIds: string[];
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  currency: number;
  nationality?: number;
}): string {
  const nat = params.nationality ?? 5;
  const roomsXml = buildRoomsXml(params.rooms, nat, nat);
  const hotelIdsXml = params.hotelIds
    .map((id) => `                            <fieldValue>${id}</fieldValue>`)
    .join("\n");

  const inner = `<request command="searchhotels">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${params.currency}</currency>
        ${roomsXml}
    </bookingDetails>
    <return>
        <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
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
    </return>
</request>`;

  return wrapWithCustomer(inner);
}

/**
 * Get rooms for a specific hotel.
 * V4 Response format:
 * result > hotel[@hotelid, @name] > rooms > room > roomType[@roomtypecode] > 
 *   name, rateBases > rateBasis[@id] > rateType, total, cancellationRules, allocationDetails
 */
export function buildGetRoomsXML(params: {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  nationality: number;
  currency: number;
}): string {
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

/**
 * Block a room (pre-booking validation).
 * V4 requires roomTypeSelected to be sent inside the <room> element.
 * Response must contain <status>checked</status> before proceeding to booking.
 */
export function buildBlockRoomXML(params: {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  roomTypeCode: string;
  selectedRateBasis: string;
  allocationDetails: string;
  nationality?: number;
  currency?: number;
}): string {
  const nationality = params.nationality ?? 5;
  const currency = params.currency ?? 520;

  const inner = `<request command="getrooms">
    <bookingDetails>
        <fromDate>${params.checkIn}</fromDate>
        <toDate>${params.checkOut}</toDate>
        <currency>${currency}</currency>
        <rooms no="1">
            <room runno="0">
                <adultsCode>${params.rooms[0]?.adults ?? 2}</adultsCode>
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

/**
 * Confirm booking.
 * Must be called ONLY after a successful block (status=checked).
 */
export function buildBookingXML(params: {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  currency?: number;
  customerReference: string;
  roomTypeCode: string;
  selectedRateBasis: string;
  allocationDetails: string;
  adultsCode: number;
  actualAdults: number;
  childrenAges?: number[];
  leadPassenger: {
    salutation: number;
    firstName: string;
    lastName: string;
  };
}): string {
  const currency = params.currency ?? 520;
  const childrenAges = params.childrenAges ?? [];
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
