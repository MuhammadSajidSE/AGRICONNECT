function convertJsonStructure(jsonData) {
    if (Array.isArray(jsonData) && jsonData.length > 0 && Array.isArray(jsonData[0])) {
      return jsonData;
    } else {
      return jsonData.map(item => {
        return [item.CROPID, item.NAME, item.CATEGORY, item.PRICE, item.QUANTITY, item.SELLER_EMAIL];
      });
    }
  }

  function convertToQuerycategory(jsonData) {
    if (Array.isArray(jsonData) && Array.isArray(jsonData[0])) {
      return jsonData;
    }
    const result = jsonData.map(item => {
      return [
        item.CROPID,
        item.NAME,
        item.CATEGORY,
        item.QUANTITY,
        item.PRICE,
        item.SELLER_NAME,
        item.SELLER_EMAIL
      ];
    });
    return result;
  }
  function ensureArrayFormat(result) {
    const metaData = result.metaData;
    const rows = result.rows;
    if (rows.length > 0 && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
      const convertedRows = rows.map(row => {
        return metaData.map(meta => row[meta.name]);
      });
      return {
        metaData: metaData,
        rows: convertedRows
      };
    }
    return result;
  }

  const convertOrReturnJson = (json) => {
    const isAlreadyConverted = json.every(item => typeof item === 'object' && 'email' in item && 'name' in item);
    
    if (isAlreadyConverted) {
      return json;
    } else {
      const convertedJson = json.map(item => {
        return {
          email: item[0],
          name: item[1]
        };
      });
      return convertedJson;
    }
  }
  function transformData(data, key) {
    if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length > 0) {
      if (data[0][0] === null) {
        return [[0]];
      }
      return data;
    }
    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty(key)) {
      return data.map(item => [item[key] === null ? 0 : item[key]]);
    }
    return data;
  }
  module.exports = { convertJsonStructure,convertToQuerycategory,ensureArrayFormat,convertOrReturnJson,transformData };