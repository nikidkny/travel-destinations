#!/usr/bin/env bash

NC='\033[0m'
YELLOW='\033[0;33m'
BYELLOW='\033[1;33m'
CYAN='\033[0;36m'

echo -e "
This script will let you create a new ${YELLOW}Storage Account${NC}"

echo -e "
${CYAN}Defining resource parameters...${NC}"

echo -e "
Please provide a name for the ${YELLOW}resource group${NC} where your ${BYELLOW}Storage Account${NC} will be deployed to.
For example: \"my-storage-resource-group\":
"

read -r RESOURCE_GROUP

echo -e "
Please provide a name for the ${YELLOW}Storage Account${NC}.
Use a minimum of ${BYELLOW}3${NC} and a maximum of ${BYELLOW}24 lowercase alphanumeric characters${NC}.
Make sure the name is reasonably unique; common names may already be taken.
For example: \"mystorageaccount\":
"

read -r STORAGE_ACCOUNT

echo -e "
${CYAN}Provisioning resources in Azure with Bicep...${NC}
"

az deployment sub create \
  --template-file ./infrastructure/storage/main.bicep \
  --name "$STORAGE_ACCOUNT" \
  --location swedencentral \
  --parameters \
    resourceGroupName="$RESOURCE_GROUP" \
    storageAccountName="$STORAGE_ACCOUNT"
