# xml-servicefile-parser

Parse `servicefile.xml`/`flashfile.xml` from stock Android pieces to create a script to restore to stock.

> Remember to *inspect* the created scripts before actually running them.


## NPM

### Usage



## Executable

### Building

1. `npm i` -> This will install the dependencies
2. Edit `settings.json` accordingly.
3. `npm run pkg` -> This will package the application with the configured settings.json

### Usage

#### Option 1

1. Place alongside `servicefile.xml`.
2. Run executable. On Windows, double click. On Linux, do `chmod +x <filename>` then `./<filename>`
> Be aware that the default executable creates `serviceScript.sh` and `serviceScript.bat`, so don't have any files of that name already. 
3. Inspect the scripts and use them as required.

#### Option 2

1. Run it passing the filename as the second argument
