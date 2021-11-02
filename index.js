import { fetchData as fetchDataBath } from './bath.js';
import { fetchData as fetchDataStudy } from './study.js';
import { fetchData as fetchDataCainiao } from './cainiao.js';

fetchDataBath().then()
fetchDataStudy().then()
fetchDataCainiao().then()

setInterval(fetchDataBath, 15000);
setInterval(fetchDataStudy, 15000);
setInterval(fetchDataCainiao, 15000);
