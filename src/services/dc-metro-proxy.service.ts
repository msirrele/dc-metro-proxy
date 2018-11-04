import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {DCMetroProxyDataSource} from '../datasources';
/**
 * Bus Incidents
 */
export interface BusIncident {
  getId: string;
  DateUpdated: string;
  Description: string;
  IncidentID: string;
  IncidentType: string;
  [RoutesAffected: string]: string;
}

export interface BusIncidents {
  incidents: [BusIncident];
}

export interface BusIncidentsResult {
  result: {
    BusIncidents: BusIncidents;
  }
}

export interface BusIncidentParameters {
  Route?: string;
}
/**
 * Train Position
 */
export interface TrainPosition {
  TrainId: string;
  CarCount: number;
  DirectionNum: number;
  CircuitId: number;
  DestinationStationCode: string;
  LineCode: string;
  SecondsAtLocation: number;
  ServiceType: string;
}

export interface TrainPositions {
  TrainPositions: [TrainPosition]
}

export interface TrainPositionsResult {
  results: {
    TrainPositions: TrainPositions
  }
}

export interface TrainPositionsParameters {
  contentType: string;
}

export interface DCMetroProxyService {
  getBusIncidents(args: BusIncidentParameters): Promise<BusIncidentsResult>;
  getLiveTrainPositions(args: TrainPositionsParameters): Promise<TrainPositionsResult>;
}

export class DCMetroProxyServiceProvider implements Provider<DCMetroProxyService> {
  constructor(
    // DCMetroProxy must match the name property in the datasource json file
    @inject('datasources.DCMetroProxy')
    protected dataSource: DCMetroProxyDataSource = new DCMetroProxyDataSource(),
  ) {}

  value(): Promise<DCMetroProxyService> {
    return getService(this.dataSource);
  }
}
