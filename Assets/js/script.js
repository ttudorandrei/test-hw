var APIkey = "28192cc5dd81f85bcfd688d592d9a8ab";

var cityInputEl = $("#city-input");
var searchBtn = $("#search-button");
var clearBtn = $("#clear-button");
var pastSearchedCitiesEl = $("#past-searches");

var currentCity;
function getWeather(data) {
  var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${APIkey}`;
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var currentConditionsEl = $("#currentConditions");
      currentConditionsEl.addClass("border border-primary");

      var cityNameEl = $("<h2>");
      cityNameEl.text(currentCity);
      currentConditionsEl.append(cityNameEl);

      var currentCityDate = data.current.dt;
      currentCityDate = moment.unix(currentCityDate).format("DD/MM/YYYY");
      var currentDateEl = $("<span>");
      currentDateEl.text(` (${currentCityDate}) `);
      cityNameEl.append(currentDateEl);

      var currentCityWeatherIcon = data.current.weather[0].icon;
      var currentWeatherIconEl = $("<img>");
      currentWeatherIconEl.attr(
        "src",
        "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png"
      );
      cityNameEl.append(currentWeatherIconEl);

      var currentCityTemp = data.current.temp;
      var currentTempEl = $("<p>");
      currentTempEl.text(`Temp: ${currentCityTemp}°C`);
      currentConditionsEl.append(currentTempEl);

      var currentCityWind = data.current.wind_speed;
      var currentWindEl = $("<p>");
      currentWindEl.text(`Wind: ${currentCityWind} KPH`);
      currentConditionsEl.append(currentWindEl);

      var currentCityHumidity = data.current.humidity;
      var currentHumidityEl = $("<p>");
      currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`);
      currentConditionsEl.append(currentHumidityEl);

      var currentCityUV = data.current.uvi;
      var currentUvEl = $("<p>");
      var currentUvSpanEl = $("<span>");
      currentUvEl.append(currentUvSpanEl);

      currentUvSpanEl.text(`UV: ${currentCityUV}`);

      if (currentCityUV < 3) {
        currentUvSpanEl.css({ "background-color": "green", color: "white" });
      } else if (currentCityUV < 6) {
        currentUvSpanEl.css({ "background-color": "yellow", color: "black" });
      } else if (currentCityUV < 8) {
        currentUvSpanEl.css({ "background-color": "orange", color: "white" });
      } else if (currentCityUV < 11) {
        currentUvSpanEl.css({ "background-color": "red", color: "white" });
      } else {
        currentUvSpanEl.css({ "background-color": "violet", color: "white" });
      }

      currentConditionsEl.append(currentUvEl);

      var fiveDayForecastHeaderEl = $("#fiveDayForecastHeader");
      var fiveDayHeaderEl = $("<h2>");
      fiveDayHeaderEl.text("5-Day Forecast:");
      fiveDayForecastHeaderEl.append(fiveDayHeaderEl);

      var fiveDayForecastEl = $("#fiveDayForecast");

      for (var i = 1; i <= 5; i++) {
        var date;
        var temp;
        var icon;
        var wind;
        var humidity;

        date = data.daily[i].dt;
        date = moment.unix(date).format("MM/DD/YYYY");

        temp = data.daily[i].temp.day;
        icon = data.daily[i].weather[0].icon;
        wind = data.daily[i].wind_speed;
        humidity = data.daily[i].humidity;

        var card = document.createElement("div");
        card.classList.add("card", "col-2", "m-1", "bg-primary", "text-white");

        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.innerHTML = `<h6>${date}</h6>
        <img src= "http://openweathermap.org/img/wn/${icon}.png"> </><br>
        ${temp}°C<br>
        ${wind} KPH <br>
        ${humidity}%`;

        card.appendChild(cardBody);
        fiveDayForecastEl.append(card);
      }
    });
  return;
}

function displaySearchHistory() {
  var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
  var pastSearchesEl = document.getElementById("past-searches");

  pastSearchesEl.innerHTML = "";

  for (i = 0; i < storedCities.length; i++) {
    var pastCityBtn = document.createElement("button");
    pastCityBtn.classList.add("btn", "btn-primary", "my-2", "past-city");
    pastCityBtn.setAttribute("style", "width: 100%");
    pastCityBtn.textContent = `${storedCities[i].city}`;
    pastSearchesEl.appendChild(pastCityBtn);
  }
  return;
}

async function getCoordinates() {
  var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;
  var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

  fetch(requestUrl)
    .then(function (response) {
      if (response.status >= 200 && response.status <= 299) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (data) {
      var cityInfo = {
        city: currentCity,
        lon: data.coord.lon,
        lat: data.coord.lat,
      };

      storedCities.push(cityInfo);
      localStorage.setItem("cities", JSON.stringify(storedCities));

      displaySearchHistory();

      return cityInfo;
    })
    .then(function (data) {
      getWeather(data);
    });
  return;
}

function handleClearHistory(event) {
  event.preventDefault();
  var pastSearchesEl = document.getElementById("past-searches");

  localStorage.removeItem("cities");
  pastSearchesEl.innerHTML = "";

  return;
}

function clearCurrentCityWeather() {
  var currentConditionsEl = document.getElementById("currentConditions");
  currentConditionsEl.innerHTML = "";

  var fiveDayForecastHeaderEl = document.getElementById(
    "fiveDayForecastHeader"
  );
  fiveDayForecastHeaderEl.innerHTML = "";

  var fiveDayForecastEl = document.getElementById("fiveDayForecast");
  fiveDayForecastEl.innerHTML = "";

  return;
}

function handleCityFormSubmit(event) {
  event.preventDefault();
  currentCity = cityInputEl.val().trim();

  clearCurrentCityWeather();
  getCoordinates();

  return;
}

function getPastCity(event) {
  var element = event.target;

  if (element.matches(".past-city")) {
    currentCity = element.textContent;

    clearCurrentCityWeather();

    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(function (data) {
        var cityInfo = {
          city: currentCity,
          lon: data.coord.lon,
          lat: data.coord.lat,
        };
        return cityInfo;
      })
      .then(function (data) {
        getWeather(data);
      });
  }
  return;
}

displaySearchHistory();

searchBtn.on("click", handleCityFormSubmit);

clearBtn.on("click", handleClearHistory);

pastSearchedCitiesEl.on("click", getPastCity);
