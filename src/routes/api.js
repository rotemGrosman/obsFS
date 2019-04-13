const express = require("express");
const fs = require('fs');
const path = require('path');

module.exports = (context) => {
    const {expectedTimesService, realRuningTimesService} = context;
    const router = express.Router();

    router.post("/expected/:lineId", async (req, res, next) => {
        expectedTimesService.saveExpectedRunningTimes(req.body, req.params.lineId).then(()=> {
            res.sendStatus(201);
        }).catch( err=> {
            console.log(err);
            res.sendStatus(400);
        })
    });
    router.get("/expected/:lineId", async (req, res, next) => {
        expectedTimesService.getExpectedRunningTimes(req.params.lineId).then((result)=> {
            res.send(result[0]);
        }).catch( err=> {
            console.log(err);
            res.sendStatus(400);
        })
    });

    router.post("/real/:lineId", async (req, res, next) => {
        realRuningTimesService.saveRealRunningTimes(req.body, req.params.lineId).then(()=> {
            res.sendStatus(201);
        }).catch( err=> {
            console.log(err);
            res.sendStatus(400);
        })
    });
    router.get("/real/:lineId/:stopId", async (req, res, next) => {
        realRuningTimesService.getRealRunningTimes(req.params.lineId, req.params.stopId).then((result)=> {
            res.send(result[0]);
        }).catch( err=> {
            console.log(err);
            res.sendStatus(400);
        })
    });

    //TEMP FUNCTION, should be form on FrontEnd with upload files
    router.post("/readData/:lineId", (req, res, next) => {
        let expected = path.join(__dirname, '../../data/expected_running_times.csv'); 
        let drivers = path.join(__dirname, '../../data/drivers_data.json');

        fs.readFile(expected, {encoding: 'utf-8'}, async (err,data) => {
            await expectedTimesService.saveExpectedRunningTimes(data, req.params.lineId);
            fs.readFile(drivers, {encoding: 'utf-8'}, async (err,data) => {
                try{
                    await realRuningTimesService.saveRealRunningTimes(JSON.parse(data), req.params.lineId);
                    res.sendStatus(201);
                } catch(err){
                    console.log(err);
                    res.sendStatus(400);
                }
            });    
        });    
    });
    

    return router;
};
