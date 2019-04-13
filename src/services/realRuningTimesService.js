
class realRuningTimesService{
    constructor(context) {
        const {mongoose, expectedTimesService} = context;
        this.tripsData = mongoose.Schema({
            tripStart: Date,
            tripId: String,
            tripTimeInSec: Number
        });
        this.realRuningTimesSchema = mongoose.Schema({
            lineId: String,
            stopId: String,
            long: String,
            lat: String,
            stopName: String,
            trips: [this.tripsData]
        });
        this.realRuningTimes = mongoose.model('realRuningTimes', this.realRuningTimesSchema);
        this.expectedTimesService = expectedTimesService;
    }

    async saveRealRunningTimes(rawData, lineId) {

        if (!rawData ||!lineId || typeof rawData !== "object") {
            return Promise.reject("Data not valid");
        }

        let expectedData;
        try {
            expectedData = await this.expectedTimesService.getExpectedRunningTimes(lineId); 
        }
        catch(err) {
            return Promise.reject(err);
        }

        const stops = expectedData[0].stops;

        const stopsMap = this._getStopsMap(rawData, stops);
        
        const savePromises = Array.from(stopsMap.entries()).map(([stopId, stopData]) => {
            const {long, lat, stop_name, trips} = stopData;

            let document = new this.realRuningTimes({lineId, stopId, long, lat, stopName: stop_name, trips});
            return document.save();
        });
        try {
            await Promise.all(savePromises);
        } catch (err) {
            return Promise.reject(err);
        }
        return true;
    }

    async getRealRunningTimes(lineId, stopId) {
        try {
            return await this.realRuningTimes.find({lineId, stopId});
        } catch (err) {
            return Promise.reject(err);
        }
    }

    _getStopsMap(rawData, stops) {
        
        const stopsMap = rawData.reduce((stopsMap, item)=>{
            if (!stopsMap.has(item.stop_id)){
                const {lat, long, stop_name} = item;
                stopsMap.set(item.stop_id, {lat, long, stop_name, trips: [], segmentTimes: {}});
            }
            const segmentTimes = stopsMap.get(item.stop_id).segmentTimes;
            segmentTimes[item.trip_id] = new Date(item.time);
            return stopsMap;
        }, new Map());

        let tripsStartObj = {};        
        for (let index = 0; index < stops.length - 1; index++) {            
            const currentStopData = stopsMap.get(stops[index]);
            const nextStopData = stopsMap.get(stops[index + 1]);
            if (index === 0) {
                tripsStartObj = currentStopData.segmentTimes;
            }

            Object.entries(currentStopData.segmentTimes).forEach(([tripId, visitTimeForStop]) => {
                const arivingNextStopTime = nextStopData.segmentTimes[tripId];
                if (arivingNextStopTime) {
                    const tripData = {
                        tripStart: tripsStartObj[tripId],
                        tripId: tripId,
                        tripTimeInSec: (arivingNextStopTime - visitTimeForStop) / 1000};
                    currentStopData.trips.push(tripData);
                }
            });
        }

        return stopsMap;
    }

}

module.exports = realRuningTimesService;