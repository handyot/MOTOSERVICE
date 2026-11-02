/**
 * NERO Electric Motors - Base de Datos Geográfica Oficial de Perú (Departamentos, Provincias y Distritos)
 */

export interface PeruDepartment {
  name: string;
  provinces: {
    name: string;
    districts: string[];
  }[];
}

export {
  PERU_DEPARTMENTS,
  getDepartmentNames,
  getProvincesForDepartment,
  getDistrictsForProvince,
} from './peru-locations-core.mjs';
