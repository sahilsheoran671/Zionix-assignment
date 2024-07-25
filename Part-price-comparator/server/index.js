const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const API_KEYS = {
  mouser: '82675baf-9a58-4d5a-af3f-e3bbcf486560',
  element14: 'wb9wt295qf3g6m842896hh2u',
  rutronik: 'cc6qyfg2yfis'
};

const convertCurrency = (price, currency) => {
  if (currency === 'USD') return price * 84;
  if (currency === 'EUR') return price * 90;
  return price;
};

const getMouserData = async (partNumber, volume) => {
  try {
    const response = await axios.post(`https://api.mouser.com/api/v1/search/partnumber?apiKey=${API_KEYS.mouser}`, {
      SearchByPartRequest: {
        mouserPartNumber: partNumber,
        partSearchOptions: "string"
      }
    });
    const parts = response.data.SearchResults.Parts;
    if (parts && parts.length > 0) {
      const part = parts[0];
      const priceBreak = part.PriceBreaks && part.PriceBreaks.length > 0 ? part.PriceBreaks[0].Price : null;
      return {
        manufacturerPartNumber: part.ManufacturerPartNumber,
        manufacturer: part.Manufacturer,
        dataProvider: 'Mouser',
        unitPrice: priceBreak ? convertCurrency(priceBreak, 'USD') : null
      };
    }
  } catch (error) {
    console.error('Error fetching data from Mouser:', error);
    return null;
  }
};

const getElement14Data = async (partNumber, volume) => {
  try {
    const response = await axios.get(`http://api.element14.com/catalog/products`, {
      params: {
        'term': `manuPartNum:${partNumber}`,
        'storeInfo.id': 'in.element14.com',
        'resultsSettings.offset': 0,
        'resultsSettings.numberOfResults': 1,
        'resultsSettings.refinements.filters': 'inStock',
        'resultsSettings.responseGroup': 'medium',
        'callInfo.omitXmlSchema': false,
        'callInfo.callback': '',
        'callInfo.responseDataFormat': 'json',
        'callinfo.apiKey': API_KEYS.element14
      }
    });
    const products = response.data.Products;
    if (products && products.length > 0) {
      const product = products[0];
      const price = product.Prices && product.Prices.length > 0 ? product.Prices[0].Value : null;
      const currency = product.Prices && product.Prices.length > 0 ? product.Prices[0].Currency : null;
      return {
        manufacturerPartNumber: product.ManufacturerPartNumber,
        manufacturer: product.Manufacturer,
        dataProvider: 'Element14',
        unitPrice: price ? convertCurrency(price, currency) : null
      };
    }
  } catch (error) {
    console.error('Error fetching data from Element14:', error);
    return null;
  }
};

const getRutronikData = async (partNumber, volume) => {
  try {
    const response = await axios.get(`https://www.rutronik24.com/api/search`, {
      params: {
        apikey: API_KEYS.rutronik,
        searchterm: partNumber
      }
    });
    const results = response.data;
    console.log("results :" , response.data);
    if (results && results.length > 0) {
      const result = results[0];
      return {
        manufacturerPartNumber: partNumber,
        manufacturer: result.manufacturer,
        dataProvider: 'Rutronik',
        unitPrice: result.price ? convertCurrency(result.price, 'EUR') : null
      };
    }
  } catch (error) {
    console.error('Error fetching data from Rutronik:', error);
    return null;
  }
};

app.post('/api/search', async (req, res) => {
  console.log('Request received:', req.body);
  const { partNumber, volume } = req.body;
  const results = [];

  const mouserData = await getMouserData(partNumber, volume);
  if (mouserData && mouserData.unitPrice !== null) {
    results.push({
      ...mouserData,
      volume,
      totalPrice: mouserData.unitPrice * volume
    });
  }

  const element14Data = await getElement14Data(partNumber, volume);
  if (element14Data && element14Data.unitPrice !== null) {
    results.push({
      ...element14Data,
      volume,
      totalPrice: element14Data.unitPrice * volume
    });
  }

  const rutronikData = await getRutronikData(partNumber, volume);
  if (rutronikData && rutronikData.unitPrice !== null) {
    results.push({
      ...rutronikData,
      volume,
      totalPrice: rutronikData.unitPrice * volume
    });
  }

  results.sort((a, b) => a.totalPrice - b.totalPrice);
  console.log(results);
  res.json(results);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
