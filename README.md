# REST DC Metro Proxy Web Service

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Assumptions

1. Have The Latest Version of [Node.js](https://nodejs.org/en/) which is LTS is 10.13.0
2. Have Loopback 4 CLI installed globally on your workstation
   `npm i -g @loopback/cli`
3. Have created an account and have an api_key to use the [WMATA API](https://developer.wmata.com/)

## Scaffold the LB4 App

### Use the lb4 CLI to generate the application

Run the following command:

`lb4 app dc-metro-proxy`

Change into the directory that you just created

`cd dc-metro-proxy`

Start that bad boy

`npm start`

## Add a Data Source

Two files will be created under src/datasources as well as the necessary connector and its dependencies with the following command

`lb4 datasource DCMetroProxy`

You the CLI allows you to enter information about the REST web service. Let's set the base URL for the DC Metro at least when asked. The rest we can do manually within the datasouce file

`https://api.wmata.com/`

With that we should now update our dc-metro-proxy.datasource.json file so that it looks like the following

```javascript
{
  "name": "DCMetroProxy",
  "connector": "rest",
  "baseURL": "https://api.wmata.com/",
  "options": {
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api_key": "add_api_key_here"
    },
    "strictSSL": false
  },
  "operations": [
    {
      "template": {
        "method": "GET",
        "url": "https://api.wmata.com/Incidents.svc/json/BusIncidents?Route={queriedRoute}"
      },
      "functions": {
        "getBusIncidents": [
          "queriedRoute"
        ]
      }
    },
    {
      "template": {
        "method": "GET",
        "url": "https://api.wmata.com/TrainPositions/TrainPositions?contentType={contentType}"
      },
      "functions": {
        "getLiveTrainPositions": [
          "contentType"
        ]
      }
    }
  ],
  "crud": false
}
```

As you can see we have done a couple significant things in this json file! We provided some options which the WMATA API is expecting and are making use of the env variable that we defined eariler. Next we an array of operations, which refer to an API endpoint that we are interested in. In the template property we describe the API, and in our functions property, we define the function we will use to call this API and pass it any arguments that our API expects. In this case, we are giving the user the ability to pass an argument, which will be part of the API path when called.

## Add a Service

We need to install @loopback/proxy-server to create the link between our .json and node method. Our service provider is how we make this connection. Run the following command in your terminal:

`npm install @loopback/service-proxy -—save`

Now lets create the service. When prompted, select our only datasource that we previously created.

`lb4 service DCMetroProxy`

Now lets hop into the service file that was just created for us. As you can see,  some imports were added for us, which we will need.

After looking at the WMATA documentation, I was able to identify some interfaces that we would need to define in our service. There are more that we can add if you wanted to use other APIs, but for now lets add the following interfaces under the imports in this file, making your file look like the following:

```javascript
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
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.
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
```

### Making the connection

Now we are able to update our `DCMetroProxyService` interface which describes the 2 methods that map to the REST operations. This interface should look like the following:

```javascript
export interface DCMetroProxyService {
  getBusIncidents(args: BusIncidentParameters): Promise<BusIncidentsResult>;
  getLiveTrainPositions(args: TrainPositionsParameters): Promise<TrainPositionsResult>;
}
```

### Service Provider Class

Since we used the lb4 cli, our service provider class was set up for us! As we have just seen, our `DCMetroProxyService` describes our methods. With the help of proxy-server and the corresponding rest-connector, the implementation of the methods happen by calling the remote REST operations!

## Add an EMPTY Controller

`lb4 controller DCMetroProxy`

Make sure to select the empty controller option. When finished you should have an empty controller that we can now use to make our REST endpoints avaliable to client applications. As we can imagine, we will need to add some imports to get this working. Update your file with the following imports

```javascript
import {inject} from '@loopback/core';
import {get, param, HttpErrors} from '@loopback/rest';
```

In addition lets import service and interfaces we just finished modeling. Your file should now include the following below the imports above:

```javascript
import {
  BusIncidentsResult,
  BusIncidentParameters,
  DCMetroProxyService,
  TrainPositionsResult,
  TrainPositionsParameters
} from '../services/dc-metro-proxy.service';
```

### Injecting the Service into the Controller via the constructor

```javascript
  constructor(
    @inject('services.MetroProxyService')
    protected dcMetroProxyService: DCMetroProxyService
  ) { }
```

Now lets add our bus incidents and live train positions end points! Also, we can see that we are able to provide type assertion using both `<BusIncidentParameters>` and `<TrainPositionsParameters>`.

Now if we update each with the @get decorator we are making it avaliable to the REST server:

```javascript
  @get('/bus-incidents/{route}')
  async getBusIncidents(
     Route: string
  ): Promise<BusIncidentsResult> {
    return await this.dcMetroProxyService.getBusIncidents(<BusIncidentParameters>{
      Route
    });
  }

  @get('/live-train-positions/{contentType}')
  async getLiveTrainPositions(
    contentType: string
  ): Promise<TrainPositionsResult> {
    return await this.dcMetroProxyService.getLiveTrainPositions(<TrainPositionsParameters>{
      contentType
    });
  }
```

Finally we can add the params decorator to help validate the data type of the paramaters. This restricts the client in what can be sent to the web service we are utilizing:

```javascript
  @get('/bus-incidents/{route}')
  async getBusIncidents(
    @param.path.string('route') Route: string
  ): Promise<BusIncidentsResult> {
    return await this.dcMetroProxyService.getBusIncidents(<BusIncidentParameters>{
      Route
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
```

### Run the application with `npm start` and give it for a spin :)
