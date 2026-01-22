// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import countryContents from '@/data/countries.json';
import { CountryData, CountryGeoJsonData, CountryName } from '.';
import * as turf from '@turf/turf';

export interface CountryMainCoordinates extends CountryName {
  mainCoordinates: number[];
}

export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CountryName>
) {

  const query = req.query;
  const { lat, lng } = query;
  let response: CountryName = {
    fullName: '',
    codeName: '',
  }
  const countryData = countryContents as CountryGeoJsonData;
  if (lat && typeof lat === 'string' && lng && typeof lng === 'string') {
    const point = turf.point([Number(lng), Number(lat)]);
    countryData.features.forEach(feature => {
      const countryName: CountryName = {
        fullName: feature.properties.NAME,
        codeName: feature.properties.CODE
      }
      if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach(coordinates => {
          const polygon = turf.polygon(coordinates as turf.Position[][]);
          if (turf.booleanPointInPolygon(point, polygon)) {
            response = countryName;
            return;
          }
        })
      }
      else {
        const polygon = turf.polygon(feature.geometry.coordinates as turf.Position[][]);
        if (turf.booleanPointInPolygon(point, polygon)) {
          response = countryName;
          return;
        }
      }
    })
  }

  res.status(200).json(response);
}
