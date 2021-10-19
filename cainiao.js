import { client, bucket_prefix, org } from './config.js';
import { Point } from '@influxdata/influxdb-client'
import axios from "axios";

const bucket = bucket_prefix + "cainiao";

const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({ host: 'host1' })

export async function fetchData() {
    const data = await axios.get('https://plus.sjtu.edu.cn/api/sjtu/cainiao')
        .then(function (response) {
            return response.data
        })
        .catch(err => console.error(err));


    const cainiaoPeoplePoint = new Point('cainiao_people')
        .intField('limit', data['limit'])
        .intField('current', data['current'])
    writeApi.writePoint(cainiaoPeoplePoint)

    await writeApi.flush()
}
