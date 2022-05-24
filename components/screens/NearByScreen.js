import React, { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  Image,
  View,
  Linking,
  FlatList,
} from "react-native";
import * as Permissions from "expo-permissions";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";
import {
  Container,
  Text,
  Content,
  Icon,
  Badge,
  Button,
  Card,
  CardItem,
} from "native-base";
import Carousel from "react-native-snap-carousel";
import { getDistance } from "geolib";
import { SafeAreaProvider } from "react-native-safe-area-view";

const locations = require("../../assets/location.json");

const { width, height } = Dimensions.get("screen");

class NearByScreen extends Component {
  state = {
    latitude: null,
    longitude: null,
    locations: locations,
    markers: [],
  };

  async componentDidMount() {
    const { status } = await Permissions.getAsync(Permissions.LOCATION);

    if (status !== "granted") {
      const response = await Permissions.askAsync(Permissions.LOCATION);
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) =>
        this.setState({ latitude, longitude }, this.mergeCoords),
      (error) => console.log("Error:", error)
    );

    const {
      locations: [sampleLocation],
    } = this.state;

    this.setState(
      {
        desLatitude: sampleLocation.coords.latitude,
        desLongitude: sampleLocation.coords.longitude,
      }
      // this.mergeCoords
    );
  }

  // mergeCoords = () => {
  //   const { latitude, longitude, desLatitude, desLongitude } = this.state;

  //   const hasStartAndEnd = latitude !== null && desLatitude !== null;

  //   if (hasStartAndEnd) {
  //     const concatStart = `${latitude},${longitude}`;
  //     const concatEnd = `${desLatitude},${desLongitude}`;
  //     this.getDirections(concatStart, concatEnd);
  //   }
  // };

  // async getDirections(startLoc, desLoc) {
  //   try {
  //     const resp = await fetch(
  //       `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=AIzaSyAHgpbKmG3IhW-jrAytQ9RAUsyiFiLmN1c`
  //     );
  //     const respJson = await resp.json();
  //     const response = respJson.routes[0];
  //     const distanceTime = response.legs[0];
  //     const distance = distanceTime.distance.text;
  //     const time = distanceTime.duration.text;
  //     const points = Polyline.decode(
  //       respJson.routes[0].overview_polyline.points
  //     );
  //     const coords = points.map((point) => {
  //       return {
  //         latitude: point[0],
  //         longitude: point[1],
  //       };
  //     });
  //     this.setState({ coords, distance, time });
  //   } catch (error) {
  //     console.log("Error: ", error);
  //   }
  // }

  onMarkerPress = (location, idx) => () => {
    const {
      coords: { latitude, longitude },
    } = location;
    this.setState(
      {
        destination: location,
        desLatitude: latitude,
        desLongitude: longitude,
      }
      // this.mergeCoords
    );
  };

  renderMarkers = () => {
    const { locations } = this.state;
    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;
          return (
            <Marker
              key={location.name}
              ref={(ref) => (this.state.markers[idx] = ref)}
              onPress={() => {
                this.onMarkerPress(location, idx);
              }}
              coordinate={{ latitude, longitude }}
            >
              <Callout>
                <Text>{location.name}</Text>
              </Callout>
            </Marker>
          );
        })}
      </View>
    );
  };

  // onCarouselItemChange = (index) => {
  //   const {
  //     coords: { latitude, longitude },
  //   } = this.state.locations[index];

  //   this._map.animateToRegion({
  //     latitude: latitude,
  //     longitude: longitude,
  //     latitudeDelta: 0.0922,
  //     longitudeDelta: 0.0421,
  //   });

  //   this.state.markers[index].showCallout();
  // };

  renderItem = ({ item }) => {
    const location = item.coords;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignContent: "center",
          width: width,
        }}
      >
        <Card>
          <CardItem onPress={(index) => this.onMarkerPress(location, index)}>
            <Text style={{ flex: 1, justifyContent: "center", fontSize: 26 }}>
              {item.name}
            </Text>
          </CardItem>
        </Card>
      </View>
    );
  };

  render() {
    const { time, coords, distance, latitude, longitude, destination } =
      this.state;

    if (latitude) {
      return (
        <SafeAreaProvider style={styles.safeContainer}>
          <Container style={styles.mapContainer}>
            <MapView
              showsUserLocation
              ref={(map) => (this._map = map)}
              style={{ ...StyleSheet.absoluteFillObject }}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {this.renderMarkers()}
            </MapView>
          </Container>
          <Container style={styles.listContainer}>
            <FlatList
              data={this.state.locations}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => `list-item-${index}`}
            />
          </Container>
        </SafeAreaProvider>
      );
    }
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>We need your permission!</Text>
      </View>
    );
  }
}

NearByScreen.navigationOptions = {
  header: null,
};

export default NearByScreen;

const styles = StyleSheet.create({
  safeContainer: {},
  mapContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  maps: {
    height: "100%",
    width: "100%",
  },
  carousel: {
    position: "absolute",
    bottom: 0,
    marginBottom: 65,
    alignContent: "center",
  },
  cardContainer: {
    position: "absolute",
    left: 95,
    // backgroundColor: "white",
    height: 220,
    width: 200,
    justifyContent: "center",
  },
  cardHeaderContainer: {
    position: "absolute",
    top: 0,
    backgroundColor: "white",
    height: 65,
    width: 190,
    justifyContent: "center",
  },
  cardBodyContainer: {
    position: "absolute",
    backgroundColor: "white",
    height: 90,
    width: 190,
    justifyContent: "center",
  },
  cardFooterContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    height: 65,
    width: 190,
    justifyContent: "center",
  },
  carouselContainer: {
    height: 250,
    width: 300,
    justifyContent: "center",
  },

  cardImage: {
    height: 320,
    zIndex: 1,
    width: 100,
  },
  cardPhone: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 0,
    alignContent: "center",
    justifyContent: "center",
  },
  cardDistance: {
    color: "#dec193",
    textAlign: "center",
  },
  cardTitle: {
    padding: 10,
    color: "black",
    fontSize: 20,
    textAlign: "center",
  },
});
