import { fetchData as fetchDataBath } from './bath.js';
import { fetchData as fetchDataStudy } from './study.js';

fetchDataBath().then()
fetchDataStudy().then()

setInterval(fetchDataBath, 15000);
setInterval(fetchDataStudy, 15000);
