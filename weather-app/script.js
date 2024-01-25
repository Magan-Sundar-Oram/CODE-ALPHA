const weatherInfoElement = document.getElementById('weather-info');
const mapElement = document.querySelector('#map');
const weatherByInputBtn = document.querySelector('#getWeatherBtn')
const weatherByLocation = document.querySelector('#weather-location')
const apiKey = '97fcd506bf4ff5bf4e39ecc7b841a0f8';
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-box');


async function getWeatherData(city) {
    showLoader();
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 404) {
                alert('City not found.');
                return null;
            } else {
                console.error('Error fetching weather data. HTTP Status:', response.status);
                return null;
            }
        }
        const data = await response.json();
        hideLoader();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        hideLoader();
        return null;
    }
}

//loader...
function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}
/********** */

//Weather description background
const city_Name = document.querySelector('#city-name')
const city_Box = document.querySelector('#city-box');
function descriptionBackground(data) {
    const desIcon = document.createElement('img');
    city_Box.append(desIcon);
    console.log(data);
    if (data === 'mist') {
        weatherInfoContainer.style.backgroundImage = "url('./image/mist.png')"
        weatherInfoContainer.style.color = 'white'
        desIcon.setAttribute('src', 'https://openweathermap.org/img/wn/50d@2x.png')
    } else if (data === 'clear sky') {
        weatherInfoContainer.style.backgroundImage = "url('./image/clearsky.png')"
        weatherInfoContainer.style.color = 'white'
        city_Name.style.color='lightblue'
    } else if (data === 'broken clouds') {
        weatherInfoContainer.style.backgroundImage = "url('./image/brokencloud.png')"
        weatherInfoContainer.style.color = 'white'
        city_Name.style.color='lightblue'

       
    } else if (data === 'few clouds') {
        weatherInfoContainer.style.backgroundImage = "url('./image/fewclouds.png')"
        weatherInfoContainer.style.color = 'white'
    } else if (data === 'scattered clouds') {
        weatherInfoContainer.style.backgroundImage = "url('./image/scattercloud.png')"
        weatherInfoContainer.style.color = 'black'
    } else if (data === 'shower rain') {
        weatherInfoContainer.style.backgroundImage = "url('./image/showerrain.png')"
        weatherInfoContainer.style.color = 'white'
    } else if (data === 'rain') {
        weatherInfoContainer.style.backgroundImage = "url('./image/rain.png')"
        weatherInfoContainer.style.color = 'white'
        city_Name.style.color='lightblue'
    } else if (data === 'thunderstrom') {
        weatherInfoContainer.style.backgroundImage = "url('./image/thunderstrom.png')"
        weatherInfoContainer.style.color = 'white'
        city_Name.style.color='lightblue'
    } else if (data === 'snow') {
        weatherInfoContainer.style.backgroundImage = "url('./image/snow.png')"
        weatherInfoContainer.style.color = 'white'
        city_Name.style.color='lightblue'
    } else {
        weatherInfoContainer.style.backgroundImage = "url('./image/default.png')"
        weatherInfoContainer.style.color = 'white'
        city_Name.style.color='white'
    }

}



function updateWeatherInfo(weatherData) {
    if (weatherData) {
        const city = weatherData.name;
        const temperature = weatherData.main.temp;
        const humidity = weatherData.main.humidity;
        const description = weatherData.weather[0].description;
        const windSpeed = weatherData.wind.speed;
        city_Name.innerText = city;
        // weatherInfoElement.appendChild(city_Name)
        weatherInfoElement.innerHTML = `
            <span>Temperature: ${temperature} °C</span>
            <span>Description: ${description}</span>
            <span>Wind Speed: ${windSpeed} km/hr</span>
            <span>Humidity: ${humidity} %</span>
        
            `;
    } else {
        weatherInfoElement.innerHTML = '<p>Unable to fetch weather data</p>';
    }
}

window.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
        handleUserInput();
    }
})
weatherByInputBtn.addEventListener('click', handleUserInput);
let city
async function handleUserInput() {
    city = cityInput.value.trim();

    if (city) {
        cityInput.style.borderColor = 'lightblue';
        cityInput.style.boxShadow = '4px 4px lightblue';

        const weatherData = await getWeatherData(city);
        if (weatherData) {
            const { coord } = weatherData;
            updateWeatherInfo(weatherData);
            initMap(coord.lat, coord.lon);
            descriptionBackground(weatherData.weather[0].description)
        }
    } else {
        // alert('Please enter a city name.');
        cityInput.style.borderColor = 'red';
        cityInput.style.boxShadow = '4px 4px red';


    }
}

//Weather By Location
async function getWeatherByLocation(lat, lon) {
    showLoader();
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl)
        const weatherData = await response.json();
        updateWeatherInfo(weatherData);
        descriptionBackground(weatherData.weather[0].description)
        hideLoader();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        hideLoader();
        return null;
    }
}

weatherByLocation.addEventListener('click', getLocation)

function getLocation() {
    cityInput.style.borderColor = 'lightblue';
    cityInput.style.boxShadow = '4px 4px lightblue';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude);
                initMap(latitude, longitude);
            },
            error => {
                console.error('Error getting location:', error);
                if (error.code === 1) {
                    alert('Location permission denied. Please enter a city name manually.');
                } else {
                    alert('Error getting location. Please enter a city name manually.');
                }
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please enter a city name manually.');
    }
}

//map view
let map;
let marker;

function initMap(lat, lon) {
    mapElement.innerHTML = '';
    if (map) map.remove();
    map = L.map('map').setView([lat, lon], 11);
    marker = L.marker([lat, lon]).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.invalidateSize();
    marker.bindPopup(`<b>${city}📌`);
    mapElement.style.boxShadow='5px 5px #3498dbb9'
}
