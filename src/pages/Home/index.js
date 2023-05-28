import { FormControl, Tabs, Tab, InputLabel, MenuItem, Select } from '@material-ui/core';
import Simulator from '../../components/simulator';
import TabPanel from '../../components/TabPanel';
import { useEffect, useState } from 'react';
import './index.css';
import LogsTab from '../../components/logsTab';
import { Ros, Topic } from 'roslib/src/core';


function Home() {
  const [details, setDetails] = useState();
  const [steps, setSteps] = useState([]);

  const [user, setUser] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState([]);
  const [data, setData] = useState([]);

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
        console.log(msg)
      }
    });

  }, []);

  return (
    <div className="Home">
      <header className="Home-header">
        <h1>{"Simulador"}</h1>
        {/* {usersList.length > 0 && ( */}
          <>
          {/* <FormControl>
            <InputLabel>Selecione um usuário...</InputLabel>
            <Select
              className="select-field"
              value={user}
              onChange={event => setUser(event.target.value)}
            >
              {usersList.map(item => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {item}
                  </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          {/* {user && ( */}
            <div className="tabs">
              <Tabs value={tab} onChange={(e, n) => setTab(n)}>
                <Tab label="Simulação" value={0} />
                {/* {logs.length !== 0 && (
                  <Tab label="Logs" value={1} />
                )} */}
              </Tabs>
              <TabPanel value={tab} index={0}>
                <Simulator details={details} steps={steps} user={user}/>
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
