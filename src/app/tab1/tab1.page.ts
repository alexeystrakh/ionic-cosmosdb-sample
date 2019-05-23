import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import * as Model from '../../models/todoItem';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public items: Model.Todo[];

  constructor(private http: HttpClient) {
    this.listCollections().catch(err => console.error(err));
  }

  async listCollections() {
    const cosmosHost = '<your_cosmosdb_instance>.documents.azure.com:443';
    const primaryKey = '<your_master_key>';
    const database = 'Tasks';
    const collection = 'Items';
    const resourceAction = 'get';
    const resourceType = 'docs';
    const resourceId = `dbs/${database}/colls/${collection}`;
    const requestUrl = `https://${cosmosHost}/${resourceId}/${resourceType}`;
    const headers = this.generateHttpHeaders(primaryKey, resourceAction, resourceType, resourceId);
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
