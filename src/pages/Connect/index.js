import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from '../../context/useAuth';
import { makeStyles } from '@material-ui/core/styles';
import LockOpenIcon from '@material-ui/icons/LockOpen'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useState } from "react";
import './index.css'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '500px;',
            fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;"
        },
    },
    button: {
        margin: theme.spacing(1),
    }
}));

function Connect() {
    const classes = useStyles();
    let history = useHistory();
    let location = useLocation();
    let auth = useAuth();

    const [value, setValue] = useState(`
    {
        "apiKey": "value",
        "authDomain": "value",
        "databaseURL": "value",
        "projectId": "value",
        "storageBucket": "value",
        "messagingSenderId": "value",
        "appId": "value",
        "measurementId": "value"
    }`)
    let { from } = location.state || { from: { pathname: "/" } };
    let login = (configToUse) => {
        auth.signin(configToUse);
        history.replace(from);
    };

    function handleSubmit(event) {
        event.preventDefault()
        try {
            const obj = JSON.parse(value)
            if (obj && typeof obj === "object") {
                login(obj)
            }
        } catch(e) {

        }
        
    }

    return (
    <div className="Connect">
        <h2>Coloque suas credenciais do Firebase ou use o demo.</h2>
        <form className={classes.root} autoComplete="off" onSubmit={handleSubmit}>
        <TextField
            id="outlined-multiline-static"
            label="Firebase config"
            multiline
            rows={12}
            defaultValue={value}
            variant="outlined"
            color="primary"
            onChange={event => setValue(event.target.value)}
        />
        <div className="button-row">
            <Button 
                variant="contained"
                color="primary"
                className={classes.button}
                endIcon={<LockOpenIcon />}
                type="submit">
                    Submit
            </Button>
            <Button 
                variant="outlined"
                color="primary"
                onClick={() => login()}
            >
                Usar Demo
            </Button>
        </div>
        </form>
    </div>
    );
}

export default Connect;
