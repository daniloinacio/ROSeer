import { FormControl, Tabs, Tab, InputLabel, MenuItem, Select } from '@material-ui/core';
import { FaRegWindowMaximize } from 'react-icons/fa'
import Simulator from '../../components/simulator';
import TabPanel from '../../components/TabPanel';
import { useEffect, useState } from 'react';
import './index.css';
import LogsTab from '../../components/logsTab';
import { Ros, Topic } from 'roslib/src/core';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

function Home() {
  const [details, setDetails] = useState();
  const [steps, setSteps] = useState([]);

  const [tab, setTab] = useState(0);
  // const [logs, setLogs] = useState([]);
  // const [data, setData] = useState([]);

  const handle = useFullScreenHandle();

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

    var live_report = new Topic({
      ros : ros,
      name : '/live_report',
      messageType : 'std_msgs/String'
    });
    

    live_report.subscribe((message) => {
      var msg = JSON.parse(message.data)
      if(msg.scenario !== undefined){
        setSteps(steps => [...steps, msg.scenario]);
      }
      else if (msg.timestamp === -1){
        setDetails(msg);
      }
      else{
        setSteps(steps => [...steps, msg]);
      }
    });

  }, []);

  return (
    <div className="Home">
      <header className="Home-header">
        <h1>{"Simulador"}</h1>
          <>
            <div className="tabs">
              <Tabs value={tab} onChange={(e, n) => setTab(n)}>
                <Tab label="Simulação" value={0} />
                {/* {logs.length !== 0 && (
                  <Tab label="Logs" value={1} />
                )} */}
              </Tabs>
              <TabPanel value={tab} index={0}>
                <button
                  onClick={handle.enter}
                >
                  <FaRegWindowMaximize/>
                </button>
                <FullScreen className="simulator-container" handle={handle}>
                  <Simulator details={details} steps={steps}/>
                </FullScreen>
              </TabPanel>
              {/* <TabPanel value={tab} index={1}>
                <LogsTab logs={logs} />
              </TabPanel> */}
            </div>
          {/* )} */}
          </>
        {/* )} */}
      </header>
    </div>
  );
}

export default Home;
