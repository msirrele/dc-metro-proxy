import { inject } from '@loopback/core';
import { get, param, HttpErrors } from '@loopback/rest';

import {
  BusIncidentsResult,
  BusIncidentParameters,
  DCMetroProxyService,
  TrainPositionsResult,
  TrainPositionsParameters
} from '../services/dc-metro-proxy.service';


export class DCMetroProxyController {
  constructor(
    @inject('services.DCMetroProxyService')
    protected dcMetroProxyService: DCMetroProxyService
  ) { }

  @get('/bus-incidents/{route}')
  async getBusIncidents(
    @param.path.string('route') queriedRoute: string
  ): Promise<BusIncidentsResult> {
    return await this.dcMetroProxyService.getBusIncidents(<BusIncidentParameters>{
      queriedRoute
    });
  }

  @get('/live-train-positions/{contentType}')
  async getLiveTrainPositions(
    @param.path.string('contentType') contentType: string
  ): Promise<TrainPositionsResult> {
    return await this.dcMetroProxyService.getLiveTrainPositions(<TrainPositionsParameters>{
      contentType
    });
  }
}
