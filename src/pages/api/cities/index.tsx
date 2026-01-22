import type { NextApiRequest, NextApiResponse } from 'next';
import { CountryGeoJsonData, CountryName } from '../countries';
import { toTitleCase } from '@/utils/format_string_to_title';
import cityContents from '@/data/cities_name.json';


export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CountryName[]>
) {
  // const cityData = cityContents as CountryGeoJsonData;
  // let cityNameList: CountryName[] = [];
  // cityData.features.forEach(city => {
  //   let cityName: CountryName = {
  //     fullName: toTitleCase(city.properties.NAME),
  //     codeName: city.properties.NAME,
  //   }
  //   if (!cityNameList.find(currentCityName => currentCityName.codeName === cityName.codeName)) {
  //     cityNameList = [...cityNameList, cityName]
  //   }
  // })
  res.status(200).json(cityContents);
}
