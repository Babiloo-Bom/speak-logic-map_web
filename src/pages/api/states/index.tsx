import type { NextApiRequest, NextApiResponse } from 'next';
import { CountryGeoJsonData, CountryName } from '../countries';
import stateContents from '@/data/states_name.json';


export default function handler (
  req: NextApiRequest,
  res: NextApiResponse<CountryName[]>
) {
  // const stateData = stateContents as CountryGeoJsonData;
  // let stateNameList: CountryName[] = [];
  // stateData.features.forEach(state => {
  //   let stateName: CountryName = {
  //     fullName: state.properties.NAME,
  //     codeName: state.properties.CODE,
  //   }
  //   stateNameList = [...stateNameList, stateName]
  // })
  res.status(200).json(stateContents);
}
