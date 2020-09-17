import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import _ from 'lodash';
import ids from './ids';

const sequentiallyFetchTaskData = async (idObjects) => {
  for (const idObject of idObjects) {
    await fetchTaskData(idObject)
  }
}

const fetchTaskData = async (idObject) => {
  try {
    const response = await axios.request({
      url: `https://www.flukebook.org/iaLogs.jsp?taskId=${idObject.taskId}`,
      method: 'get',
    });
    const responseData = _.get(response, 'data', []);
    const jobResultData = responseData.find(datum => _.get(datum, ['status', '_action']) === 'getJobResult');
    if (!jobResultData) {
      results.push({ ...idObject, success: false })
    } else {
      const cmDict = _.get(jobResultData, ['status', '_response', 'response', 'json_result', 'cm_dict']);
      try {
        const acmId = Object.keys(cmDict)[0];
        results.push({ ...idObject, success: true, acmId });
      } catch (error) {
        results.push({ ...idObject, success: false })
      }
    }
  } catch (fetchError) {
    console.error('Error');
    console.error(fetchError);
  }
}

let results = [];
sequentiallyFetchTaskData(ids).then(() => {
  fs.writeFileSync('acmIds.json', JSON.stringify(results, null, 4));
  console.log('Success')
});


