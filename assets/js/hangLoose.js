class hangLoose {
    
  constructor(pageGuid, storageName, storageKey, storageTableName, pageTitle) {
    this.pageGuid = pageGuid;
    this.storageName = storageName;
    this.storageKey = storageKey;
    this.storageTableName = storageTableName;
    this.pageTitle = pageTitle;

    this.init();
  }

  init() {
    var tableUri = 'https://' + this.storageName + '.table.core.windows.net/';
    this.tableService = AzureStorage.Table.createTableServiceWithSas(tableUri, this.storageKey);
  }

  async getCount() {
    return new Promise((resolve, reject) => {
        this.tableService.retrieveEntity(this.storageTableName, 'HangLoose', this.pageGuid, function(error, result, response){ 
          if(!error){
                resolve(result.Count._*1)
            }
            else {
              if (error.statusCode == 404) {
                resolve(0);
              }
              else {
                reject("Unable to retreive hang loose count");
              }
            }
        });
    });
  }

  async incrementCount() {
    return new Promise(async (resolve, reject) => {
      var newCount = await this.getCount() + 1;
      var e = {
          PartitionKey: {'_': 'HangLoose'},
          RowKey: {'_': this.pageGuid},
          Count: {'_': newCount},
          Title: {'_': this.pageTitle}
      };

      this.tableService.insertOrReplaceEntity(this.storageTableName, e, function(error, result, response) {
          if(error) {
            reject("Unable to increment hang loose count");
          } else {
              resolve(newCount);
          }
      });
    });
  }
}