// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import countryContents from '@/data/countries.json';
import { CountryStoreData } from '@/stores/CountryStore';
import { CountryData, CountryGeoJsonData, CountryName } from '.';
import { getGeoMainLand } from '@/utils/get_geo_mainland';
import * as turf from '@turf/turf';

export interface CountryMainCoordinates extends CountryName {
  mainCoordinates: number[];
}

export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CountryMainCoordinates[]>
) {
  // const countryContents = fs.readFileSync('public/countries.json', 'utf-8');
  const countryData = countryContents as CountryGeoJsonData;
  
  let countryResponse: CountryMainCoordinates[] = [];

  countryData.features.forEach(country => {
    const singleCountryData: CountryData = {
      type: countryData.type,
      features: [country]
    }
    const geoMainLand = getGeoMainLand(singleCountryData);

    const centroid = turf.centroid(geoMainLand);

    centroid.geometry.coordinates.reverse();

    let data: CountryMainCoordinates = {
      fullName: country.properties.NAME,
      codeName: country.properties.CODE,
      mainCoordinates: centroid.geometry.coordinates
    }
    countryResponse.push(data);
  })

  res.status(200).json(countryResponse);
}
