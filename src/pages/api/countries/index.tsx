import type { NextApiRequest, NextApiResponse } from 'next';
import { GeoJSONObject } from "@turf/helpers";
import countryContents from '@/data/countries_name.json';
// import countryContents from '@/data/countries.json';

export interface CountryGeoJsonFeaturesData {
  type: string,
  properties: {
    NAME: string,
    CODE: string,
  },
  geometry: {
    type: string,
    coordinates: number[][][] | number[][][][],
  }
}

export interface CountryGeoJsonData {
  type: string,
  features: CountryGeoJsonFeaturesData[],
}

export interface CountryData extends GeoJSONObject{
  features: CountryGeoJsonFeaturesData[],
}

export interface CountryName {
  fullName: string,
  codeName: string,
}

export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CountryName[]>
) {
  // const countryData = countryContents as CountryGeoJsonData;
  // let countryNameList: CountryName[] = [];
  // countryData.features.forEach(country => {
  //   if (!country.properties.CODE.includes('-99')) {
  //     let countryName: CountryName = {
  //       fullName: country.properties.NAME,
  //       codeName: country.properties.CODE,
  //     }
  //     countryNameList = [...countryNameList, countryName]
  //   }
    
  // })
  // res.status(200).json(countryNameList);
  res.status(200).json(countryContents);

}
