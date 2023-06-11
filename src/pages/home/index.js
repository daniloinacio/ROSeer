import Simulator from '../../components/simulator';
import { useEffect, useState } from 'react';
import './index.css';
import { Ros, Topic } from 'roslib/src/core';

function Home() {
  const [details, setDetails] = useState();
  const [steps, setSteps] = useState([]);
  const [simulationId, setSimulationId] = useState(undefined);

  useEffect(() => {
    var ros = new Ros();

    // If there is an error on the backend, an 'error' emit will be emitted.
    ros.on('error', (error) => {
      console.log(error)
    });

    // Find out exactly when we made a connection.
    ros.on('connection', () => {
      console.log('ROS connection established!')
    });

    ros.on('close', () => {
      console.log('ROS connection closed!')
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

        if (msg.simulation_id !== undefined) {
          setDetails(undefined)
          setSteps([])
          setSimulationId(msg.simulation_id)
        } else if (msg.scenario !== undefined) {
          setSteps(steps => [...steps, msg.scenario])
        } else if (msg.details !== undefined) {
          setDetails(msg.details)
        }
         else {
          setSteps(steps => [...steps, msg.snapshot])
        }
      }
    });

  }, []);

  return (
    <div className="home">
        <Simulator simulationId={simulationId} details={details} steps={steps}/>
    </div>
  );
}

export default Home;
