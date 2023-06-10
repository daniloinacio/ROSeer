import { 
  FaFastForward, FaFastBackward, 
  FaStepForward, FaStepBackward, 
  FaPlayCircle, FaStopCircle, FaRedoAlt
  
} from 'react-icons/fa'
import {
  FiToggleLeft, FiToggleRight,
  FiFastForward, FiRewind, FiMaximize
} from 'react-icons/fi'

import { TextField, InputAdornment } from '@material-ui/core';

import { FullScreen, useFullScreenHandle } from "react-full-screen";

import factory from 'mxgraph'
import { useEffect, useState } from 'react'

import './index.css';
import { abs, max } from 'mathjs';

// Extra shapes
import { registerFloorplanWallU } from './models/wallU'
import { registerFloorplanWall } from './models/wall'
import { registerFloorplanRoom } from './models/room'

const mx = factory();

let graph;

// Register extra floorplan shapes
registerFloorplanWallU(mx.mxUtils, mx.mxCellRenderer, mx.mxShape);
registerFloorplanWall(mx.mxUtils, mx.mxCellRenderer, mx.mxShape);
registerFloorplanRoom(mx.mxUtils, mx.mxCellRenderer, mx.mxShape);

function Simulator( { details, steps } ) {
  const [step, updateStep] = useState(-1)
  const [timestamp, updateTimestamp] = useState()
  const [title, updateTitle] = useState("Waiting for simulation snapshots...")
  const [maxStep, updateMaxStep] = useState(0)
  const [running, updateRunning] = useState(false)
  const [playInterval, updatePlayInterval] = useState(undefined)
  const [speedMultiplicator, setSpeedMultiplicator] = useState(1);
  const [live, updateLive] = useState(false)
  const [rewind, updateRewind] = useState(false)
  const [speed, setSpeed] = useState(200)

  const handle = useFullScreenHandle();

  useEffect(() => {
    updateStep(-1);
    document.getElementById('mxContainer').textContent = '';
    graph = undefined;
  }, [])


  const updateCell = (cell, x, y, width, height, value, cleanValue, style) => {
    cell.geometry.x = x
    cell.geometry.y = y
    cell.geometry.width = width
    cell.geometry.height = height
    cell.value = cleanValue ? cleanValue[1] : value
    style?.startsWith('ellipse') ? cell.style = "shape=" + style : cell.style = style
  }


  useEffect( () => {

    function processStep(currStep){
      if (graph !== undefined && currStep !== undefined){
        const model = graph?.getModel()
        const parent = graph?.getDefaultParent();
        updateTimestamp(currStep?.timestamp)
        model.beginUpdate()
    
        for (const ent in currStep) {
          if(step === 0){
            const objeto = Object.entries(currStep[ent]);
            const aux = objeto[0];
            const cell = model.getCell(aux[0])

            if(aux[0] === 'timestamp') continue

            const {x, y, width, height, value, style} = aux[1];
            const cleanValue = value ? value.match(/>(.*)</) : ''

            if(cell) updateCell(cell, x, y, width, height, value, cleanValue, style);
            else graph.insertVertex(
              parent, aux[0], cleanValue ? cleanValue[1] : value, x, y, width, height, 
              style?.startsWith('ellipse') ? "shape=" + style   : style
            )
          
          } else {

            if(!currStep.hasOwnProperty(ent) || ent === 'timestamp') continue
            const cell = model.getCell(ent)
            const {x, y, width, height, value, style} = currStep[ent]
            const cleanValue = value ? value.match(/>(.*)</) : ''
            
            if(ent === 'deleted') {
              const remove = model.getCell(currStep[ent][0]);
              remove.style = "display:none;"
            }
            
            if (cell) updateCell(cell, x, y, width, height, value, cleanValue, style);
            else graph.insertVertex(parent, ent, cleanValue ? cleanValue[1] : value, x, y, width, height, style?.startsWith('ellipse') ? "shape=" + style   : style)
            
          }
        }
        model.endUpdate()
        graph.refresh()
      }
    }

    if (step >= 0 && step <= maxStep){

      if ((step === maxStep && live === false) || (step === 0 && rewind === true)) updateRunning(false);
      else{
        processStep(steps[step]);
      }
    } 

  }, [step, maxStep, steps, live, rewind])

  useEffect(() => {

    function updateMxContainerSize(mxContainer, mapHeight, mapWidth, maxSimulationHeight, maxSimulationWidth) {

        const heightDiff = abs(maxSimulationHeight - mapHeight)
        const widthDiff = abs(maxSimulationWidth - mapWidth)
        let scale = 1;

        if (mapWidth > maxSimulationWidth) {
          if (mapHeight > maxSimulationHeight && heightDiff > widthDiff) {
            scale = maxSimulationHeight / mapHeight;
          } else {
            scale = maxSimulationWidth / mapWidth;
          }
        } else {
          if (mapHeight > maxSimulationHeight) {
            scale = maxSimulationHeight / mapHeight;
          } else if (mapHeight < maxSimulationHeight && heightDiff < widthDiff) {
            scale = maxSimulationHeight / mapHeight;
          } else {
            scale = maxSimulationWidth / mapWidth;
          } 
        }

        mxContainer.setAttribute('style',
        `width:${details?.dimensions.width}px;height:${details?.dimensions.height}px;transform: scale(${scale})`)
    }

    if(details === undefined) {
      updateStep(-1);
      document.getElementById('mxContainer').textContent = '';
      graph = undefined;
    }
    if(details !== undefined) {

      const container = document.getElementById('mxContainer')
      const maxSimulationWidth = document.getElementById('simulatorScreen')?.offsetWidth * 0.95;
      const maxSimulationHeight = document.getElementById('simulatorScreen')?.offsetHeight * 0.95;
      const mapWidth = details?.dimensions.width;
      const mapHeight = details?.dimensions.height;
      
      mx.mxEvent.disableContextMenu(container);
      updateMaxStep(steps.length - 1)

      if (live === true) {
        updateStep(steps.length - 1)
      }

      updateTitle(details?.window_name)
      
      if(graph === undefined) {
        graph = new mx.mxGraph(container)
        graph.setEnabled(false);
        graph.setTooltips(true);
        new mx.mxCellTracker(graph, '#00FF00');
        // Custom tooltip for cells
        graph.getTooltipForCell = function(cell) {
          return `Position: (${cell.geometry.x}, ${cell.geometry.y})`
        }
      }

      updateMxContainerSize(container, mapHeight, mapWidth, maxSimulationHeight, maxSimulationWidth)

    }
  }, [details, steps, live])
  
  useEffect(() => {
      if (!running || live) {
        clearInterval(playInterval);
        updatePlayInterval(undefined);
      } else if(playInterval === undefined) {
        updatePlayInterval(setInterval(() => {
          rewind ? updateStep(step => max(step - 1, 0)) : updateStep(step => step + 1)
        }, speed / speedMultiplicator))
      }
      console.log('Speed: ', speed)
      console.log('Speed / Mult', speed / speedMultiplicator)

      return () => clearInterval(playInterval)
  }, [running, playInterval, speed, speedMultiplicator, live, rewind])

  useEffect(() => {
    if(!running) {
      setSpeedMultiplicator(1)
      updateRewind(false)
    }
  }, [running])

  return (
  <div id="simulator">
    <h2 id="simulationName">
      {title}
    </h2>
    <div id="controlMenu">
      <div id="Buttons">
        <button 
          className="controlButton"
          disabled={step-10 < 0}
          onClick={() => {
              updateStep(step => step - 10)
              updateLive(false)
            }
          }
          >
          <FaFastBackward />
        </button>
        <button 
          className="controlButton"
          disabled={step === 0 || step === -1}
          onClick={() => {
              updateStep(step => step -1)
              updateLive(false)
            }
          }
          >
          < FaStepBackward />
        </button>
        <button
          className='controlButton' 
          disabled={step <= 0 || live || !running}
          onClick={() => {
              if (!rewind) {
                setSpeedMultiplicator(2)
                updateRewind(true)
              } else {
                setSpeedMultiplicator(speedMultiplicator => speedMultiplicator * 2)
              }
              clearInterval(playInterval);
              updatePlayInterval(undefined);
              updateRunning(true)
            }
          }
        >
            <FiRewind/>
        </button>
        <button 
          className="controlButton"
          disabled={live === true || maxStep === 0}
          onClick={() => updateRunning(running => !running)}
          >
            {
              running ? <FaStopCircle /> : < FaPlayCircle />
            }
        </button>

        <button
          className='controlButton'
          disabled={!running || live}
          onClick={() => {
              if (rewind) {
                setSpeedMultiplicator(2)
                updateRewind(false)
              } else {
                setSpeedMultiplicator(speedMultiplicator => speedMultiplicator * 2)
              }
              clearInterval(playInterval);
              updatePlayInterval(undefined);
              updateRunning(true)
            }
          }
        >
            <FiFastForward/>
        </button>

        <button 
          className="controlButton"
          disabled={step === maxStep || maxStep === 0 || step === -1 || live === true}
          onClick={() => updateStep(step => step + 1)}
          >
          <FaStepForward />
        </button>
        <button 
          className="controlButton"
          disabled={step+10 > maxStep || maxStep === 0 || step === -1 || live === true}
          onClick={() => updateStep(step => step + 10)}
          >
          <FaFastForward />
        </button>
        <br/>
        <button 
          className="controlButton reset"
          disabled={step === 0 || step === -1}
          onClick={() => {
              updateStep(0)
              updateLive(false)
            }
          }
          >
          <FaRedoAlt />
        </button>
        <button
          className='controlButton live' 
          onClick={() => {
              updateStep(maxStep)
              updateLive(live => !live)
              updateRunning(!live)
            }
          }
        >
          {
            live ? <FiToggleLeft/> : < FiToggleRight />
          }
        </button>
        <button
          className='controlButton' 
          onClick={handle.enter}
        >
          <FiMaximize/>
        </button>
      </div>
      <div id="stepsInfo">
        <TextField className="speed" 
          label="Intervalo entre os passos"
          variant="outlined" 
          type="number"
          inputProps={{
            step: 100,
          }}
          InputProps={{
            endAdornment: <InputAdornment position="start">ms</InputAdornment>,
          }}
          value={speed} 
          onChange={e => setSpeed(e.target.value)}
        />
        <p id="simulationInfo">TimeStamp: {timestamp} • Step: {step}/{maxStep}</p>
      </div>
    </div>
    <FullScreen handle={handle} className='fullScreen'>
      <div id='simulatorScreen' >
        <div id="mxContainer" />
      </div>
    </FullScreen>

  </div>
  );
}

export default Simulator;