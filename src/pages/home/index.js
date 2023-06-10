import Simulator from '../../components/simulator';
import { useEffect, useState } from 'react';
import './index.css';
import { Ros, Topic } from 'roslib/src/core';


function Home() {
  const [details, setDetails] = useState();
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    var ros = new Ros();

    // If there is an error on the backend, an 'error' emit will be emitted.
    ros.on('error', (error) => {
      console.log(error);
    });

    // Find out exactly when we made a connection.
    ros.on('connection', () => {
      console.log('Connection made!');
    });

    ros.on('close', () => {
      console.log('Connection closed.');
    });

    ros.connect('ws://localhost:9090');

    const live_report = new Topic({
      ros : ros,
      name : '/live_report',
      messageType : 'std_msgs/String'
    });

    live_report.subscribe((message) => {
      var msg = JSON.parse(message.data)
      if (msg !== null) {
        if (msg.scenario !== undefined) {
          setSteps(steps => [...steps, msg.scenario])
        } else if (msg.details !== undefined) {
          setDetails(msg.details)
        }
         else {
          setSteps(steps => [...steps, msg])
        }
      }
    });

  }, []);

  return (
    <div className="Teste">
        <Simulator details={details} steps={steps}/>
    </div>
  );
}

export default Home;
