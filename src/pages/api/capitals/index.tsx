import type { NextApiRequest, NextApiResponse } from 'next';
import { CountryGeoJsonData, CountryName } from '../countries';
import capitalContents from '@/data/capitals.json';
import citiesNames from '@/data/cities_name.json';
import countriesNames from '@/data/countries_name.json';


interface CapitalData {
  country: string,
  city: string | null,
}

interface CapitalResult extends CapitalData {
  result: string,
}

export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CapitalData[]>
) {

  const capitalData = capitalContents as CapitalData[];
  const citiesNameData = citiesNames as CountryName[];
  const countriesNameData = countriesNames as CountryName[];
  let capitalResult: CapitalResult[] = [];
  capitalData.forEach(data => {
    let result = {
      country: data.country,
      city: data.city,
      result: '',
    };

    if (countriesNameData.find(country => country.fullName.toLowerCase() === data.country.toLowerCase())) {
      if (citiesNameData.find(city => city.codeName == data.city?.toUpperCase())) {
        result.result = 'OK'
      }
      else {
        result.result = 'City not found';
      }
    }
    else {
      result.result = 'Country not found';
    }

    capitalResult = [...capitalResult, result];

  })

  res.status(200).json(capitalResult);
}
