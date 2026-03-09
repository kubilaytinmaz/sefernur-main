
Please take into consideration these focus points when developing / testing your application. During the certification process performed from our side, your application should have all these points covered. 

	•	Minimum stay
There are cases when in the search results there are returned rooms for which a minimum stay rule applies.  These rules are highlighted in the XML responses by elements such as minStay and dateApplyMinStay. When the minStay element is returned empty it means that there is no minimum stay rule applying for that rate, but if returned populated, the value returned is equal to the minimum number of nights that the rate can be booked on. 
Our advice is that the application should take into consideration the <minStay></minStay> tags and if populated to inform the customer in the booking for that the room chosen has a minimum stay policy.
Please note that we can manage this from our side and if you want, we can filter out the rooms that have a minimum stay policy that is higher than the number of nights requested for booking. Please let us know if we should apply this filter from our side or you will manage it from yours.

	•	 Passenger Nationality and Country of Residence
Nationality and Residence check is mandatory for all customers now. Since most products are now with specific source markets and nationality, we need this to be implemented in all XML conductivities. The Passenger Nationality and Country of Residence can be found in the documentation under Hotels Comm. Structure, elements are mandatory for SearchHotels, GetRooms , ConfirmBooking, saveBooking requests. The list of the countries can be accessed with the getallcountries command in the Internal Codes section of the documentation.

	•	 Passenger name format Some of our suppliers accept only a booking confirmation of this format, so is mandatory that the Passenger Name are formatted like this:
	•	names should contain minimum 2 characters and maximum 25.
	•	Same names for multiple passengers are not allowed.
	•	no white spaces, numbers or special characters allowed.
	•	all the passenger names should be passed in the savebooking/confirmbooking request, including children.
	•	In case of multiple first/last name, automatically trim the white spaces. Full Name:  James Lee Happy Traveler  <firstName>JamesLee</firstName>  <lastName>HappyTraveler</lastName>

	•	Displaying tariffNotes Displaying of the content in the <tariffNotes> tag present in the getRooms response is a must because it contains free text information provided by suppliers or notes regarding any specific policy or information of the hotel.  e.g.
<tariffNotes>
Rate Notes:
Hotel Tariff Notes:
No show, early departure or late cancellation will be subject to a 1-night charge. “Bookings including children will be based on sharing parents bedding, no separate bed for children is provided unless otherwise stated”. Bookings including children will be based on sharing parents bedding and no separate bed for children is provided unless otherwise stated.
</tariffNotes>



                                                    
	•	Voucher details
The content of the tag <paymentGuaranteedBy></paymentGuaranteedBy> returned in the confirmBooking response must be displayed on the voucher that you are sending to the customer.
e.g.     <paymentGuaranteedBy>Payment is guaranteed by: DOTW, as per final booking form reference No: HTL-AE2-7159****</paymentGuaranteedBy>

	•	 Bookings with both adults and children.  When doing a search for both adults and children you should consider the age selection interval accepted by our suppliers which is 1-12 years. Also consider that there are some restrictions regarding the number of children for each room: There can be a maximum of 2 children for every adult declared in the occupancy and there can be no more than 4 children per room.

	•	Advance Purchasing Rates 
Advance Purcase Rates are rates that are paid upfront from your existing credit and that cannot ever be deleted or modified. However, the APRs are very competitive price wise. These rates come with an attribute flag (nonrefundable set on YES) 

	•	Minimum Selling Price   If your application is using a B2C distribution platform or developing as a Tech Platform, you must take into consideration total MinimumSelling and PriceMinimumSelling elements. These elements return the minimum selling price that the customer should adhere to while distributing the product directly to the final consumer (B2C). The application must display the MSP or higher if selling directly to the final customer. The MSP cannot be undercut, and this is a mandatory requirement from all the hotel chains working on direct connectivity.  
	•	Allocation details
Please make sure that the allocation details are sent correctly.
In the confirmBooking/ saveBooking request the application must pass the allocation details returned by the getRooms with blocking step response. 

	•	 Booking cancellation with charge
The cancelBooking process has also two steps.
Passing the correct amount (charge) that the customer must pay in the case of penalty charges is very important. For doing that your application has to send the cancelBooking (<confirm>no</confirm>) request to find out if there are cancellation charges. In case the value returned in the <charge> tag is different than 0 that value has to be passed in the second step of the cancellation process, cancelBooking (<confirm>yes</confirm>) in the <penaltyApplied></penaltyApplied> tag. Please make sure that the value passed is the one returned in the charge element and not the one contained in the <formatted></formatted> tag.

	•	Cancellation policy display
Please note that the price and cancellation policy must be displayed in the application from the getRooms response only. To obtain accurate information we advise that when a hotel is being selected from the availability returned list, a getRooms (without roomTypeSelected node) should be sent to retrieve the correct information regarding the price and cancellation policy.

	•	 Static data download
Static inventory can be obtained using our dedicated method detailed in our online documentation at Startup guide/Static Data Download Guide section.

	•	searchHotels by hotelID request
For improved performance and lower response rate the shopping method has been updated. Please note that this is not a mandatory requirement, but if not implemented DOTW cannot guarantee a response time under 8 seconds on an average for the searchHotels method. Basically grouping the hotels by 50 per request the response time will be generated a lot quicker, and you can also target preferred hotels in a certain city or region.  If in the area you are searching for the number of hotels you are interested in is higher, your application should send multiple searchHotels requests. So, if you want to target all 700 hotels available for Dubai your application should send 14 searchHotels requests each one containing a list of a maximum 50 hotelIds. Please see below a build example of implementation for the new searchHotels request:
Example of searchHotels by productID request
<customer >
    <username></username>
    <password></password>
    <id></id>
    <source>1</source>
    <product>hotel</product>
    <request command="searchhotels">
        <bookingDetails>
            <fromDate>2025-11-29</fromDate>
            <toDate>2025-11-30</toDate>
            <currency>520</currency> 
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
            <filters>
                <c:condition>
                    <a:condition>
                        <fieldName>hotelId</fieldName>
                        <fieldTest>in</fieldTest>
                        <fieldValues>
                            <fieldValue>31234</fieldValue>
                            <fieldValue>30674</fieldValue>
                            ...
                            ...                           
                            <fieldValue>37094</fieldValue>
                        </fieldValues>
                    </a:condition>                  
                </c:condition>
            </filters>
        </return>
    </request>
</customer>
















