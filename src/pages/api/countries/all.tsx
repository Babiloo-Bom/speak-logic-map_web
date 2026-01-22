// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import countryContents from '@/data/countries.json';
import { CountryStoreData } from '@/stores/CountryStore';
import { CountryGeoJsonData } from '.';

export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CountryStoreData[]>
) {
  // const countryContents = fs.readFileSync('public/countries.json', 'utf-8');
  const countryData = countryContents as CountryGeoJsonData;
  
  let countryResponse: CountryStoreData[] = [];

  countryData.features.forEach(country => {
    let data: CountryStoreData = {
      name: {
        fullName: country.properties.NAME,
        codeName: country.properties.CODE,
      },
      data: [{
        type: countryData.type,
        features: [country],
      }]
    }
    countryResponse.push(data);
  })

  res.status(200).json(countryResponse);
}
