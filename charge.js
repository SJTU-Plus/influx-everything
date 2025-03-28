import { client, bucket_prefix, org } from './config.js';
import { Point } from '@influxdata/influxdb-client'
import axios from "axios";

import { processOrder } from "./charge-helper.js"

const bucket = bucket_prefix + "charge";

const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({ host: 'host1' })

export async function fetchData() {

    const getListOrder = `{"ordertype":"getlist","origin":"cloud"}`;
    const url = 'http://kld.sjtu.edu.cn/campuslifedispatch/WebService.asmx/ChargeService';

    const devices = (await processOrder(getListOrder, url)).data.result1;
    for (const device of devices) {
	if(Number(device["chargingnums"])+Number(device["freenums"])+Number(device["errnums"])===0) continue;
        const getSubListOrder = `{"ordertype":"getsublist","origin":"cloud","rid":"${device.rid}"}`;
        (await processOrder(getSubListOrder, url)).data.result1.forEach(port => {
            let point = new Point('mobile_charge')
                .tag("device_name", device["rname"])
                .tag("device_port", port["rcname"].split("-")[1].slice(0, -1))
                .tag("port_id", port["rcname"])
                .booleanField('free', port["rcnote"] === "空闲")
                .booleanField('error', port["rcnote"] === "故障")
            writeApi.writePoint(point)
        });
        let devicePoint = new Point('mobile_charge')
            .tag("device_name", device["rname"])
            .intField("all", Number(device["chargingnums"])+Number(device["freenums"])+Number(device["errnums"]))
            .intField("idle", Number(device["freenums"]))
            .intField("damage", Number(device["errnums"]));
        writeApi.writePoint(devicePoint)
    }
    await writeApi.flush()
}
