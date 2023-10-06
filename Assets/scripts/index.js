const weather = document.getElementById("weather");
const airQuality = document.getElementById("airQuality");
const currentWeatherSpan = document.querySelectorAll(".currentWeather");
const legend = document.getElementById("legend");
const legendAirQuality = document.getElementById("legendAirQuality");
const searchCity = document.getElementById("search");
let city = document.getElementById("city");

legend.addEventListener("click", () => {
    legendAirQuality.classList.toggle("active");
}, false);

let latitude = 44.4375;
let longitude = 26.125;
let cityName = "Bucharest";

window.addEventListener("DOMContentLoaded", fetchAPI, true);


searchCity.addEventListener("change", () => {
    console.log(searchCity.value);

    try {
        if (searchCity.value.length <= 1 || searchCity.value === " ") {
            searchCity.value = "Bucharest";
        }
    } catch (error) {
        console.error(error);
    }

    const geoCoding = `https://geocoding-api.open-meteo.com/v1/search?name=${searchCity.value}&count=1&language=en&format=json`;


    fetch(geoCoding)
        .then(response => {
            if (response.status !== 200) {
                throw new Error("Failed to fetch geo data");
            }
            return response.json();
        })
        .then(data => {
            updateLatitudeLongitude(data);
        })
        .catch(error => {
            alert("Sorry, but we didn't find that city in our database. Please try again with another city.");
            console.error(error);
        });
}, false);

let weatherAPI;
let airQualityAPI;

let date = new Date();
let nowDate;
if ((date.getMonth() + 1) >= 10 && date.getDate() >= 10) {
    nowDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
} else if ((date.getMonth() + 1) <= 10 && date.getDate() >= 10) {
    nowDate = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-" + date.getDate();
} else if ((date.getMonth() + 1) >= 10 || date.getDate() <= 10) {
    nowDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-0" + date.getDate();
} else {
    nowDate = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate();
}


function updateLatitudeLongitude(data) {
    cityName = data.results[0].name;
    city.innerText = cityName;

    while (airQuality.hasChildNodes()) {
        airQuality.removeChild(airQuality.firstChild);
    }
    while (weather.hasChildNodes()) {
        weather.removeChild(weather.firstChild);
    }

    latitude = data.results[0].latitude;
    longitude = data.results[0].longitude;
    weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,rain,windspeed_10m,winddirection_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum&current_weather=true&timezone=auto&forecast_days=1`;

    airQualityAPI = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5&timezone=auto&start_date=${nowDate}&end_date=${nowDate}`;
    fetchAPI();
}

weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,rain,windspeed_10m,winddirection_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum&current_weather=true&timezone=auto&forecast_days=1`;

airQualityAPI = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5&timezone=auto&start_date=${nowDate}&end_date=${nowDate}`;



function fetchAPI() {
    // Weather Fetch API
    fetch(weatherAPI)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch weather");
            }
            return response.json()
        })
        .then(data => {
            createWeather(data);
            currentWeatherFunction(data);
        })
        .catch(errors => {
            console.error(errors);
        });

    // Air Quaity Fetch API
    fetch(airQualityAPI)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch air quality");
            }
            return response.json()
        })
        .then(data => {
            createWeather(data);
        })
        .catch(errors => {
            console.log(airQualityAPI);
            console.error(errors);
        });
}

function createWeather(data) {
    city.innerText = cityName;
    for (let i = 0; i < data.hourly.time.length; i++) {
        let cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        if (Object.keys(data.hourly_units).includes("pm10")) {
            airQuality.appendChild(cardDiv);
        } else {
            weather.appendChild(cardDiv);
        }
        createSpan(i, cardDiv, data.hourly, data.hourly_units);
    }
}

function createSpan(i, cardDiv, hourlyObject, hourlyUnit) {
    const keys = Object.keys(hourlyObject);
    const keysUnit = Object.keys(hourlyUnit);
    let span;
    for (let j = 0; j < Object.keys(hourlyObject).length; j++) {
        if (keysUnit[j].includes("time")) {
            span = document.createElement("span");
            if (hourlyObject.time[i].includes("T")) {
                let timeNew = hourlyObject.time[i];
                let saveTime = timeNew.replace("T", " ");
                span.innerText = saveTime;
            }
            cardDiv.appendChild(span);
            continue;
        }
        span = document.createElement("span");
        span.innerText = hourlyObject[keys[j]][i] + " " + hourlyUnit[keysUnit[j]];
        cardDiv.appendChild(span);
    }
    return cardDiv;
}

function currentWeatherFunction(data) {
    const keys = Object.keys(data.current_weather);
    const currentWeatherSpanArray = Array.from(currentWeatherSpan);
    for (let i = 0; i < currentWeatherSpanArray.length; i++) {
        switch (keys[i]) {
            case "temperature":
                currentWeatherSpanArray[i].innerText = data.current_weather.temperature + " °C";
                break;
            case "windspeed":
                currentWeatherSpanArray[i].innerText = data.current_weather.windspeed + " km/h";
                break;
            case "winddirection":
                currentWeatherSpanArray[i].innerText = data.current_weather.winddirection + "°";
                break;

            default:
                break;
        }
    }
}

