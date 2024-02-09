const form = document.querySelector(".form");
const distance = document.querySelector(".form__input--distance");
const duration = document.querySelector(".form__input--duration");
const cadence = document.querySelector(".form__input--cadence");
const elevation = document.querySelector(".form__input--elevation");
const inputType = document.querySelector(".form__input--type");
const workoutClass = document.querySelector(".workouts");

class workout {
  date = new Date();
  id = Math.floor(Math.random() * 100000) + 1;
  desc;

  constructor(dist, dur, coords) {
    this.distance = dist; //in km
    this.dur = dur; //in min
    this.coords = coords; //[]
  }

  _setDiscription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "Novermber",
      "December",
    ];

    this.desc = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    // return this.desc;
  }
}

class Running extends workout {
  type = "running";
  pace = this.calcPace();

  constructor(dist, dur, coords, cadence) {
    super(dist, dur, coords);
    this.cadence = cadence;
    // this.type = "running";
    this._setDiscription();
  }

  calcPace() {
    //km/h
    this.pace = distance.value / duration.value;
    // console.log(this.pace);
    return this.pace;
  }
}
class Cycling extends workout {
  type = "cycling";
  speed = this.calcSpeed();
  constructor(dist, dur, coords, elevation) {
    super(dist, dur, coords);
    this.elevation = elevation;
    // this.type = "cycling";
    this._setDiscription();
  }

  calcSpeed() {
    this.speed = distance.value / (duration.value / 60);
    return this.speed;
  }
}

// const run = new Running([39, -10], 5.2, 24, 178);
// const cyc = new Cycling([39, -10], 5.2, 24, 178);
// console.log(run, cyc);

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevation);
    workoutClass.addEventListener("click", this._moveToPoint.bind(this));
    this._getLocalStorage();
  }

  _getPosition() {
    // console.log(this._loadMap.bind(this));
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("could not get the current location");
      }
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const latlng = {
      coords: [latitude, longitude],
    };

    // const coords = [latitude, longitude];
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const initMap = async () => {
      const { Map } = await google.maps.importLibrary("maps");
      this.#map = new Map(document.getElementById("map"), {
        center: { lat: latitude, lng: longitude },
        zoom: 13,
      });

      //marker
      this._renderMarker(latlng);

      // infowindow;
      const infocontent = "<p>Your Location</p>";
      this._infoWindow(infocontent, this._renderMarker(latlng));

      //at click evet show form
      google.maps.event.addListener(
        this.#map,
        "click",
        this._showForm.bind(this)
      );

      //set Localstorage workout's marker
      JSON.parse(localStorage.getItem("Workout")).forEach((item) => {
        //Render marker
        this._renderMarker(item);
        //Render infowindow
        const localStorageInfo = `${
          item.type === "running" ? "🏃‍♂️ Running workout" : "🚴‍♀️ Cycling workout"
        } `;
        this._infoWindow(localStorageInfo, this._renderMarker(item));
      });
    };

    initMap();
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    //show form
    form.classList.remove("hidden");
    distance.focus();
  }

  _hideForm() {
    //Empty input
    distance.value = duration.value = cadence.value = elevation.value = " ";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => {
      form.style.display = "grid";
    }, 1000);
  }

  _toggleElevation() {
    elevation.closest(".form__row").classList.toggle("form__row--hidden");
    cadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _renderMarker(mapMarker) {
    const clickedMarker = new google.maps.Marker({
      position: {
        lat: mapMarker.coords[0],
        lng: mapMarker.coords[1],
      },
      map: this.#map,
      title: "Selected location",
      animation: google.maps.Animation.DROP,
    });
    return clickedMarker;
  }

  _infoWindow(infoBoxContent, func) {
    // console.log(infoBoxContent, func);
    var infoWindow = new google.maps.InfoWindow({
      content: infoBoxContent,
      maxWidth: 200,
      pixelOffSet: new google.maps.Size(0, 20),
      className: "running-popup",
    });

    infoWindow.open(map, func);
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.desc}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.dur}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

    if (workout.type === "running") {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;
    }
    // console.log(workout.type);
    if (workout.type == "cycling") {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;
    }
    form.insertAdjacentHTML("afterend", html);
  }

  _newWorkout(e) {
    e.preventDefault();

    const isNumbers = (...input) =>
      input.every((inp) => Number.isFinite(inp) && inp != 0);
    const isAllPositive = (...input) => input.every((inp) => inp > 0);
    //get the input
    let type = inputType.value;
    const distances = +distance.value;
    const durations = +duration.value;
    var clickedLatLng = this.#mapEvent.latLng;
    const lat = clickedLatLng.lat();
    const coords = [clickedLatLng.lat(), clickedLatLng.lng()];
    let workout;

    //if type is running , create running object
    if (type == "running") {
      const cadences = +cadence.value;
      if (
        !isNumbers(distances, durations, cadences) ||
        isAllPositive([distances, durations, cadences])
      ) {
        alert("Please Enter positive number");
        // this.#mapEvent.latLng = " ";
        return;
      }

      workout = new Running(distances, durations, coords, cadences);
    }

    //if type is running , create cycling object
    if (type == "cycling") {
      const elevations = +elevation.value;
      if (
        !isNumbers(distances, durations, elevations) ||
        isAllPositive([distances, durations])
      ) {
        alert("Please Enter positive number");
        // this.#mapEvent.latLng = " ";
        return;
      }

      workout = new Cycling(distances, durations, coords, elevations);
    }
    //object put into array
    this.#workouts.push(workout);

    //renderworkout
    this._renderWorkout(workout);

    //clear the input field
    this._hideForm();

    // marker
    this._renderMarker(workout);

    // infoWindow
    const infoBoxContent = `${
      workout.type === "running" ? "🏃‍♂️ Running workout" : "🚴‍♀️ Cycling workout"
    } `;

    this._infoWindow(infoBoxContent, this._renderMarker(workout));

    //store into localstorage
    this._setLocalStorage();
  }

  _moveToPoint(e) {
    const workoutEl = e.target.closest(".workout");
    // console.log(workoutEl.dataset.id);

    // console.log(this.#workouts);
    // this.#workouts.find((el) => console.log(el.id));

    const moveEl = this.#workouts.find((el) => el.id == workoutEl.dataset.id);

    if (!moveEl) return;

    const workoutLatLng = new google.maps.LatLng(
      moveEl.coords[0],
      moveEl.coords[1]
    );

    this.#map.panTo(workoutLatLng);
    // this.#map.setZoom(15);
  }

  _setLocalStorage() {
    localStorage.setItem("Workout", JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    if (localStorage.getItem("Workout") !== null) {
      JSON.parse(localStorage.getItem("Workout")).forEach((item) => {
        this._renderWorkout(item);
      });
    }
  }

  reset() {
    localStorage.removeItem("Workout");
    location.reload();
  }
}

const app = new App();
