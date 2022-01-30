const { parseString } = require('xml2js');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

// load in settings
console.log('Loading configuration: settings.json');
const settings = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'settings.json'))
);

// Assert everything is alright with the settings
assert(
    typeof settings?.scriptConfig?.general?.command === 'string',
    'Expected command'
);
assert(
    Array.isArray(settings?.scriptConfig?.env),
    'Expected an array of environment statuses'
);
assert(typeof settings?.fileName === 'string', 'Expected a filename');
assert(
    typeof settings?.serviceScript === 'string',
    'Expected a result filename'
);

/** @type {string} */
const fastbootCommand = settings.scriptConfig.general.command;

/** Input File Name used for config */
const filePathString = process.argv[2] ?? settings.fileName;
/** Where the input file is located */
const fileDirPath = path.dirname(filePathString);

console.log('Loaded configuration');

fs.readFile(filePathString, (err, data) => {
    if (err) {
        throw new Error(
            `${err.code}: Could not read file. Try again. ${err.name}`
        );
    }
    console.log(`Reading ${filePathString}`);
    parseString(data, (err, res) => {
        if (err) {
            throw new Error(`${err.code}: Error parsing file. :${err.name}`);
        }

        console.log(`Parsed ${filePathString}`);
        assert(
            typeof res?.flashing?.header?.[0]?.phone_model[0]?.$?.model ===
                'string',
            'Expected a model number'
        );
        console.log('Model: ', res.flashing.header[0].phone_model[0].$.model);

        assert(
            Array.isArray(res?.flashing?.steps),
            'Expected steps to be an array!'
        );
        // Store steps
        const steps = res.flashing.steps[0];
        //console.log(steps.$.interface)
        assert(steps?.$?.interface === 'AP', 'Expected an Interface of AP');
        // if (steps.$.interface !== "AP") {
        //     throw new Error("Does not look like servicefile.xml. Aborting.");
        // }
        //settings.scriptConfig.env[settings.defaultMode].preconfig + '\n'
        //sScript+= `${settings.scriptConfig.env[settings.defaultMode].commentPre} Generated for ${res.flashing.header[0].phone_model[0].$.model} \n`
        const sScript = steps.step.reduce((t, e) => {
            switch (e.$.operation) {
                case 'oem':
                case 'getvar':
                    t += `${fastbootCommand} ${e.$.operation} ${e.$.var}\n`;
                    break;
                case 'flash':
                    t += `${fastbootCommand} ${e.$.operation} ${e.$.partition} ${e.$.filename}\n`;
                    break;
                case 'erase':
                    t += `${fastbootCommand} ${e.$.operation} ${e.$.partition} \n`;
                    break;
                default:
                    throw new Error(`Unkown: ${e.$.operation}`);
            }
            return t;
        }, '');

        //Write the data down
        settings.scriptConfig.env.forEach((e) => {
            // add some spice to the script that is required
            const data =
                e.preConfig +
                `\n${e.commentPre} Generated for ${res.flashing.header[0].phone_model[0].$.model} \n` +
                sScript;

            const outputFileName = settings.serviceScript + e.extension;
            /** Output file full path */
            const resFileLocation = path.join(fileDirPath, outputFileName);
            // write it down
            fs.writeFile(resFileLocation, data, { mode: 0o765 }, (err) => {
                if (err) {
                    throw new Error(
                        `${err.errno}: Error Writing Script: ${err.name}`
                    );
                }
                console.log(`Done: ${settings.serviceScript + e.extension}`);
            });
        });
    });
});
