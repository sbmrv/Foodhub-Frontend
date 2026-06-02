import React from "react";
import "./Styles/home.css";
import Wallpaper from "./Wallpaper";
import QuickSearch from "./QuickSearch";
import axios from "axios";

const API = "http://localhost:8050";

class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      locations: [],
      mealtypes: [],
      selectedLocationId: sessionStorage.getItem("locationId") || "",
      locationModalOpen: true,
      locationLoading: false,
      detectedCity: "",
      locationError: "",
    };
  }

  componentDidMount() {
    axios({
      method: "GET",
      url: `${API}/getAllLocations`,
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        const locations = response.data.locations || [];
        this.setState({ locations }, () => {
          if (!sessionStorage.getItem("locationId")) {
            this.detectCurrentLocation(locations);
          } else {
            this.setState({ locationModalOpen: false });
          }
        });
      })
      .catch((err) => console.log(err));

    axios({
      method: "GET",
      url: `${API}/getAllMealTypes`,
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        this.setState({ mealtypes: response.data.mealtypes });
      })
      .catch((err) => console.log(err));
  }

  matchLocationFromCity = (locations, cityName) => {
    if (!cityName) return null;
    const normalized = cityName.toLowerCase().trim();
    const match = locations.find(
      (loc) =>
        loc.city?.toLowerCase().includes(normalized) ||
        normalized.includes(loc.city?.toLowerCase()) ||
        loc.name?.toLowerCase().includes(normalized)
    );
    return match || locations.find((loc) => loc.city?.toLowerCase() === "pune") || locations[0];
  };

  detectCurrentLocation = (locations) => {
    if (!navigator.geolocation) {
      this.setState({
        locationError: "Geolocation not supported. Please select location manually.",
        locationLoading: false,
      });
      return;
    }

    this.setState({ locationLoading: true, locationError: "" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        sessionStorage.setItem("userLat", latitude);
        sessionStorage.setItem("userLng", longitude);

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.state_district ||
            geoData.address?.state ||
            "";

          const matched = this.matchLocationFromCity(locations, city);
          if (matched) {
            sessionStorage.setItem("locationId", matched.location_id);
            sessionStorage.setItem("locationLabel", `${matched.name}, ${matched.city}`);
            this.setState({
              selectedLocationId: String(matched.location_id),
              detectedCity: city || matched.city,
              locationModalOpen: false,
              locationLoading: false,
            });
          } else {
            this.setState({
              detectedCity: city,
              locationError: "Could not match your city. Please select manually.",
              locationLoading: false,
            });
          }
        } catch (err) {
          this.setState({
            locationError: "Could not detect city. Please select manually.",
            locationLoading: false,
          });
        }
      },
      () => {
        this.setState({
          locationError: "Location permission denied. Please select your area manually.",
          locationLoading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  handleLocationSelect = (locationId) => {
    const loc = this.state.locations.find((l) => String(l.location_id) === String(locationId));
    sessionStorage.setItem("locationId", locationId);
    if (loc) {
      sessionStorage.setItem("locationLabel", `${loc.name}, ${loc.city}`);
    }
    this.setState({
      selectedLocationId: String(locationId),
      locationModalOpen: false,
      locationError: "",
    });
  };

  renderLocationModal() {
    const { locationModalOpen, locationLoading, locationError, detectedCity, locations, selectedLocationId } =
      this.state;

    if (!locationModalOpen) return null;

    return (
      <div className="location-modal-overlay">
        <div className="location-modal">
          <h3>Select your delivery location</h3>
          <p>We use your location to show nearby restaurants</p>

          {locationLoading && <p className="location-status">Detecting your current location...</p>}
          {detectedCity && !locationLoading && (
            <p className="location-status success">Detected near: {detectedCity}</p>
          )}
          {locationError && <p className="location-status error">{locationError}</p>}

          <button
            type="button"
            className="btn btn-danger location-detect-btn"
            onClick={() => this.detectCurrentLocation(this.state.locations)}
            disabled={locationLoading}
          >
            Use current location
          </button>

          <div className="location-divider">or choose manually</div>

          <select
            className="form-select"
            value={selectedLocationId}
            onChange={(e) => this.handleLocationSelect(e.target.value)}
          >
            <option value="">-- Select area --</option>
            {locations.map((item) => (
              <option key={item._id} value={item.location_id}>
                {item.name}, {item.city}
              </option>
            ))}
          </select>

          {selectedLocationId && (
            <button
              type="button"
              className="btn btn-success location-confirm-btn"
              onClick={() => this.setState({ locationModalOpen: false })}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { locations, mealtypes, selectedLocationId } = this.state;

    return (
      <>
        {this.renderLocationModal()}
        <Wallpaper
          locationsData={locations}
          selectedLocationId={selectedLocationId}
          onLocationSelect={this.handleLocationSelect}
        />
        <QuickSearch quickSearchData={mealtypes} />
      </>
    );
  }
}

export default Home;
