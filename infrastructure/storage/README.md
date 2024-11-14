## Deployment of a Storage Account

It is possible to deploy a Storage Account to Microsoft Azure for the purpose of storing images

### Requirements

You need:

- The [Microsoft Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
  It is available for all major operating systems
- Access to an Azure subscription with sufficient permission levels

### Instructions

1. If you haven't already, login to the CLI with `az login`
2. Run `npm run azure:deploy-storage` and follow the prompts

### UNIX specifics

On UNIX-based OSs, you may have to grant yourself permission to run the script:

```bash
chmod +x ./infrastructure/storage/deploy-storage.sh
```
