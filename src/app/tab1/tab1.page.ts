import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import * as Model from '../../models/todoItem';
import * as Cosmos from '@azure/cosmos';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  // Config
  private readonly cosmosHost = '<your_cosmosdb_instance>.documents.azure.com:443>';
  private readonly primaryKey = '<your_master_key>';
  private readonly database = 'Tasks';
  private readonly collection = 'Items';

  // State
  public items: Model.Todo[];

  constructor(private http: HttpClient) {
    this.listCollectionsUsingRESTApi().catch(err => console.error(err));
    // this.listCollectionsUsingCosmosSDK().catch(err => console.error(err));
  }

  async listCollectionsUsingCosmosSDK() {
    const CosmosClient = Cosmos.CosmosClient;
    const client = new CosmosClient({ endpoint: this.cosmosHost, auth: { masterKey: this.primaryKey } });
    console.warn(`client: ${client}`);

    // tab1.page.ts:25 TypeError: os.platform is not a function
    const db = await client.database(this.database);
    console.warn(`database: ${db}`);
  }

  async listCollectionsUsingRESTApi() {
    const resourceAction = 'get';
    const resourceType = 'docs';
    const resourceId = `dbs/${this.database}/colls/${this.collection}`;
    const requestUrl = `https://${this.cosmosHost}/${resourceId}/${resourceType}`;
    const headers = this.generateHttpHeaders(this.primaryKey, resourceAction, resourceType, resourceId);
    const response = await this.http.get<Model.TodoCollection>(requestUrl, { headers }).toPromise();
    console.log(response);

    this.items = response.Documents;
    console.log('items received!');
  }

  generateHttpHeaders(masterKey, verb, resType, resourceId): HttpHeaders {
    const today = new Date();
    const utcString = today.toUTCString();
    const date = utcString.toLowerCase();
    const key = CryptoJS.enc.Base64.parse(masterKey);
    const text = (verb || '').toLowerCase() + '\n' +
      (resType || '').toLowerCase() + '\n' +
      (resourceId || '') + '\n' +
      (date || '').toLowerCase() + '\n' +
      '' + '\n';
    const signature = CryptoJS.HmacSHA256(text, key);
    const base64Bits = CryptoJS.enc.Base64.stringify(signature);
    const MasterToken = 'master';
    const TokenVersion = '1.0';
    const auth = encodeURIComponent(`type=${MasterToken}&ver=${TokenVersion}&sig=${base64Bits}`);
    const headers = new HttpHeaders({
      Authorization: auth,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      'x-ms-version': '2016-07-11',
      'x-ms-date': utcString
    });

    return headers;
  }
}
