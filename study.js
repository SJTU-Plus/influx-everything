import { client, bucket_prefix, org } from './config.js';
import { Point } from '@influxdata/influxdb-client'
import axios from "axios";

const bucket = bucket_prefix + "study";

const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({ host: 'host1' })

export async function fetchData() {
    const data = await axios.post('https://map.sjtu.edu.cn/realtimePersion/zixishi', "roomCode=LGXQ", { headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
        .then(function (response) {
            return JSON.parse(response.data.data.freeClassRoomList)
        })
        .catch(err => console.error(err));
    for (const room of data) {
        const roomPoint = new Point('study_room')
            .tag("room_name", room["name"])
            .tag("building_name", room["buildName"])
            .intField("used", room["realTimeNum"])
            .intField("all", parseInt(room["kwNum"]))
        writeApi.writePoint(roomPoint)
    }
    await writeApi.flush()
}
