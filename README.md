# xml-servicefile-parser

Parse `servicefile.xml` from stock Android pieces to create a script to restore to stock.

> Remember to *inspect* the created scripts before actually running them.


## Executable

### Building

1. `npm i` -> This will install the dependencies
2. Edit `settings.json` accordingly.
3. `npm run pkg` -> This will package the application with the configured settings.json

### Usage

1. Place alongside `servicefile.xml`.
2. Run executable.
> Be aware that the default executable creates `serviceScript.sh` and `serviceScript.bat`, so don't have any files of that name already. 
3. Inspect the scripts and use them as required.
