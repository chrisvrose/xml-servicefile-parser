
const {parseString} = require('xml2js')
const fs = require('fs')

const settings = JSON.parse(fs.readFileSync("settings.json"))
console.log("Loaded configuration")
//console.log(settings)
//console.log(process.argv)
fs.readFile(settings.fileName,(err,data)=>{
    if(err){
        throw new Error(err.code,": Could not read file. Try again.:",err.name)
    }
    console.log(`Reading ${settings.fileName}`)
    parseString(data,(err,res)=>{
        if(err){
            throw new Error(err.code,": Error parsing file.:",err.name)
        }

        console.log(`Parsing ${settings.fileName}`)
        console.log("Model: ",res.flashing.header[0].phone_model[0].$.model)

        // Store steps
        const steps = res.flashing.steps[0]
        //console.log(steps.$.interface)
        if(steps.$.interface!=="AP") {
            throw new Error("Does not look like servicefile.xml. Aborting.")
        }
        let sScript = settings.scriptConfig.env[settings.defaultMode].preconfig + '\n'
        sScript+= `${settings.scriptConfig.env[settings.defaultMode].commentPre} Generated for ${res.flashing.header[0].phone_model[0].$.model} \n`
        steps.step.forEach(e=>{
            switch(e.$.operation){
                case "oem":
                case "getvar":
                    sScript += (`${settings.scriptConfig.general.command} ${e.$.operation} ${e.$.var}`) +'\n'
                    break;
                case "flash":
                    sScript += (`${settings.scriptConfig.general.command} ${e.$.operation} ${e.$.partition} ${e.$.filename}`) +'\n'
                    break;
                case "erase":
                    sScript += (`${settings.scriptConfig.general.command} ${e.$.operation} ${e.$.partition}`) +'\n'
                    break;
                default:
                    throw new Error(`Unkown: ${e.$.operation}`)
            }
        })
        fs.writeFile(settings.serviceScript+settings.scriptConfig.env[settings.defaultMode].extension,sScript,{mode:0o765},(err)=>{
            if(err){
                throw new Error(`${err.errno}: Error Writing Script: ${err.name}`)
            }
            console.log("Done")
        })
        //console.log(sScript)
    })
})
