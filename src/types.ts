export interface LaunchMission {
  id: string;
  name: string;
  vehicle: string;
  booster?: string;
  dateString: string;
  targetDate: Date;
  site: string;
  orbit: string;
  customer: string;
  payloadMass?: string;
  recovery: string;
  status: 'GO' | 'SCHEDULED' | 'SUCCESSFUL';
  patchUrl?: string;
  description: string;
  streamUrl?: string;
  estimatedContractValue?: string;
  assetBackingImpact?: string;
}

export interface VehicleRwaEconomics {
  assetClass: string;
  instrumentType: string;
  spvJurisdiction: string;
  commercialValuePerLaunch: string;
  economicRightsSummary: string;
  robinhoodChainToken: string;
  custodianVerification: string;
}

export interface VehicleSpec {
  id: 'starship' | 'falcon9' | 'falcon-heavy' | 'dragon';
  name: string;
  tagline: string;
  heightMetric: number;
  heightImperial: number;
  diameterMetric: number;
  diameterImperial: number;
  massMetric: number;
  massImperial: number;
  stages: number;
  payloadLeoMetric: number;
  payloadLeoImperial: number;
  payloadGtoMetric?: number;
  payloadGtoImperial?: number;
  payloadMarsMetric?: number;
  payloadMarsImperial?: number;
  engines: {
    firstStage: {
      type: string;
      count: number;
      thrustSeaLevelMetric: number;
      thrustSeaLevelImperial: number;
    };
    secondStage: {
      type: string;
      count: number;
      thrustVacuumMetric: number;
      thrustVacuumImperial: number;
    };
  };
  totalLaunches: number;
  totalLandings: number;
  totalReflights: number;
  overview: string;
  features: string[];
  rwaEconomics: VehicleRwaEconomics;
}
