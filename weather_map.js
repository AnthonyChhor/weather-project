// WEATHER INFORMATION FOR THE 5 DAY FORECAST
(function() {
function geocodeWeatherForecast(searchInput) {
    let html = "";
    geocode(searchInput, mapboxApi).then(function (results) {
        $.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${results[1]}&lon=${results[0]}&appid=${weatherAPI}&units=imperial`).done(function (data) {
            console.log(data);
            let forecastInfo = data.list;

            for (let i = 1; i < 6; i++) {
                html += '<div id="card-' + [i] + '" class="forecast-card card">';
                html += '<div class="date-bg">' + nextFiveDays[i] + '</div>';
                html += "<h6>" + data.city.name + "</h6>";
                html += "<p>Average Temp: " + parseInt(forecastInfo[i].main.temp) + "&deg;" + "F" + "</p>";
                // html += "<p>Max Temp: " + parseInt(forecastInfo[i].main.temp_max) + "&deg;" + "F" + "</p>";
                html += "<div class='weather-icon'>";
                html += '<img src="https://openweathermap.org/img/w/' + forecastInfo[i].weather[0].icon + '.png"></div>';
                html += "<div class='weather'>";
                html += "<p>" + forecastInfo[i].weather[0].main + "</p></div>";
                html += "</div>";
            }
            $("#weather-card").html(html);
            // getDate(forecastInfo[i].dt)
        })
    })
}

geocodeWeatherForecast("Dallas, TX")
$("#myBtn").click(function (e) {
    e.preventDefault();
    geocodeWeatherForecast($("#searchInput").val());
})

// FUNCTION FOR GETTING THE 5-DAY FORECAST

let startDate = new Date()
let nextFiveDays = getNextFiveDays(startDate)

function getNextFiveDays(startDate) {
    const dates = [];
    for (let i = 0; i < 6; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i);
        const formattedDate = getDate(nextDate);
        dates.push(formattedDate);
    }
    return dates;
}

function getDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

//CURRENT WEATHER CARD

function geoCodeCurrentWeather(searchString) {
    let htmlCurrent = "";
    geocode(searchString, mapboxApi).then(function (result) {
        console.log(result[0]);
        console.log(result[1]);
        $.get(`https://api.openweathermap.org/data/2.5/weather?lat=${result[1]}&lon=${result[0]}&appid=${weatherAPI}&units=imperial`).done(function (currentData) {
            console.log(currentData);
            htmlCurrent += "<div class=''>";
            htmlCurrent += '<div class="date-bg">' + nextFiveDays[0] + '</div>';
            htmlCurrent += "<h6>Location: " + currentData.name + "</h6>";
            htmlCurrent += "<p>Current Temperature: " + parseInt(currentData.main.temp) + "&deg;" + "F</p>";
            htmlCurrent += "<div class='current-weather-icon'>"
            htmlCurrent += '<img src="https://openweathermap.org/img/w/' + currentData.weather[0].icon + '.png"></div>';
            htmlCurrent += "<p class='solo-weather'>Weather: " + currentData.weather[0].description + "</p>";
            htmlCurrent += "</div>";
            $("#weather-forecast-small").html(htmlCurrent);
        })
    })
}

// CURRENT FORECAST EXTRA DETAILS

geoCodeCurrentWeather("Dallas, TX")
$("#myBtn").click(function (e) {
    e.preventDefault();
    geoCodeCurrentWeather($("#searchInput").val());
})

function geoCodeCurrentWeatherDetails(searchString) {
    let htmlDetail = "";
    geocode(searchString, mapboxApi).then(function (result) {
        console.log(result[0]);
        console.log(result[1]);

        function timeConverter(UNIX_timestamp) {
            var a = new Date(UNIX_timestamp * 1000);
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = hour + ':' + min + ':' + sec;
            return time;
        }

        $.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${result[1]}&lon=${result[0]}&appid=${weatherAPI}&units=imperial`).done(function (currentData) {
            console.log(currentData);
            htmlDetail += "<div class='text-center text-white bottom-weather-forecast'><h2>Today's Weather Forecast:  </h2></div>";
            htmlDetail += "<div class='d-flex col-12'>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Current average wind speed: " + parseInt(currentData.current.wind_speed) + " knots</p></div>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Max Temp: " + parseInt(currentData.daily[0].temp.max) + "&deg;" + "F</p>\n<p>Min Temp: " + parseInt(currentData.daily[0].temp.min) + "&deg;" + "F</p>\n<p>Feels like: " + parseInt(currentData.current.feels_like) + "&deg;" + "F</p></div>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Weather: " + currentData.current.weather[0].description + "</p>\n<p>Sunrise: " + timeConverter(currentData.current.sunrise) + " A.M.</p>\n<p>Sunset: " + timeConverter(currentData.current.sunset) + " P.M.</p></div>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Current humidity: " + parseInt(currentData.current.humidity) + "</p>\n<p>UVI: " + currentData.daily[0].uvi + "</p>\n<p>Dew Point: " + currentData.current.dew_point + "</p></div>";
            htmlDetail += "</div>";
            $("#weather-forecast-details").html(htmlDetail);
        })
    })
}

geoCodeCurrentWeatherDetails("Dallas, TX")
$("#myBtn").click(function (e) {
    e.preventDefault();
    geoCodeCurrentWeatherDetails($("#searchInput").val());
})

// MARKER LOCATION AND MAPBOX AND FLYTO FUNCTIONS

let personalLocation = [-96.7968, 32.7762];

mapboxgl.accessToken = mapboxApi;
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    zoom: 9, // starting zoom
    center: personalLocation, // [lng, lat]
});

geocode(personalLocation, mapboxgl.accessToken).then(function (result) {
    map.setCenter(result.center);
    map.setZoom(10);
    let myMarker = new mapboxgl.Marker({draggable: true})
        .setLngLat([-96.7968, 32.7762])
        .addTo(map);


    myMarker.on("dragend", function (results) {
        lonResult = myMarker.getLngLat().lng;
        latResult = myMarker.getLngLat().lat
        myMarkerForecast();

        map.flyTo({
            center: myMarker.getLngLat(),
            zoom: 11,
            speed: 1
        });
    });
})

$("#myBtn").click(function (e) {
    e.preventDefault();
    userInput = ($("#searchInput").val());
    geocode(userInput, mapboxgl.accessToken).then(function (result) {
        map.flyTo({
            center: result,
            zoom: 11,
            speed: 1
        });
    })
})

// MARKER WEATHER UPDATE

function myMarkerForecast() {
    $.get("https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=" + latResult + "&lon=" + lonResult + "&appid=" + weatherAPI).done(function (data) {
        console.log(data);
        let html = '';
        let htmlDetail = '';
        let htmlCurrent = '';
        let forecastInfo = data.list;
        let cityLocation = data.city.name;
        let countryLocation = data.city.country;
        console.log(cityLocation + ', ' + countryLocation);

        for (let i = 1; i < 6; i++) {
            html += '<div id="card-' + [i] + '" class="forecast-card card">';
            html += '<div class="date-bg">' + nextFiveDays[i] + '</div>';
            html += "<h6>Location: " + data.city.name + "</h6>";
            html += "<p>Average Temp: " + parseInt(forecastInfo[i].main.temp) + "&deg;" + "F" + "</p>";
            // html += "<p>Max Temp: " + parseInt(forecastInfo[i].main.temp_max) + "&deg;" + "F" + "</p>";
            html += "<div class='weather-icon'>";
            html += '<img src="https://openweathermap.org/img/w/' + forecastInfo[i].weather[0].icon + '.png"></div>';
            html += "<div class='weather'>";
            html += "<p>" + forecastInfo[i].weather[0].main + "</p></div>";
            html += "</div>";
        }
        $("#weather-card").html(html);
        function timeConverter(UNIX_timestamp) {
            var a = new Date(UNIX_timestamp * 1000);
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = hour + ':' + min + ':' + sec;
            return time;
        }
        $.get("https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" + latResult + "&lon=" + lonResult + "&appid=" + weatherAPI).done(function (currentData) {
            console.log(currentData);
            htmlDetail += "<div class='text-center text-white bottom-weather-forecast'><h2>Today's Weather Forecast:  </h2></div>";
            htmlDetail += "<div class='d-flex col-12'>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Current average wind speed: " + parseInt(currentData.current.wind_speed) + " knots</p></div>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Max Temp: " + parseInt(currentData.daily[0].temp.max) + "&deg;" + "F</p>\n<p>Min Temp: " + parseInt(currentData.daily[0].temp.min) + "&deg;" + "F</p>\n<p>Feels like: " + parseInt(currentData.current.feels_like) + "&deg;" + "F</p></div>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Weather: " + currentData.current.weather[0].description + "</p>\n<p>Sunrise: " + timeConverter(currentData.current.sunrise) + " A.M.</p>\n<p>Sunset: " + timeConverter(currentData.current.sunset) + " P.M.</p></div>";
            htmlDetail += "<div class='col-3 card current-weather-details'><p>Current humidity: " + parseInt(currentData.current.humidity) + "</p>\n<p>UVI: " + currentData.daily[0].uvi + "</p>\n<p>Dew Point: " + currentData.current.dew_point + "</p></div>";
            htmlDetail += "</div>";
            $("#weather-forecast-details").html(htmlDetail);
        })
        $.get("https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=" + latResult + "&lon=" + lonResult + "&appid=" + weatherAPI).done(function (currentData) {
            console.log(currentData);
            htmlCurrent += "<div class=''>";
            htmlCurrent += '<div class="date-bg">' + nextFiveDays[0] + '</div>';
            htmlCurrent += "<h6>Location: " + currentData.name + "</h6>";
            htmlCurrent += "<p>Current Temperature: " + parseInt(currentData.main.temp) + "&deg;" + "F</p>";
            htmlCurrent += "<div class='current-weather-icon'>"
            htmlCurrent += '<img src="https://openweathermap.org/img/w/' + currentData.weather[0].icon + '.png"></div>';
            htmlCurrent += "<p class='solo-weather'>Weather: " + currentData.weather[0].description + "</p>";
            htmlCurrent += "</div>";
            $("#weather-forecast-small").html(htmlCurrent);
        })

    })
}

})();

















