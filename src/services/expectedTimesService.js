
class expectedTimesService{
    constructor(mongoose) {
        this.timeData = mongoose.Schema({
            start: String,
            end: String,
            times: [Number]
        });
        this.expectedRouteSchema = mongoose.Schema({
            lineId: String,
            stops: [String],
            data: [this.timeData]
        });
        this.expectedRoute = mongoose.model('expectedRoute', this.expectedRouteSchema);
    }

    async saveExpectedRunningTimes(rawData, lineId) {
        if (!rawData || typeof rawData !== "string") {return Promise.reject("Data not valid");}

        const lines = rawData.match(/[^\r\n]+/g);
        if (!lines || !(lines.length > 2)) {return Promise.reject("Not enough data");}

        const stopsText = lines[0].split(',').slice(2);
        const stops = stopsText.map(stop => stop.split('-')[0]);
        stops.push(stopsText[stopsText.length-1].split('-')[1]);
        const data = [];
        for (let index = 1; index < lines.length; index++) {
            const currentLine = lines[index].split(',');
            data.push({start: currentLine[0], end: currentLine[1], times: currentLine.slice(2)});
        }

        let document = new this.expectedRoute({lineId, stops, data});
        try {
            await document.save();
        } catch (err) {
            return Promise.reject(err);
        }
        return true;
    }

    async getExpectedRunningTimes(lineId) {
        try {
            return await this.expectedRoute.find({lineId});
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

module.exports = expectedTimesService;