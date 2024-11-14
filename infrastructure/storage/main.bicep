targetScope = 'subscription'

/* Suggestions:
  'germanynorth ~ 15-20ms  <-- NOT AVAILABLE'
  'westeurope ~ 20-27ms avg. price 1.46 USD/h <-- BEST'
  'swedencentral ~ 20-27ms avg. price 1.18 USD/h <-- BEST'
  'francecentral ~ 34-38ms'
  'italynorth ~ 35-39ms'
  'uksouth ~ 36-41ms'
  'ukwest ~ 38-43ms'
  'polandcentral ~ 40-45ms'
  'northeurope ~ 40-45ms'
*/
@description('The location where all resources will be deployed')
param location string = 'swedencentral'

@description('Name of the resource group which will encapsulate everything in this deployment')
param resourceGroupName string

@description('The name of the Storage Account for this deployment; 3-24 lowercase alphanumeric characters')
param storageAccountName string

@description('Tags which will be applied to the resource')
var tags = { 'managed-by': 'bicep' }

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module storageAccount 'modules/storage-account.bicep' = {
  scope: resourceGroup
  name: 'storageAccount'
  params: {
    location: location
    storageAccountName: storageAccountName
    tags: tags
  }
}
