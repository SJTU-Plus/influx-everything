import { client, bucket_prefix, org } from './config.js';
import { Point } from '@influxdata/influxdb-client'
import axios from "axios";

const bucket = bucket_prefix + "study";

const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({ host: 'host1' })

const knownBuildIDs = [{ buildId: 564, buildingName: "东中院" }, { buildId: 128, buildingName: "中院" }]//Can be obtained from /build/findAreaBuild

export async function fetchData() {
    for (const { buildId, buildingName } of knownBuildIDs) {
        const buildings = await axios.post('https://ids.sjtu.edu.cn/build/findBuildRoomType', `buildId=${buildId}&mobileType=mobileFlag`, { headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
            .then(function (response) {
                return response.data.data.floorList
            })
            .catch(err => console.error(err));
        const timeSection = await axios.post('https://ids.sjtu.edu.cn/course/findSection', {})
            .then(function (response) {
                return response.data.data.curSection
            })
            .catch(err => console.error(err));
        for (const building of buildings) 
            for (const room of building.children)
                if (room["freeRoom"] == '1' && ((room["roomCourseList"]?.every((course) => course.startSection > timeSection || course.endSection < timeSection)) ?? true)){
                    const roomPoint = new Point('study_room')
                         .tag("room_name", room["text"])
                         .tag("building_name", buildingName)
                         .intField("used",room["actualStuNum"] ?? 0)//网站上就这么显示,不服打教务处(电话)
                         .intField("all", Number(room["zws"]))
                    writeApi.writePoint(roomPoint)
                }
        
    }
    await writeApi.flush()
}
