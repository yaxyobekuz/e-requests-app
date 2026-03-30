// Components
import NavoiMap from "../NavoiMap";
import AndijanMap from "../AndijanMap";
import BukharaMap from "../BukharaMap";
import FerganaMap from "../FerganaMap";
import JizzakhMap from "../JizzakhMap";
import KhorezmMap from "../KhorezmMap";
import SyrdaryaMap from "../SyrdaryaMap";
import NamanganMap from "../NamanganMap";
import TashkentMap from "../TashkentMap";
import SamarkandMap from "../SamarkandMap";
import KashkadaryaMap from "../KashkadaryaMap";
import TashkentCityMap from "../TashkentCityMap";
import SurkhandaryaMap from "../SurkhandaryaMap";
import KarakalpakstanMap from "../KarakalpakstanMap";

// Data
import navoiDistricts from "./navoi.data";
import andijanDistricts from "./andijan.data";
import bukharaDistricts from "./bukhara.data";
import ferganaDistricts from "./fergana.data";
import jizzakhDistricts from "./jizzakh.data";
import khorezmDistricts from "./khorezm.data";
import syrdaryaDistricts from "./syrdarya.data";
import namanganDistricts from "./namangan.data";
import tashkentDistricts from "./tashkent.data";
import samarkandDistricts from "./samarkand.data";
import kashkadaryaDistricts from "./kashkadarya.data";
import surkhandaryaDistricts from "./surkhandarya.data";
import tashkentCityDistricts from "./tashkentCity.data";
import karakalpakstanDistricts from "./karakalpakstan.data";

const uzbekistanRegions = [
  {
    component: AndijanMap,
    districts: andijanDistricts,
    label: "Andijon viloyati",
  },
  {
    component: BukharaMap,
    districts: bukharaDistricts,
    label: "Buxoro viloyati",
  },
  {
    component: FerganaMap,
    districts: ferganaDistricts,
    label: "Farg'ona viloyati",
  },
  {
    component: JizzakhMap,
    districts: jizzakhDistricts,
    label: "Jizzax viloyati",
  },
  {
    component: NamanganMap,
    districts: namanganDistricts,
    label: "Namangan viloyati",
  },
  {
    component: NavoiMap,
    districts: navoiDistricts,
    label: "Navoiy viloyati",
  },
  {
    component: KashkadaryaMap,
    districts: kashkadaryaDistricts,
    label: "Qashqadaryo viloyati",
  },
  {
    component: KarakalpakstanMap,
    districts: karakalpakstanDistricts,
    label: "Qoraqalpog'iston Respublikasi",
  },
  {
    component: SamarkandMap,
    districts: samarkandDistricts,
    label: "Samarqand viloyati",
  },
  {
    component: SyrdaryaMap,
    districts: syrdaryaDistricts,
    label: "Sirdaryo viloyati",
  },
  {
    component: SurkhandaryaMap,
    districts: surkhandaryaDistricts,
    label: "Surxondaryo viloyati",
  },
  {
    component: TashkentCityMap,
    districts: tashkentCityDistricts,
    label: "Toshkent Shahri",
  },
  {
    component: TashkentMap,
    districts: tashkentDistricts,
    label: "Toshkent viloyati",
  },
  {
    component: KhorezmMap,
    districts: khorezmDistricts,
    label: "Xorazm viloyati",
  },
];

export const getRegionByLabel = (label) => {
  const finded = uzbekistanRegions.find(
    (region) =>
      region.label.trim().toLowerCase() === label?.trim().toLowerCase(),
  );
  return finded || uzbekistanRegions[0];
};

export const getDistrictByLabel = (regionLabel, districtLabel) => {
  const region = uzbekistanRegions.find(
    (r) => r.label.trim().toLowerCase() === regionLabel?.trim().toLowerCase(),
  );
  const districts = region?.districts || [];
  return districts.find(
    (d) => d.label.trim().toLowerCase() === districtLabel?.trim().toLowerCase(),
  );
};

export default uzbekistanRegions;
