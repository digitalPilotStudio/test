// Auteur : KB
// Date : Mercredi 14 Février
// Ecran pour créer une promenade
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from "expo-linear-gradient"; 
import { useDispatch, useSelector } from 'react-redux';
import { addWalk, removeWalk, importWalks, addItinerary } from '../reducers/walk';
import { infoUser } from '../reducers/user';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

//feuille de style global
const globalCSS = require("../styles/global.js");

export default function PromenadeScreen() {
  const dispatch = useDispatch();
  const walk = useSelector((state) => state.walk.value);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("");
  const [rythme, setRythme] = useState("");
  const [distance, setDistance] = useState();
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState();
  const [itinerary, setItinerary] = useState([]);
  const [tempCoordinates, setTempCoordinates] = useState([]);

  // State variables for walkEvent inputs
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCity, setEventCity] = useState();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        Location.watchPositionAsync({ distanceInterval: 10 },
          (location) => {
            setCurrentPosition(location.coords);
          });
      }
    })();

    console.log("currentPosition:", currentPosition);
  /*   fetch(`${BACKEND_ADDRESS}/places/${user.nickname}`)
      .then((response) => response.json())
      .then((data) => {
        data.result && dispatch(importPlaces(data.places));
      }); */
  }, []);

  const handleCreateWalk = (e) => {
    let coord = e.nativeEvent.coordinate;
    console.log("coord", coord)
    setItinerary([...itinerary, {lat: coord.latitude , lon: coord.longitude }]);
  };

  const handleNewWalk= () => {
    // Send new walk to backend to register it in database
    fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/walks/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name, 
        environment: environment, 
        rythme: rythme,
        distance: distance,
        description: description,
        token: "0dff_dNSfK6RLg-HmaDWWQxoOj1NoYZD",
        duration : duration,
        dateCreated: new Date,
        dateModified: null,
        itinerary: itinerary,
        eventName: eventName,
        eventDate: eventDate,
        eventTime: eventTime,
        eventCity: eventCity,
      }),
    }).then((response) => response.json())
      .then((data) => {
        // Dispatch in Redux store if the new place have been registered in database
        if (data.result) {
          dispatch(addWalk({
            name: name, 
            environment: environment, 
            rythme: rythme,
            distance: distance,
            description: description,
            duration : duration,
          }))
          dispatch(addItinerary(itinerary));

          console.log("reducer walk:", walk.walks)
          console.log("itinerary:", itinerary)
          console.log("reducer walk/itineraries:", walk.itineraries)
          setName('');
          setEnvironment('');
          setRythme('');
          setDistance();
          setDescription('');
          setDuration();
          setItinerary([]);
          setEventName('');
          setEventDate('');
          setEventTime('');
          setEventCity('');
        }
      });
  };

  const markers = itinerary.map((data, i) => {
    return <Marker key={i} coordinate={{ latitude: data.lat, longitude: data.lon }} />;
  });

  return (
    <LinearGradient
      colors={["#F2B872", "#FFFFFF"]}
      style={globalCSS.backgrdContainer}
    >
      <Text>Welcome to caniconnect PromenadeScreen !</Text>
     
      <View style={styles.formContent}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={() => handleCreateWalk()} style={globalCSS.button} activeOpacity={0.8}>
              <Text style={globalCSS.textButton}>Créer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSearchWalk()} style={globalCSS.button} activeOpacity={0.8}>
            <Text style={globalCSS.textButton}>Chercher</Text>
          </TouchableOpacity>
        </View>     
      </View>
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2B872',
      alignItems: 'center',
      justifyContent: 'center',
    },
    map: {
      width: '100%',
      height: '30%',
    },
    formContent: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    input: {
      width: "40%",
      marginTop: 25,
      borderBottomColor: "#f2B872",
      borderBottomWidth: 1,
      fontSize: 18,
    },
    walkInputs: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    envRythme: {
      flexDirection: 'row',
      justifyContent: "space-between",
      alignItems: "center",
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: "space-around",
      alignItems: "center",
    },
    walkEventInputs: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateTime: {
      flexDirection: 'row',
      justifyContent: "center",
      alignItems: "center",
    },
  });
  