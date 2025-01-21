/**
 * @typedef {Object} TapeMeasure
 * @property {Function} start - Start the measurement
 * @property {Function} stop - Stop the measurement
 * @property {Function} reset - Reset the distance
 * @property {number} distance - The distance measured
 * @property {string} error - The error message
 * @property {string} permission - The permission status
 * @property {Object} initialPosition - The initial position
 * @property {Object} position - The current position with timestamp
 * @property {Object} acceleration - The acceleration data
 * @property {Function} calculateDistance - Calculate the distance
 * @property {Function} subscribe - Subscribe to the device motion
 * @property {Function} unsubscribe - Unsubscribe from the device motion
 * 
 * The useTapeMeasure hook returns an object with the following properties and methods:
 * @returns {
* start: Function,
* stop: Function,
* reset: Function,
* calculateDistance: Function,
* distance: number,
* initialPosition: Object,
* position: Object,
* acceleration: Object,
* permission: string,
* error: string }
* 
* The useTapeMeasure hook uses the DeviceMotion API to measure the device's motion and calculate the relative position
* from the initial position using the device's accelerometer data. It provides methods to start, stop, and reset the measurement,
* as well as calculate the distance between the initial and current positions.
*/


import { useState, useEffect } from 'react';
import { DeviceMotion } from 'expo-sensors';

const useTapeMeasure = () => {
  const [initialPosition, setInitialPosition] = useState({ timestamp: 0 });
  const [position, setPosition] = useState({ time : 0.0, timestamp: 0, x: 0, y: 0, z: 0 });
  const [acceleration, setAcceleration] = useState({ timestamp: 0, x: 0, y: 0, z: 0 });
  const [permission, setPermission] = useState(null);
  const [state, setState] = useState('idle');
  const [speed, setSpeed] = useState({x:0, y:0, z:0});
  const [calAcc, setCalAcc] = useState({x:0, y:0, z:0});
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const subscribe = async () => {
      try {
        const { status } = await DeviceMotion.requestPermissionsAsync();
        setPermission(status === 'granted');

        if (status === 'granted') {
          DeviceMotion.setUpdateInterval(20); // don't go below 200ms
          DeviceMotion.addListener((data) => {
            if (data.acceleration) {
              setAcceleration(data.acceleration);
            }
          });
        } else {
          setError('Permission denied');
        }
      } catch (err) {
        setError('Error requesting permissions');
      }
    };

    subscribe();

    return () => {
      DeviceMotion.removeAllListeners();
    };
  }, []);

  // Function to start the measurement
  const start = () => {
    setInitialPosition({ timestamp: acceleration.timestamp });
    setPosition({ timestamp: acceleration.timestamp, x: 0, y: 0, z: 0 });
    setState('measuring');
  };

  // Function to stop the measurement, calculate the distance, and reset
  const stop = () => {
    calculateDistance();
    setState('stopped');
    setPosition({ timestamp: 0, x: 0, y: 0, z: 0 });
  };

  // Function to reset the distance and initial position
  const reset = () => {
    setDistance(0);
    setSpeed({x:0, y:0, z:0});
    setInitialPosition({ timestamp: 0 });
    setPosition({ timestamp: 0, x: 0, y: 0, z: 0 });
    setState('idle');
  };

  // Function to calculate the position using acceleration data
  // Formula: position = initialPosition + 0.5 * acceleration * time^2
  const calculatePosition = () => {
    if (!acceleration || typeof acceleration.x === 'undefined' || typeof acceleration.y === 'undefined' || typeof acceleration.z === 'undefined') {
      return;
    }
    //console.log('acc ' + acceleration.timestamp);
    //console.log('pos ' + position.timestamp);
    const time = (acceleration.timestamp - position.timestamp) ; // convert ms to s
    let xSpeed = speed.x + acceleration.x * time;
    let ySpeed = speed.y + acceleration.y * time;
    let zSpeed = speed.z + acceleration.z * time;

    //console.log('state' + state);
    


    const acc = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);

    
    if (acc < .02 && acc > -.02) {
      acceleration.x=0;
      acceleration.y=0;
      acceleration.z=0;
      let factor=0.5;
      xSpeed=factor*xSpeed;
      ySpeed=factor*ySpeed;
      zSpeed=factor*zSpeed;
    }

    let totSpeed = Math.sqrt(xSpeed ** 2 + ySpeed ** 2 + zSpeed ** 2);
    //    console.log('acc ' + acc);

        if (totSpeed < 0.01 && totSpeed > -0.01) {
          let factor=0;
          xSpeed=factor*xSpeed;;
          ySpeed=factor*ySpeed;
          zSpeed=factor*zSpeed;
        }
        console.log('totSpeed ' + totSpeed.toFixed(4) + '  ' + (totSpeed < 0.01 && totSpeed > -0.01));

    let x = position.x + xSpeed * time + 0.5 * acceleration.x * time ** 2;
    let y = position.y + ySpeed * time + 0.5 * acceleration.y * time ** 2;
    let z = position.z + zSpeed * time + 0.5 * acceleration.z * time ** 2;
  
    let move= Math.sqrt((position.x-x) ** 2 + (position.y-y) ** 2 + (position.z-z) ** 2);
    //console.log('move ' + move);

    if (move < 0.0001) {
      x=position.x;
      y=position.y;
      z=position.z;
      xSpeed=0;
      ySpeed=0;
      zSpeed=0;

    }
    let distanceOld= Math.sqrt((position.x) ** 2 + (position.y) ** 2 + (position.z) ** 2);
    let distanceNew= Math.sqrt((x) ** 2 + (y) ** 2 + (z) ** 2);
    //console.log('distance ' + (distanceNew-distanceOld));
    if (distanceNew - distanceOld < 0) {
      x=position.x;
      y=position.y;
      z=position.z;
      xSpeed=0;
      ySpeed=0;
      zSpeed=0;
    }


    setSpeed({x : xSpeed, y : ySpeed, z : zSpeed});
    setPosition({ time: time, timestamp: acceleration.timestamp, x, y, z });
    };

  // Function to calculate the distance from the initial position to the current position using acceleration data.
  // Formula: total distance = sqrt(x^2 + y^2 + z^2)
  const calculateDistance = () => {
    setDistance(Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2));
  };

  // Calculate the position when the acceleration changes
  useEffect(() => {
    if (state === 'measuring') {
      calculatePosition();
      calculateDistance();
    }
  }, [acceleration]);

  return { start, stop, reset, state, speed, position, calAcc, calculateDistance, distance, acceleration, 
    initialPosition, position, error, permission };
};

export default useTapeMeasure;
