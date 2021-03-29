import { client, bucket_prefix, org } from './config.js';
import { Point } from '@influxdata/influxdb-client'
import axios from "axios";

const bucket = bucket_prefix + "bath";

const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({ host: 'host1' })

export async function fetchData() {
    const data = await axios.get('http://wap.xt.beescrm.com/activity/WaterControl/getGroupInfo/version/1')
        .then(function (response) {
            return response.data.data
        })
        .catch(err => console.error(err));

    for (const dormitory of data) {
        const bathPeoplePoint = new Point('bath_people')
            .tag("dormitory_name", dormitory["Name"])
            .intField('free', dormitory["status_count"]["free"])
            .intField('used', dormitory["status_count"]["used"])
            .intField('error', dormitory["status_count"]["error"])
        writeApi.writePoint(bathPeoplePoint)
    }
    await writeApi.flush()
}
