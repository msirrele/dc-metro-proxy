import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './dc-metro-proxy.datasource.json';

export class DCMetroProxyDataSource extends juggler.DataSource {
  static dataSourceName = 'DCMetroProxy';

  constructor(
    @inject('datasources.config.DCMetroProxy', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
